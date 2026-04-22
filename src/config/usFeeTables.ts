import type { DimensionUnit, WeightUnit } from '../utils/units';

// ─────────────────────── Types ───────────────────────────────────────────────

export type USPriceBand = 'under10' | 'between10and50' | 'over50';

export type USSizeTier =
  | 'Small Standard'
  | 'Large Standard'
  | 'Small Bulky'
  | 'Large Bulky'
  | 'Extra Large 0-50 lb'
  | 'Extra Large 50-70 lb'
  | 'Extra Large 70-150 lb'
  | 'Extra Large 150+ lb';

export interface USFlatBracket {
  type: 'flat';
  maxWeightOz: number;
  fees: Record<USPriceBand, number>;
}

export interface USIncrementalBracket {
  type: 'incremental';
  maxWeightOz: number;
  /** Weight (oz) at which the incremental formula starts (inclusive). */
  baseWeightOz: number;
  stepIntervalOz: number;
  baseFees: Record<USPriceBand, number>;
  /** Same across all price bands per Amazon spec. */
  incrementalFee: number;
}

export type USWeightBracket = USFlatBracket | USIncrementalBracket;
export type USTierRates = Record<USSizeTier, USWeightBracket[]>;

export interface USSIPPBracket {
  fromOz: number; // exclusive lower bound
  toOz: number;   // inclusive upper bound
  discount: number;
}

export type USSIPPTable = Partial<Record<USSizeTier, USSIPPBracket[]>>;

// ─────────────────────── Surcharge ───────────────────────────────────────────

/** 3.5 % fuel & logistics surcharge effective April 17, 2026. */
export const US_SURCHARGE_MULTIPLIER = 1.035;

// ─────────────────────── 1. Non-Apparel rate table ──────────────────────────

export const US_NON_APPAREL_RATES: USTierRates = {
  'Small Standard': [
    { type: 'flat', maxWeightOz:  2, fees: { under10: 2.43, between10and50: 3.32, over50: 3.58 } },
    { type: 'flat', maxWeightOz:  4, fees: { under10: 2.49, between10and50: 3.42, over50: 3.68 } },
    { type: 'flat', maxWeightOz:  6, fees: { under10: 2.56, between10and50: 3.45, over50: 3.71 } },
    { type: 'flat', maxWeightOz:  8, fees: { under10: 2.66, between10and50: 3.54, over50: 3.80 } },
    { type: 'flat', maxWeightOz: 10, fees: { under10: 2.77, between10and50: 3.68, over50: 3.94 } },
    { type: 'flat', maxWeightOz: 12, fees: { under10: 2.82, between10and50: 3.78, over50: 4.04 } },
    { type: 'flat', maxWeightOz: 14, fees: { under10: 2.92, between10and50: 3.91, over50: 4.17 } },
    { type: 'flat', maxWeightOz: 16, fees: { under10: 2.95, between10and50: 3.96, over50: 4.22 } },
  ],

  'Large Standard': [
    { type: 'flat', maxWeightOz:  4, fees: { under10: 2.91, between10and50: 3.73, over50: 3.99 } },
    { type: 'flat', maxWeightOz:  8, fees: { under10: 3.13, between10and50: 3.95, over50: 4.21 } },
    { type: 'flat', maxWeightOz: 12, fees: { under10: 3.38, between10and50: 4.20, over50: 4.46 } },
    { type: 'flat', maxWeightOz: 16, fees: { under10: 3.78, between10and50: 4.60, over50: 4.86 } },
    { type: 'flat', maxWeightOz: 20, fees: { under10: 4.22, between10and50: 5.04, over50: 5.30 } }, // 1.25 lb
    { type: 'flat', maxWeightOz: 24, fees: { under10: 4.60, between10and50: 5.42, over50: 5.68 } }, // 1.5 lb
    { type: 'flat', maxWeightOz: 28, fees: { under10: 4.75, between10and50: 5.57, over50: 5.83 } }, // 1.75 lb
    { type: 'flat', maxWeightOz: 32, fees: { under10: 5.00, between10and50: 5.82, over50: 6.08 } }, // 2 lb
    { type: 'flat', maxWeightOz: 36, fees: { under10: 5.10, between10and50: 5.92, over50: 6.18 } }, // 2.25 lb
    { type: 'flat', maxWeightOz: 40, fees: { under10: 5.28, between10and50: 6.10, over50: 6.36 } }, // 2.5 lb
    { type: 'flat', maxWeightOz: 44, fees: { under10: 5.44, between10and50: 6.26, over50: 6.52 } }, // 2.75 lb
    { type: 'flat', maxWeightOz: 48, fees: { under10: 5.85, between10and50: 6.67, over50: 6.93 } }, // 3 lb
    // > 3 lb up to 20 lb: +$0.08 per 4 oz above 3 lb
    {
      type: 'incremental', maxWeightOz: 320, baseWeightOz: 48, stepIntervalOz: 4,
      baseFees: { under10: 6.15, between10and50: 6.97, over50: 7.23 }, incrementalFee: 0.08,
    },
  ],

  'Small Bulky': [
    // 1 lb base fee, +$0.38 per additional whole lb, up to 50 lb
    {
      type: 'incremental', maxWeightOz: 800, baseWeightOz: 16, stepIntervalOz: 16,
      baseFees: { under10: 6.78, between10and50: 7.55, over50: 7.55 }, incrementalFee: 0.38,
    },
  ],

  'Large Bulky': [
    {
      type: 'incremental', maxWeightOz: 800, baseWeightOz: 16, stepIntervalOz: 16,
      baseFees: { under10: 8.58, between10and50: 9.35, over50: 9.35 }, incrementalFee: 0.38,
    },
  ],

  'Extra Large 0-50 lb': [
    {
      type: 'incremental', maxWeightOz: 800, baseWeightOz: 16, stepIntervalOz: 16,
      baseFees: { under10: 25.56, between10and50: 26.33, over50: 26.33 }, incrementalFee: 0.38,
    },
  ],

  'Extra Large 50-70 lb': [
    // 51 lb (816 oz) base, +$0.75 per lb up to 70 lb
    {
      type: 'incremental', maxWeightOz: 1120, baseWeightOz: 816, stepIntervalOz: 16,
      baseFees: { under10: 36.55, between10and50: 37.32, over50: 37.32 }, incrementalFee: 0.75,
    },
  ],

  'Extra Large 70-150 lb': [
    // 71 lb (1136 oz) base, +$0.75 per lb up to 150 lb
    {
      type: 'incremental', maxWeightOz: 2400, baseWeightOz: 1136, stepIntervalOz: 16,
      baseFees: { under10: 50.55, between10and50: 51.32, over50: 51.32 }, incrementalFee: 0.75,
    },
  ],

  'Extra Large 150+ lb': [
    // 151 lb (2416 oz) base, +$0.19 per lb
    {
      type: 'incremental', maxWeightOz: Infinity, baseWeightOz: 2416, stepIntervalOz: 16,
      baseFees: { under10: 194.18, between10and50: 194.95, over50: 194.95 }, incrementalFee: 0.19,
    },
  ],
};

// ─────────────────────── 2. Apparel rate table ──────────────────────────────

export const US_APPAREL_RATES: USTierRates = {
  'Small Standard': [
    { type: 'flat', maxWeightOz:  2, fees: { under10: 2.62, between10and50: 3.51, over50: 3.77 } },
    { type: 'flat', maxWeightOz:  4, fees: { under10: 2.64, between10and50: 3.54, over50: 3.80 } },
    { type: 'flat', maxWeightOz:  6, fees: { under10: 2.68, between10and50: 3.59, over50: 3.85 } },
    { type: 'flat', maxWeightOz:  8, fees: { under10: 2.81, between10and50: 3.69, over50: 3.95 } },
    { type: 'flat', maxWeightOz: 10, fees: { under10: 3.00, between10and50: 3.91, over50: 4.17 } },
    { type: 'flat', maxWeightOz: 12, fees: { under10: 3.10, between10and50: 4.09, over50: 4.35 } },
    { type: 'flat', maxWeightOz: 14, fees: { under10: 3.20, between10and50: 4.20, over50: 4.46 } },
    { type: 'flat', maxWeightOz: 16, fees: { under10: 3.30, between10and50: 4.25, over50: 4.51 } },
  ],

  'Large Standard': [
    { type: 'flat', maxWeightOz:  4, fees: { under10: 3.48, between10and50: 4.30, over50: 4.56 } },
    { type: 'flat', maxWeightOz:  8, fees: { under10: 3.68, between10and50: 4.50, over50: 4.76 } },
    { type: 'flat', maxWeightOz: 12, fees: { under10: 3.90, between10and50: 4.72, over50: 4.98 } },
    { type: 'flat', maxWeightOz: 16, fees: { under10: 4.35, between10and50: 5.17, over50: 5.43 } },
    { type: 'flat', maxWeightOz: 20, fees: { under10: 5.05, between10and50: 5.87, over50: 6.13 } }, // 1.25 lb
    { type: 'flat', maxWeightOz: 24, fees: { under10: 5.22, between10and50: 6.04, over50: 6.30 } }, // 1.5 lb
    { type: 'flat', maxWeightOz: 28, fees: { under10: 5.32, between10and50: 6.14, over50: 6.40 } }, // 1.75 lb
    { type: 'flat', maxWeightOz: 32, fees: { under10: 5.43, between10and50: 6.25, over50: 6.51 } }, // 2 lb
    { type: 'flat', maxWeightOz: 36, fees: { under10: 5.78, between10and50: 6.60, over50: 6.86 } }, // 2.25 lb
    { type: 'flat', maxWeightOz: 40, fees: { under10: 5.90, between10and50: 6.72, over50: 6.98 } }, // 2.5 lb
    { type: 'flat', maxWeightOz: 44, fees: { under10: 5.95, between10and50: 6.77, over50: 7.03 } }, // 2.75 lb
    { type: 'flat', maxWeightOz: 48, fees: { under10: 6.08, between10and50: 6.90, over50: 7.16 } }, // 3 lb
    // > 3 lb up to 20 lb: +$0.16 per 0.5 lb (8 oz) above 3 lb
    {
      type: 'incremental', maxWeightOz: 320, baseWeightOz: 48, stepIntervalOz: 8,
      baseFees: { under10: 6.15, between10and50: 6.97, over50: 7.23 }, incrementalFee: 0.16,
    },
  ],

  // Bulky / Extra Large rates are identical to Non-Apparel
  'Small Bulky':           US_NON_APPAREL_RATES['Small Bulky'],
  'Large Bulky':           US_NON_APPAREL_RATES['Large Bulky'],
  'Extra Large 0-50 lb':   US_NON_APPAREL_RATES['Extra Large 0-50 lb'],
  'Extra Large 50-70 lb':  US_NON_APPAREL_RATES['Extra Large 50-70 lb'],
  'Extra Large 70-150 lb': US_NON_APPAREL_RATES['Extra Large 70-150 lb'],
  'Extra Large 150+ lb':   US_NON_APPAREL_RATES['Extra Large 150+ lb'],
};

// ─────────────────────── 3. Dangerous Goods (Hazmat) rate table ─────────────

export const US_HAZMAT_RATES: USTierRates = {
  'Small Standard': [
    { type: 'flat', maxWeightOz:  2, fees: { under10: 3.40, between10and50: 4.29, over50: 4.55 } },
    { type: 'flat', maxWeightOz:  4, fees: { under10: 3.43, between10and50: 4.36, over50: 4.62 } },
    { type: 'flat', maxWeightOz:  6, fees: { under10: 3.48, between10and50: 4.37, over50: 4.63 } },
    { type: 'flat', maxWeightOz:  8, fees: { under10: 3.55, between10and50: 4.43, over50: 4.69 } },
    { type: 'flat', maxWeightOz: 10, fees: { under10: 3.64, between10and50: 4.55, over50: 4.81 } },
    { type: 'flat', maxWeightOz: 12, fees: { under10: 3.65, between10and50: 4.61, over50: 4.87 } },
    { type: 'flat', maxWeightOz: 14, fees: { under10: 3.73, between10and50: 4.72, over50: 4.98 } },
    { type: 'flat', maxWeightOz: 16, fees: { under10: 3.77, between10and50: 4.78, over50: 5.04 } },
  ],

  'Large Standard': [
    { type: 'flat', maxWeightOz:  4, fees: { under10: 3.73, between10and50: 4.55, over50: 4.81 } },
    { type: 'flat', maxWeightOz:  8, fees: { under10: 3.94, between10and50: 4.76, over50: 5.02 } },
    { type: 'flat', maxWeightOz: 12, fees: { under10: 4.17, between10and50: 4.99, over50: 5.25 } },
    { type: 'flat', maxWeightOz: 16, fees: { under10: 4.37, between10and50: 5.19, over50: 5.45 } },
    { type: 'flat', maxWeightOz: 20, fees: { under10: 4.82, between10and50: 5.64, over50: 5.90 } }, // 1.25 lb
    { type: 'flat', maxWeightOz: 24, fees: { under10: 5.20, between10and50: 6.02, over50: 6.28 } }, // 1.5 lb
    { type: 'flat', maxWeightOz: 28, fees: { under10: 5.35, between10and50: 6.17, over50: 6.43 } }, // 1.75 lb
    { type: 'flat', maxWeightOz: 32, fees: { under10: 5.49, between10and50: 6.31, over50: 6.57 } }, // 2 lb
    { type: 'flat', maxWeightOz: 36, fees: { under10: 5.56, between10and50: 6.38, over50: 6.64 } }, // 2.25 lb
    { type: 'flat', maxWeightOz: 40, fees: { under10: 5.74, between10and50: 6.56, over50: 6.82 } }, // 2.5 lb
    { type: 'flat', maxWeightOz: 44, fees: { under10: 5.90, between10and50: 6.72, over50: 6.98 } }, // 2.75 lb
    { type: 'flat', maxWeightOz: 48, fees: { under10: 6.31, between10and50: 7.13, over50: 7.39 } }, // 3 lb
    // > 3 lb up to 20 lb: +$0.08 per 4 oz above 3 lb
    {
      type: 'incremental', maxWeightOz: 320, baseWeightOz: 48, stepIntervalOz: 4,
      baseFees: { under10: 6.61, between10and50: 7.43, over50: 7.69 }, incrementalFee: 0.08,
    },
  ],

  'Small Bulky': [
    {
      type: 'incremental', maxWeightOz: 800, baseWeightOz: 16, stepIntervalOz: 16,
      baseFees: { under10: 7.50, between10and50: 8.27, over50: 8.27 }, incrementalFee: 0.38,
    },
  ],

  'Large Bulky': [
    {
      type: 'incremental', maxWeightOz: 800, baseWeightOz: 16, stepIntervalOz: 16,
      baseFees: { under10: 9.30, between10and50: 10.07, over50: 10.07 }, incrementalFee: 0.38,
    },
  ],

  'Extra Large 0-50 lb': [
    {
      type: 'incremental', maxWeightOz: 800, baseWeightOz: 16, stepIntervalOz: 16,
      baseFees: { under10: 27.67, between10and50: 28.44, over50: 28.44 }, incrementalFee: 0.38,
    },
  ],

  'Extra Large 50-70 lb': [
    {
      type: 'incremental', maxWeightOz: 1120, baseWeightOz: 816, stepIntervalOz: 16,
      baseFees: { under10: 39.76, between10and50: 40.53, over50: 40.53 }, incrementalFee: 0.75,
    },
  ],

  'Extra Large 70-150 lb': [
    {
      type: 'incremental', maxWeightOz: 2400, baseWeightOz: 1136, stepIntervalOz: 16,
      baseFees: { under10: 57.68, between10and50: 58.45, over50: 58.45 }, incrementalFee: 0.75,
    },
  ],

  'Extra Large 150+ lb': [
    {
      type: 'incremental', maxWeightOz: Infinity, baseWeightOz: 2416, stepIntervalOz: 16,
      baseFees: { under10: 218.76, between10and50: 219.53, over50: 219.53 }, incrementalFee: 0.19,
    },
  ],
};

// ─────────────────────── SIPP discount tables ────────────────────────────────
// Effective Jan 15 2026. Only Standard-size tiers qualify (≤ 20 lb / 320 oz).
// Discounts are flat dollar amounts subtracted before the surcharge is applied.

export const US_SIPP_NON_APPAREL: USSIPPTable = {
  'Small Standard': [
    { fromOz:  0, toOz:  2, discount: 0.04 },
    { fromOz:  2, toOz:  4, discount: 0.04 },
    { fromOz:  4, toOz:  6, discount: 0.05 },
    { fromOz:  6, toOz:  8, discount: 0.05 },
    { fromOz:  8, toOz: 10, discount: 0.06 },
    { fromOz: 10, toOz: 12, discount: 0.06 },
    { fromOz: 12, toOz: 14, discount: 0.07 },
    { fromOz: 14, toOz: 16, discount: 0.07 },
  ],
  'Large Standard': [
    { fromOz:  0, toOz:  4, discount: 0.04 },
    { fromOz:  4, toOz:  8, discount: 0.04 },
    { fromOz:  8, toOz: 12, discount: 0.07 },
    { fromOz: 12, toOz: 16, discount: 0.08 },
    { fromOz: 16, toOz: 20, discount: 0.09 },
    { fromOz: 20, toOz: 24, discount: 0.09 },
    { fromOz: 24, toOz: 28, discount: 0.10 },
    { fromOz: 28, toOz: 32, discount: 0.11 },
    { fromOz: 32, toOz: 36, discount: 0.12 },
    { fromOz: 36, toOz: 40, discount: 0.13 },
    { fromOz: 40, toOz: 44, discount: 0.14 },
    { fromOz: 44, toOz: 48, discount: 0.14 },
    { fromOz: 48, toOz: 320, discount: 0.23 },
  ],
};

export const US_SIPP_APPAREL: USSIPPTable = {
  'Small Standard': [
    { fromOz:  0, toOz:  2, discount: 0.06 },
    { fromOz:  2, toOz:  4, discount: 0.06 },
    { fromOz:  4, toOz:  6, discount: 0.07 },
    { fromOz:  6, toOz:  8, discount: 0.07 },
    { fromOz:  8, toOz: 10, discount: 0.07 },
    { fromOz: 10, toOz: 12, discount: 0.07 },
    { fromOz: 12, toOz: 14, discount: 0.07 },
    { fromOz: 14, toOz: 16, discount: 0.07 },
  ],
  'Large Standard': [
    { fromOz:  0, toOz:  4, discount: 0.06 },
    { fromOz:  4, toOz:  8, discount: 0.06 },
    { fromOz:  8, toOz: 12, discount: 0.06 },
    { fromOz: 12, toOz: 16, discount: 0.07 },
    { fromOz: 16, toOz: 20, discount: 0.08 },
    { fromOz: 20, toOz: 24, discount: 0.08 },
    { fromOz: 24, toOz: 28, discount: 0.09 },
    { fromOz: 28, toOz: 32, discount: 0.09 },
    { fromOz: 32, toOz: 36, discount: 0.12 },
    { fromOz: 36, toOz: 40, discount: 0.12 },
    { fromOz: 40, toOz: 44, discount: 0.14 },
    { fromOz: 44, toOz: 48, discount: 0.14 },
    { fromOz: 48, toOz: 320, discount: 0.22 },
  ],
};

// ─────────────────────── Display config (used by form) ───────────────────────

export const US_FEE_CONFIG = {
  region: 'US' as const,
  currency: 'USD',
  symbol: '$',
  dimensionUnit: 'in' as DimensionUnit,
  weightUnit: 'lb' as WeightUnit,
};

// ─────────────────────── Categories ─────────────────────────────────────────
// "Apparel" triggers the Apparel rate table; all others use Non-Apparel.
// "Dangerous Goods" is controlled by the dangerousGoods checkbox.

export const US_CATEGORIES = [
  'Apparel',
  'Baby Products',
  'Beauty',
  'Electronics',
  'General',
  'Health',
  'Home',
  'Kitchen',
  'Office Products',
  'Sports',
  'Toys',
] as const;
