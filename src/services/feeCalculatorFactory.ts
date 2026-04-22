import { CalculationResult, RegionFeeConfig, SizeTier } from '../types';
import { normalizeCategory, normalizeDimensions } from '../utils/normalize';
import { hasValidationErrors, validateInput } from '../utils/validators';

function determineSizeTier(
  normalizedDimensions: [number, number, number],
  weight: number,
  config: RegionFeeConfig
): SizeTier {
  const [l, w, h] = normalizedDimensions;
  const [maxL, maxW, maxH] = config.standardMaxDimensions;

  const isStandard = l <= maxL && w <= maxW && h <= maxH && weight <= config.standardMaxWeight;
  return isStandard ? 'Standard' : 'Oversize';
}

function resolveBaseFee(weight: number, sizeTier: SizeTier, config: RegionFeeConfig): number {
  const brackets = sizeTier === 'Standard' ? config.baseFees.standard : config.baseFees.oversize;
  const found = brackets.find((entry) => weight <= entry.maxWeight);

  if (!found) {
    return brackets[brackets.length - 1]?.fee ?? 0;
  }

  return found.fee;
}

function resolveCategoryAdjustment(category: string, config: RegionFeeConfig): number {
  const categoryRule = config.categoryRules.find(
    (rule) => rule.name.toLowerCase() === category.toLowerCase()
  );

  return categoryRule?.adjustment ?? 0;
}

export function calculateFeeFromConfig(
  length: number,
  width: number,
  height: number,
  weight: number,
  price: number,
  selectedCategory: string,
  customCategory: string,
  dangerousGoods: boolean,
  lithiumBatteries: boolean,
  applySipp: boolean,
  config: RegionFeeConfig
): CalculationResult {
  const resolvedCategory = normalizeCategory(selectedCategory, customCategory);
  const errors = validateInput(length, width, height, weight, resolvedCategory, price);

  if (hasValidationErrors(errors)) {
    return { valid: false, errors };
  }

  const normalizedDimensions = normalizeDimensions(length, width, height);
  const sizeTier = determineSizeTier(normalizedDimensions, weight, config);

  const baseFee = resolveBaseFee(weight, sizeTier, config);
  const categoryAdjustment = resolveCategoryAdjustment(resolvedCategory, config);
  const dangerousGoodsAdjustment = dangerousGoods
    ? config.dangerousGoodsAdjustment[sizeTier.toLowerCase() as 'standard' | 'oversize']
    : 0;
  const lithiumBatteriesAdjustment = lithiumBatteries ? config.lithiumBatteriesAdjustment : 0;

  const preDiscount = baseFee + categoryAdjustment + dangerousGoodsAdjustment + lithiumBatteriesAdjustment;

  const sippDiscount = applySipp && config.sippEligibleTiers.includes(sizeTier)
    ? preDiscount * config.sippDiscountPercent
    : 0;

  const finalFee = Math.max(0, preDiscount - sippDiscount);

  return {
    valid: true,
    errors: {},
    breakdown: {
      baseFee: Number(baseFee.toFixed(2)),
      categoryAdjustment: Number(categoryAdjustment.toFixed(2)),
      dangerousGoodsAdjustment: Number(dangerousGoodsAdjustment.toFixed(2)),
      lithiumBatteriesAdjustment: Number(lithiumBatteriesAdjustment.toFixed(2)),
      fuelLogisticsSurcharge: 0,
      sippDiscount: Number(sippDiscount.toFixed(2)),
      finalFee: Number(finalFee.toFixed(2)),
      sizeTier,
      fulfillmentTier: sizeTier,
      currencySymbol: config.symbol,
      marketplaceCode: config.region,
      normalizedDimensions: [
        Number(normalizedDimensions[0].toFixed(2)),
        Number(normalizedDimensions[1].toFixed(2)),
        Number(normalizedDimensions[2].toFixed(2))
      ]
    }
  };
}
