import { CATEGORY_NORMALIZATION } from '../config';
import {
  BulkCalculationOptions,
  BulkCalculationRowResult,
  BulkCsvImportResult,
  BulkCsvRowParsed,
  BulkCsvRowRaw,
  BulkDimensionUnit,
  BulkExportRow,
  BulkMarket,
  BulkWeightUnit,
  CalculationBreakdown,
  CalculationResult,
  CalculatorInput,
  EuMarketplace
} from '../types';
import { parseBulkCsv, BULK_CSV_HEADERS, exportRowsToCsv } from '../utils/csv';
import { calculateEUFee } from './euFeeService';
import { calculateUSFee } from './usFeeService';

const DEFAULT_BULK_OPTIONS: BulkCalculationOptions = {
  autoApplyFuelLogisticsSurcharge: true
};

const VALID_MARKETS: readonly BulkMarket[] = ['US', 'UK', 'DE', 'ES', 'IT', 'FR'];
const VALID_DIMENSION_UNITS: readonly BulkDimensionUnit[] = ['cm', 'in'];
const VALID_WEIGHT_UNITS: readonly BulkWeightUnit[] = ['kg', 'lb'];
const TRUE_VALUES = new Set(['true', 'yes', '1']);
const FALSE_VALUES = new Set(['false', 'no', '0', '']);

function parsePositiveNumber(value: string): number {
  if (!value.trim()) {
    return Number.NaN;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseBoolean(value: string | undefined, fieldName: string): { value?: boolean; error?: string } {
  const normalized = value?.trim().toLowerCase() ?? '';

  if (TRUE_VALUES.has(normalized)) {
    return { value: true };
  }

  if (FALSE_VALUES.has(normalized)) {
    return { value: false };
  }

  return {
    error: `${fieldName} must be one of: true/false, yes/no, 1/0.`
  };
}

function normalizeCategory(category: string): string {
  const trimmed = category.trim();
  return CATEGORY_NORMALIZATION[trimmed] ?? trimmed;
}

function parseBulkRow(rawRow: BulkCsvRowRaw): { parsed?: BulkCsvRowParsed; error?: string } {
  const market = rawRow.market.trim().toUpperCase();
  const dimensionUnit = rawRow.dimension_unit.trim().toLowerCase();
  const weightUnit = rawRow.weight_unit.trim().toLowerCase();
  const sipp = parseBoolean(rawRow.sipp, 'sipp');
  const dangerous = parseBoolean(rawRow.dangerous, 'dangerous');
  const lithiumBattery = parseBoolean(rawRow.lithium_battery, 'lithium_battery');
  const errors: string[] = [];

  if (!rawRow.asin.trim()) {
    errors.push('asin is required.');
  }

  if (!VALID_MARKETS.includes(market as BulkMarket)) {
    errors.push('market must be one of: US, UK, DE, ES, IT, FR.');
  }

  if (!VALID_DIMENSION_UNITS.includes(dimensionUnit as BulkDimensionUnit)) {
    errors.push('dimension_unit must be cm or in.');
  }

  if (!VALID_WEIGHT_UNITS.includes(weightUnit as BulkWeightUnit)) {
    errors.push('weight_unit must be kg or lb.');
  }

  if (!rawRow.category.trim()) {
    errors.push('category is required.');
  }

  if (sipp.error) {
    errors.push(sipp.error);
  }

  if (dangerous.error) {
    errors.push(dangerous.error);
  }

  if (lithiumBattery.error) {
    errors.push(lithiumBattery.error);
  }

  if (errors.length > 0) {
    return { error: errors.join(' ') };
  }

  return {
    parsed: {
      asin: rawRow.asin.trim(),
      market: market as BulkMarket,
      dimensionUnit: dimensionUnit as BulkDimensionUnit,
      weightUnit: weightUnit as BulkWeightUnit,
      length: parsePositiveNumber(rawRow.length),
      width: parsePositiveNumber(rawRow.width),
      height: parsePositiveNumber(rawRow.height),
      weight: parsePositiveNumber(rawRow.weight),
      price: parsePositiveNumber(rawRow.price),
      category: normalizeCategory(rawRow.category),
      applySipp: sipp.value ?? false,
      dangerousGoods: dangerous.value ?? false,
      lithiumBatteries: lithiumBattery.value ?? false
    }
  };
}

function createCalculatorInput(row: BulkCsvRowParsed, options: BulkCalculationOptions): CalculatorInput {
  return {
    length: row.length,
    width: row.width,
    height: row.height,
    weight: row.weight,
    price: row.price,
    marketplace: row.market === 'US' ? undefined : (row.market as EuMarketplace),
    selectedCategory: row.category,
    customCategory: '',
    dangerousGoods: row.dangerousGoods,
    lithiumBatteries: row.lithiumBatteries,
    applyFuelLogisticsSurcharge: options.autoApplyFuelLogisticsSurcharge,
    applySipp: row.applySipp
  };
}

function calculateRow(parsedRow: BulkCsvRowParsed, options: BulkCalculationOptions): CalculationResult {
  const input = createCalculatorInput(parsedRow, options);

  if (parsedRow.market === 'US') {
    return calculateUSFee(input, parsedRow.dimensionUnit, parsedRow.weightUnit);
  }

  return calculateEUFee(input, parsedRow.dimensionUnit, parsedRow.weightUnit);
}

function buildPricingProgram(breakdown: CalculationBreakdown): string {
  return breakdown.isLowPrice ? 'Low-price FBA' : 'Standard FBA';
}

function emptyExportValueRow(rawRow: BulkCsvRowRaw, errorMessage: string): BulkExportRow {
  return {
    asin: rawRow.asin,
    market: rawRow.market,
    dimension_unit: rawRow.dimension_unit,
    weight_unit: rawRow.weight_unit,
    length: rawRow.length,
    width: rawRow.width,
    height: rawRow.height,
    weight: rawRow.weight,
    price: rawRow.price,
    category: rawRow.category,
    sipp: rawRow.sipp ?? '',
    dangerous: rawRow.dangerous ?? '',
    lithium_battery: rawRow.lithium_battery ?? '',
    calculation_status: 'error',
    error_message: errorMessage,
    currency_symbol: '',
    marketplace_code: '',
    fulfillment_tier: '',
    size_tier: '',
    pricing_program: '',
    base_fee: '',
    category_adjustment: '',
    dangerous_goods_adjustment: '',
    lithium_batteries_adjustment: '',
    transport_surcharge: '',
    sipp_discount: '',
    final_fee: ''
  };
}

export function parseBulkCsvFile(text: string): BulkCsvImportResult {
  return parseBulkCsv(text);
}

export function calculateBulkRows(
  rawRows: BulkCsvRowRaw[],
  options: Partial<BulkCalculationOptions> = {}
): BulkCalculationRowResult[] {
  const resolvedOptions = { ...DEFAULT_BULK_OPTIONS, ...options };

  return rawRows.map((rawRow, index) => {
    const parsed = parseBulkRow(rawRow);

    if (!parsed.parsed) {
      return {
        rowIndex: index + 2,
        asin: rawRow.asin.trim(),
        valid: false,
        errorMessage: parsed.error ?? 'Row could not be parsed.'
      };
    }

    const result = calculateRow(parsed.parsed, resolvedOptions);

    if (!result.valid || !result.breakdown) {
      const errorMessage = Object.values(result.errors)
        .filter(Boolean)
        .join(' ');

      return {
        rowIndex: index + 2,
        asin: parsed.parsed.asin,
        input: parsed.parsed,
        valid: false,
        errorMessage: errorMessage || 'Row validation failed.',
        result
      };
    }

    return {
      rowIndex: index + 2,
      asin: parsed.parsed.asin,
      input: parsed.parsed,
      valid: true,
      errorMessage: '',
      result: {
        ...result,
        valid: true,
        breakdown: result.breakdown
      }
    };
  });
}

export function buildBulkExportRows(rawRows: BulkCsvRowRaw[], results: BulkCalculationRowResult[]): BulkExportRow[] {
  return rawRows.map((rawRow, index) => {
    const rowResult = results[index];

    if (!rowResult || !rowResult.valid) {
      return emptyExportValueRow(rawRow, rowResult?.errorMessage ?? 'Row was not calculated.');
    }

    const breakdown = rowResult.result.breakdown;

    return {
      asin: rawRow.asin,
      market: rawRow.market,
      dimension_unit: rawRow.dimension_unit,
      weight_unit: rawRow.weight_unit,
      length: rawRow.length,
      width: rawRow.width,
      height: rawRow.height,
      weight: rawRow.weight,
      price: rawRow.price,
      category: rawRow.category,
      sipp: rawRow.sipp ?? '',
      dangerous: rawRow.dangerous ?? '',
      lithium_battery: rawRow.lithium_battery ?? '',
      calculation_status: 'success',
      error_message: '',
      currency_symbol: breakdown.currencySymbol,
      marketplace_code: breakdown.marketplaceCode ?? '',
      fulfillment_tier: breakdown.fulfillmentTier,
      size_tier: breakdown.sizeTier,
      pricing_program: buildPricingProgram(breakdown),
      base_fee: breakdown.baseFee,
      category_adjustment: breakdown.categoryAdjustment,
      dangerous_goods_adjustment: breakdown.dangerousGoodsAdjustment,
      lithium_batteries_adjustment: breakdown.lithiumBatteriesAdjustment,
      transport_surcharge: breakdown.fuelLogisticsSurcharge,
      sipp_discount: breakdown.sippDiscount,
      final_fee: breakdown.finalFee
    };
  });
}

export function exportBulkResultsToCsv(rows: BulkExportRow[]): string {
  return exportRowsToCsv(rows, [
    ...BULK_CSV_HEADERS,
    'calculation_status',
    'error_message',
    'currency_symbol',
    'marketplace_code',
    'fulfillment_tier',
    'size_tier',
    'pricing_program',
    'base_fee',
    'category_adjustment',
    'dangerous_goods_adjustment',
    'lithium_batteries_adjustment',
    'transport_surcharge',
    'sipp_discount',
    'final_fee'
  ]);
}