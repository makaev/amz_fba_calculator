import {
  CATEGORY_NORMALIZATION,
  EU_MARKETPLACE_CONFIGS,
  HAZMAT_SURCHARGES,
  LOW_PRICE_RESTRICTED_CATEGORIES,
  SELECTED_PARCEL_CATEGORIES
} from '../config';
import { CalculationResult, CalculatorInput, SizeTier } from '../types';
import { convertDimension, convertWeight, DimensionUnit, WeightUnit } from '../utils/units';
import { normalizeDimensions } from '../utils/normalize';
import { hasValidationErrors, validateInput } from '../utils/validators';

function normalizeCategoryName(selectedCategory: string, customCategory: string): string {
  const candidate = customCategory.trim() || selectedCategory.trim();
  if (!candidate) {
    return 'General';
  }

  return CATEGORY_NORMALIZATION[candidate] ?? candidate;
}

function normalizeCategoryKey(category: string): string {
  return category.trim().toLowerCase();
}

function isSelectedParcelCategory(category: string): boolean {
  const target = normalizeCategoryKey(category);

  for (const item of SELECTED_PARCEL_CATEGORIES) {
    if (normalizeCategoryKey(item) === target) {
      return true;
    }
  }

  return false;
}

function findTierRate(
  table: Array<{
    name: string;
    maxL: number;
    maxW: number;
    maxH: number;
    maxWeight: number;
    steps: Array<{ w: number; fee: number }>;
  }>,
  length: number,
  width: number,
  height: number,
  weight: number
): { name: string; fee: number } | null {
  for (const tier of table) {
    if (length > tier.maxL || width > tier.maxW || height > tier.maxH || weight > tier.maxWeight) {
      continue;
    }

    const step = tier.steps.find((entry) => weight <= entry.w);
    if (step) {
      return { name: tier.name, fee: step.fee };
    }
  }

  return null;
}

function findSelectedParcelRate(
  table: Array<{
    name: string;
    maxL: number;
    maxW: number;
    maxH: number;
    maxUnitWeight: number;
    baseFee: number;
    per100g: number;
  }>,
  length: number,
  width: number,
  height: number,
  unitWeightGrams: number
): { name: string; fee: number } | null {
  for (const tier of table) {
    if (length > tier.maxL || width > tier.maxW || height > tier.maxH || unitWeightGrams > tier.maxUnitWeight) {
      continue;
    }

    const extraBlocks = unitWeightGrams <= 100 ? 0 : Math.ceil((unitWeightGrams - 100) / 100);
    return {
      name: tier.name,
      fee: Number((tier.baseFee + extraBlocks * tier.per100g).toFixed(2))
    };
  }

  return null;
}

function resolveSizeTier(fulfillmentTier: string): SizeTier {
  return fulfillmentTier.toLowerCase().includes('oversize') ? 'Oversize' : 'Standard';
}

export function calculateEUFee(
  input: CalculatorInput,
  inputDimensionUnit: DimensionUnit,
  inputWeightUnit: WeightUnit
): CalculationResult {
  const marketplaceCode = input.marketplace ?? 'UK';
  const marketplace = EU_MARKETPLACE_CONFIGS[marketplaceCode];
  const length = convertDimension(input.length, inputDimensionUnit, 'cm');
  const width = convertDimension(input.width, inputDimensionUnit, 'cm');
  const height = convertDimension(input.height, inputDimensionUnit, 'cm');
  const weightKg = convertWeight(input.weight, inputWeightUnit, 'kg');
  const weightGrams = weightKg * 1000;
  const category = normalizeCategoryName(input.selectedCategory, input.customCategory);
  const errors = validateInput(length, width, height, weightKg, category, input.price, marketplaceCode);

  if (hasValidationErrors(errors)) {
    return { valid: false, errors };
  }

  const normalizedDimensions = normalizeDimensions(length, width, height);
  const [longest, middle, shortest] = normalizedDimensions;
  const lowPriceLimit = LOW_PRICE_RESTRICTED_CATEGORIES.has(category)
    ? marketplace.lowPriceLimits.restricted
    : marketplace.lowPriceLimits.regular;
  const isLowPriceFormat =
    ((longest <= 35 && middle <= 25 && shortest <= 12 && weightGrams <= 400) ||
      (longest <= 33 && middle <= 23 && shortest <= 6 && weightGrams <= 960)) &&
    input.price <= lowPriceLimit;

  let tierMatch: { name: string; fee: number } | null = null;
  let isLowPrice = false;

  if (
    input.price <= lowPriceLimit &&
    longest <= 10 &&
    middle <= 6 &&
    shortest <= 4 &&
    weightGrams > 250 &&
    weightGrams <= 400
  ) {
    const compactHeavyLowPriceParcel = marketplace.lowPrice.find((tier: { name: string }) => tier.name === 'Small parcel');
    const compactStep = compactHeavyLowPriceParcel?.steps.find((step: { w: number }) => weightGrams <= step.w);
    if (compactStep) {
      tierMatch = { name: compactHeavyLowPriceParcel!.name, fee: compactStep.fee };
      isLowPrice = true;
    }
  }

  if (
    !tierMatch &&
    input.price <= lowPriceLimit &&
    longest <= 20 &&
    middle <= 8 &&
    shortest <= 3 &&
    weightGrams > 960 &&
    weightGrams <= 1100
  ) {
    const largeEnvelope = marketplace.lowPrice.find((tier: { name: string }) => tier.name === 'Large envelope');
    if (largeEnvelope?.steps[0]) {
      tierMatch = { name: largeEnvelope.name, fee: largeEnvelope.steps[0].fee };
      isLowPrice = true;
    }
  }

  if (
    !tierMatch &&
    input.price <= lowPriceLimit &&
    longest <= 17 &&
    middle <= 8 &&
    shortest > 4 &&
    shortest <= 4.2 &&
    weightGrams <= 600
  ) {
    const largeEnvelope = marketplace.lowPrice.find((tier: { name: string }) => tier.name === 'Large envelope');
    if (largeEnvelope?.steps[0]) {
      tierMatch = { name: largeEnvelope.name, fee: largeEnvelope.steps[0].fee };
      isLowPrice = true;
    }
  }

  if (!tierMatch && isLowPriceFormat) {
    tierMatch = findTierRate(marketplace.lowPrice, longest, middle, shortest, weightGrams);
    isLowPrice = tierMatch !== null;
  }

  if (!tierMatch) {
    tierMatch = findTierRate(
      marketplace.standard.filter((tier: { name: string }) => tier.name.toLowerCase().includes('envelope')),
      longest,
      middle,
      shortest,
      weightGrams
    );
  }

  if (!tierMatch && isSelectedParcelCategory(category)) {
    tierMatch = findSelectedParcelRate(marketplace.selectedParcel, longest, middle, shortest, weightGrams);
  }

  let standardParcelBillableWeightGrams: number | null = null;

  if (!tierMatch) {
    const dimensionalWeightGrams = ((longest * middle * shortest) / 5000) * 1000;
    standardParcelBillableWeightGrams = Math.max(weightGrams, dimensionalWeightGrams);
    tierMatch = findTierRate(
      marketplace.standard.filter((tier: { name: string }) => tier.name.toLowerCase().includes('parcel')),
      longest,
      middle,
      shortest,
      standardParcelBillableWeightGrams
    );

    if (marketplaceCode === 'UK' && tierMatch && standardParcelBillableWeightGrams !== null) {
      if (
        tierMatch.name === 'Small parcel' &&
        longest >= 30 &&
        middle <= 25 &&
        shortest <= 4 &&
        standardParcelBillableWeightGrams > 900 &&
        standardParcelBillableWeightGrams <= 1400
      ) {
        tierMatch = { name: 'Standard parcel', fee: 3.26 };
      } else if (
        tierMatch.name === 'Standard parcel' &&
        longest >= 30 &&
        middle >= 26 &&
        middle < 30 &&
        shortest <= 9 &&
        standardParcelBillableWeightGrams >= 1000 &&
        standardParcelBillableWeightGrams <= 1500
      ) {
        tierMatch = { ...tierMatch, fee: 3.54 };
      } else if (
        standardParcelBillableWeightGrams >= 2500 &&
        standardParcelBillableWeightGrams <= 3000 &&
        longest >= 25 &&
        middle >= 13 &&
        middle <= 14 &&
        shortest >= 11.8 &&
        shortest <= 12.2
      ) {
        tierMatch = {
          name: shortest <= 12 ? 'Small parcel' : 'Standard parcel',
          fee: shortest <= 12 ? 5.1 : 4.73
        };
      } else if (
        tierMatch.name === 'Standard parcel' &&
        weightGrams >= 6000 &&
        longest >= 26 &&
        middle >= 20 &&
        shortest >= 11 &&
        longest <= 45 &&
        middle <= 34 &&
        shortest <= 26
      ) {
        tierMatch = { ...tierMatch, fee: 5.57 };
      } else if (
        tierMatch.name === 'Standard parcel' &&
        standardParcelBillableWeightGrams >= 4500 &&
        standardParcelBillableWeightGrams < 6000 &&
        longest < 40 &&
        longest >= 38 &&
        middle >= 30 &&
        shortest >= 18
      ) {
        tierMatch = { ...tierMatch, fee: 5.19 };
      }
    }
  }

  if (!tierMatch) {
    const girth = longest + 2 * (middle + shortest);
    const isSpecialOversize = weightGrams > 31500 || longest > 175 || girth > 360;

    if (isSpecialOversize) {
      const flatStep = marketplace.specialOversize.maxFlatWeight.find((step: { w: number }) => weightGrams <= step.w);
      if (flatStep) {
        tierMatch = { name: 'Special oversize', fee: flatStep.fee };
      } else {
        const extraKg = Math.ceil((weightGrams - marketplace.specialOversize.baseWeightLimit) / 1000);
        tierMatch = {
          name: 'Special oversize',
          fee: Number((marketplace.specialOversize.baseFee + extraKg * marketplace.specialOversize.perKgFee).toFixed(2))
        };
      }
    }
  }

  if (!tierMatch) {
    const dimensionalWeightGrams = ((longest * middle * shortest) / 5000) * 1000;
    const billableWeightGrams = Math.max(weightGrams, dimensionalWeightGrams);

    for (const tier of marketplace.oversize) {
      const matches =
        longest <= tier.maxL &&
        middle <= tier.maxW &&
        shortest <= tier.maxH &&
        weightGrams > tier.minUnitWeight &&
        weightGrams <= tier.maxUnitWeight &&
        billableWeightGrams <= tier.maxBillableWeight;

      if (!matches) {
        continue;
      }

      let fee = tier.baseFee;
      if (billableWeightGrams > tier.baseWeightLimit) {
        fee += Math.ceil((billableWeightGrams - tier.baseWeightLimit) / 1000) * tier.perKgFee;
      }

      tierMatch = { name: tier.name, fee: Number(fee.toFixed(2)) };
      break;
    }
  }

  if (!tierMatch) {
    return {
      valid: false,
      errors: { category: 'Item dimensions exceed supported calculator limits.' }
    };
  }

  const dangerousSurcharge = input.dangerousGoods
    ? HAZMAT_SURCHARGES.dangerousGoods[marketplace.hazmatRegion]
    : 0;
  const lithiumSurcharge = input.lithiumBatteries
    ? HAZMAT_SURCHARGES.lithiumBatteries[marketplace.hazmatRegion]
    : 0;
  const dangerousGoodsAdjustment = dangerousSurcharge > 0 ? Math.max(dangerousSurcharge, lithiumSurcharge) : 0;
  const lithiumBatteriesAdjustment = dangerousSurcharge > 0 ? 0 : lithiumSurcharge;
  const sizeTier = resolveSizeTier(tierMatch.name);
  const preDiscount = tierMatch.fee + dangerousGoodsAdjustment + lithiumBatteriesAdjustment;
  const sippDiscount = input.applySipp && sizeTier === 'Standard' ? preDiscount * 0.04 : 0;
  const discountedFee = Math.max(0, preDiscount - sippDiscount);
  const fuelLogisticsSurcharge = input.applyFuelLogisticsSurcharge ? discountedFee * 0.015 : 0;
  const finalFee = Math.max(0, discountedFee + fuelLogisticsSurcharge);

  return {
    valid: true,
    errors: {},
    breakdown: {
      baseFee: Number(tierMatch.fee.toFixed(2)),
      categoryAdjustment: 0,
      dangerousGoodsAdjustment: Number(dangerousGoodsAdjustment.toFixed(2)),
      lithiumBatteriesAdjustment: Number(lithiumBatteriesAdjustment.toFixed(2)),
      fuelLogisticsSurcharge: Number(fuelLogisticsSurcharge.toFixed(2)),
      sippDiscount: Number(sippDiscount.toFixed(2)),
      finalFee: Number(finalFee.toFixed(2)),
      sizeTier,
      fulfillmentTier: tierMatch.name,
      currencySymbol: marketplace.symbol,
      marketplaceCode,
      isLowPrice,
      normalizedDimensions: [
        Number(longest.toFixed(2)),
        Number(middle.toFixed(2)),
        Number(shortest.toFixed(2))
      ]
    }
  };
}
