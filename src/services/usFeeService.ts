import {
  US_APPAREL_RATES,
  US_FEE_CONFIG,
  US_HAZMAT_RATES,
  US_NON_APPAREL_RATES,
  US_SIPP_APPAREL,
  US_SIPP_NON_APPAREL,
  US_SURCHARGE_MULTIPLIER,
  USSizeTier,
  USTierRates,
  USSIPPTable,
  USPriceBand,
  USWeightBracket,
} from '../config';
import { CalculationResult, CalculatorInput, SizeTier } from '../types';
import { convertDimension, convertWeight, DimensionUnit, WeightUnit } from '../utils/units';
import { hasValidationErrors, validateInput } from '../utils/validators';
import { normalizeDimensions, normalizeCategory } from '../utils/normalize';

// ─────────────────────── Size tier determination ─────────────────────────────

function determineSizeTier(
  lIn: number,
  wIn: number,
  hIn: number,
  weightLb: number,
): USSizeTier {
  const weightOz = weightLb * 16;

  // Small Standard: ≤ 15×12×0.75 in and ≤ 16 oz
  if (lIn <= 15 && wIn <= 12 && hIn <= 0.75 && weightOz <= 16) {
    return 'Small Standard';
  }

  // Large Standard: ≤ 18×14×8 in and ≤ 20 lb
  if (lIn <= 18 && wIn <= 14 && hIn <= 8 && weightLb <= 20) {
    return 'Large Standard';
  }

  // For bulky / extra-large use dimensional (billable) weight
  const dimWeightLb = (lIn * wIn * hIn) / 139;
  const billableLb = Math.max(weightLb, dimWeightLb);
  const lengthPlusGirth = lIn + 2 * (wIn + hIn);

  // Small Bulky: ≤ 59×33×33 in, L+girth ≤ 130 in, ≤ 50 lb
  if (lIn <= 59 && wIn <= 33 && hIn <= 33 && lengthPlusGirth <= 130 && billableLb <= 50) {
    return 'Small Bulky';
  }

  // Large Bulky: ≤ 96×48×48 in, L+girth ≤ 165 in, ≤ 50 lb
  if (lIn <= 96 && wIn <= 48 && hIn <= 48 && lengthPlusGirth <= 165 && billableLb <= 50) {
    return 'Large Bulky';
  }

  // Extra Large — split by weight only once dimensions exceed Large Bulky
  if (billableLb <= 50)  return 'Extra Large 0-50 lb';
  if (billableLb <= 70)  return 'Extra Large 50-70 lb';
  if (billableLb <= 150) return 'Extra Large 70-150 lb';
  return 'Extra Large 150+ lb';
}

// ─────────────────────── Price band ──────────────────────────────────────────

function selectPriceBand(price: number): USPriceBand {
  if (price < 10)  return 'under10';
  if (price <= 50) return 'between10and50';
  return 'over50';
}

// ─────────────────────── Billable weight ─────────────────────────────────────

function billableWeightOz(
  lIn: number,
  wIn: number,
  hIn: number,
  weightLb: number,
  sizeTier: USSizeTier,
): number {
  const unitWeightOz = weightLb * 16;
  // Small Standard always uses unit weight (Amazon policy)
  if (sizeTier === 'Small Standard') return unitWeightOz;
  const dimWeightOz = (lIn * wIn * hIn) / 139 * 16;
  return Math.max(unitWeightOz, dimWeightOz);
}

// ─────────────────────── Fee lookup ──────────────────────────────────────────

function lookupFee(
  rateTable: USTierRates,
  sizeTier: USSizeTier,
  weightOz: number,
  band: USPriceBand,
): number {
  const brackets = rateTable[sizeTier];
  if (!brackets || brackets.length === 0) return 0;

  for (const bracket of brackets) {
    if (weightOz <= bracket.maxWeightOz) {
      return computeBracketFee(bracket, weightOz, band);
    }
  }

  // Fallback: use last bracket (handles any rounding at the tier boundary)
  return computeBracketFee(brackets[brackets.length - 1], weightOz, band);
}

function computeBracketFee(
  bracket: USWeightBracket,
  weightOz: number,
  band: USPriceBand,
): number {
  if (bracket.type === 'flat') {
    return bracket.fees[band];
  }

  // Incremental: baseFee + ceil((weightOz - baseWeightOz) / stepIntervalOz) * incrementalFee
  const extraSteps = Math.max(
    0,
    Math.ceil((weightOz - bracket.baseWeightOz) / bracket.stepIntervalOz),
  );
  return bracket.baseFees[band] + extraSteps * bracket.incrementalFee;
}

// ─────────────────────── SIPP discount lookup ────────────────────────────────

function lookupSIPP(
  sippTable: USSIPPTable,
  sizeTier: USSizeTier,
  weightOz: number,
): number {
  // SIPP only applies to standard-size tiers and items ≤ 20 lb (320 oz)
  if (weightOz > 320) return 0;
  const brackets = sippTable[sizeTier];
  if (!brackets) return 0;

  for (const b of brackets) {
    if (weightOz > b.fromOz && weightOz <= b.toOz) {
      return b.discount;
    }
  }
  return 0;
}

// ─────────────────────── Main export ─────────────────────────────────────────

export function calculateUSFee(
  input: CalculatorInput,
  inputDimensionUnit: DimensionUnit,
  inputWeightUnit: WeightUnit,
): CalculationResult {
  // Unit conversion to imperial
  const length = convertDimension(input.length, inputDimensionUnit, US_FEE_CONFIG.dimensionUnit);
  const width  = convertDimension(input.width,  inputDimensionUnit, US_FEE_CONFIG.dimensionUnit);
  const height = convertDimension(input.height, inputDimensionUnit, US_FEE_CONFIG.dimensionUnit);
  const weight = convertWeight(input.weight, inputWeightUnit, US_FEE_CONFIG.weightUnit);

  const resolvedCategory = normalizeCategory(input.selectedCategory, input.customCategory);
  const errors = validateInput(length, width, height, weight, resolvedCategory, input.price);

  if (hasValidationErrors(errors)) {
    return { valid: false, errors };
  }

  // Sort dimensions: [longest, median, shortest]
  const [l, w, h] = normalizeDimensions(length, width, height);

  // Size tier & billable weight
  const usTier   = determineSizeTier(l, w, h, weight);
  const bwOz     = billableWeightOz(l, w, h, weight, usTier);

  // Select rate table: hazmat > apparel > non-apparel
  const isApparel     = resolvedCategory.toLowerCase() === 'apparel';
  const rateTable     = input.dangerousGoods ? US_HAZMAT_RATES
                      : isApparel            ? US_APPAREL_RATES
                      :                        US_NON_APPAREL_RATES;
  const sippTable     = isApparel ? US_SIPP_APPAREL : US_SIPP_NON_APPAREL;

  // Price band
  const band = selectPriceBand(input.price);

  // Base fee from rate table
  const baseFee = lookupFee(rateTable, usTier, bwOz, band);

  // SIPP discount: flat-dollar amount, NOT subject to the fuel surcharge.
  // Amazon sets the logistics cost (base + surcharge) first; SIPP is a
  // program discount applied on top of that total.
  const sippDiscount = input.applySipp
    ? lookupSIPP(sippTable, usTier, bwOz)
    : 0;

  // 3.5% fuel & logistics surcharge (mandatory, effective April 17 2026).
  // Applied ONLY to baseFee — the SIPP adjustment is excluded from the
  // surcharge calculation per Amazon's rate-card rules.
  const fuelLogisticsSurcharge = baseFee * (US_SURCHARGE_MULTIPLIER - 1);
  const finalFee               = Math.max(0, baseFee + fuelLogisticsSurcharge - sippDiscount);

  // Simplified tier label for CalculationBreakdown.sizeTier (SizeTier union)
  const sizeTierSimplified: SizeTier =
    usTier === 'Small Standard' || usTier === 'Large Standard' ? 'Standard' : 'Oversize';

  return {
    valid: true,
    errors: {},
    breakdown: {
      baseFee:                    Number(baseFee.toFixed(2)),
      categoryAdjustment:         0,
      dangerousGoodsAdjustment:   0,
      lithiumBatteriesAdjustment: 0,
      fuelLogisticsSurcharge:     Number(fuelLogisticsSurcharge.toFixed(2)),
      sippDiscount:               Number(sippDiscount.toFixed(2)),
      finalFee:                   Number(finalFee.toFixed(2)),
      sizeTier:                   sizeTierSimplified,
      fulfillmentTier:            usTier,
      isLowPrice:                 band === 'under10',
      currencySymbol:             US_FEE_CONFIG.symbol,
      marketplaceCode:            US_FEE_CONFIG.region,
      normalizedDimensions:       [
        Number(l.toFixed(2)),
        Number(w.toFixed(2)),
        Number(h.toFixed(2)),
      ],
    },
  };
}
