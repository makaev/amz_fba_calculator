export type Region = 'EU' | 'US';

export type EuMarketplace = 'UK' | 'DE' | 'ES' | 'IT' | 'FR';

export type SizeTier = 'Standard' | 'Oversize';

export interface CategoryRule {
  name: string;
  adjustment: number;
}

export interface WeightBracket {
  maxWeight: number;
  fee: number;
}

export interface RegionFeeConfig {
  region: Region;
  currency: string;
  symbol: string;
  dimensionUnit: 'cm' | 'in';
  weightUnit: 'kg' | 'lb';
  standardMaxDimensions: [number, number, number];
  standardMaxWeight: number;
  baseFees: {
    standard: WeightBracket[];
    oversize: WeightBracket[];
  };
  categoryRules: CategoryRule[];
  dangerousGoodsAdjustment: {
    standard: number;
    oversize: number;
  };
  lithiumBatteriesAdjustment: number;
  sippDiscountPercent: number;
  sippEligibleTiers: SizeTier[];
}

export interface CalculatorInput {
  length: number;
  width: number;
  height: number;
  weight: number;
  price: number;
  marketplace?: EuMarketplace;
  selectedCategory: string;
  customCategory: string;
  dangerousGoods: boolean;
  lithiumBatteries: boolean;
  applyFuelLogisticsSurcharge: boolean;
  applySipp: boolean;
}

export interface ValidationErrors {
  length?: string;
  width?: string;
  height?: string;
  weight?: string;
  price?: string;
  marketplace?: string;
  category?: string;
}

export interface CalculationBreakdown {
  baseFee: number;
  categoryAdjustment: number;
  dangerousGoodsAdjustment: number;
  lithiumBatteriesAdjustment: number;
  fuelLogisticsSurcharge: number;
  sippDiscount: number;
  finalFee: number;
  sizeTier: SizeTier;
  fulfillmentTier: string;
  currencySymbol: string;
  marketplaceCode?: string;
  isLowPrice?: boolean;
  normalizedDimensions: [number, number, number];
}

export interface CalculationResult {
  valid: boolean;
  errors: ValidationErrors;
  breakdown?: CalculationBreakdown;
}
