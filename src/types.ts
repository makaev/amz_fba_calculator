export type Region = 'EU' | 'US';

export type EuMarketplace = 'UK' | 'DE' | 'ES' | 'IT' | 'FR';

export type BulkMarket = 'US' | EuMarketplace;

export type BulkDimensionUnit = 'cm' | 'in';

export type BulkWeightUnit = 'kg' | 'lb';

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

export interface BulkCsvRowRaw {
  asin: string;
  market: string;
  dimension_unit: string;
  weight_unit: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  price: string;
  category: string;
  sipp?: string;
  dangerous?: string;
  lithium_battery?: string;
}

export interface BulkCsvImportError {
  rowIndex?: number;
  message: string;
}

export interface BulkCsvImportResult {
  headers: string[];
  rows: BulkCsvRowRaw[];
  errors: BulkCsvImportError[];
}

export interface BulkCsvRowParsed {
  asin: string;
  market: BulkMarket;
  dimensionUnit: BulkDimensionUnit;
  weightUnit: BulkWeightUnit;
  length: number;
  width: number;
  height: number;
  weight: number;
  price: number;
  category: string;
  applySipp: boolean;
  dangerousGoods: boolean;
  lithiumBatteries: boolean;
}

export interface BulkCalculationOptions {
  autoApplyFuelLogisticsSurcharge: boolean;
}

export interface BulkCalculationRowSuccess {
  rowIndex: number;
  asin: string;
  input: BulkCsvRowParsed;
  valid: true;
  errorMessage: '';
  result: CalculationResult & {
    valid: true;
    breakdown: CalculationBreakdown;
  };
}

export interface BulkCalculationRowError {
  rowIndex: number;
  asin: string;
  input?: BulkCsvRowParsed;
  valid: false;
  errorMessage: string;
  result?: CalculationResult;
}

export type BulkCalculationRowResult = BulkCalculationRowSuccess | BulkCalculationRowError;

export interface BulkCsvTemplateRow {
  asin: string;
  market: BulkMarket;
  dimension_unit: BulkDimensionUnit;
  weight_unit: BulkWeightUnit;
  length: number;
  width: number;
  height: number;
  weight: number;
  price: number;
  category: string;
  sipp: boolean;
  dangerous: boolean;
  lithium_battery: boolean;
}

export interface BulkExportRow {
  asin: string;
  market: string;
  dimension_unit: string;
  weight_unit: string;
  length: number | string;
  width: number | string;
  height: number | string;
  weight: number | string;
  price: number | string;
  category: string;
  sipp: string;
  dangerous: string;
  lithium_battery: string;
  calculation_status: 'success' | 'error';
  error_message: string;
  currency_symbol: string;
  marketplace_code: string;
  fulfillment_tier: string;
  size_tier: string;
  pricing_program: string;
  base_fee: number | string;
  category_adjustment: number | string;
  dangerous_goods_adjustment: number | string;
  lithium_batteries_adjustment: number | string;
  transport_surcharge: number | string;
  sipp_discount: number | string;
  final_fee: number | string;
}
