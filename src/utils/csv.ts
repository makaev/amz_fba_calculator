import { BulkCsvImportError, BulkCsvImportResult, BulkCsvRowRaw, BulkCsvTemplateRow } from '../types';

export const BULK_CSV_HEADERS = [
  'asin',
  'market',
  'dimension_unit',
  'weight_unit',
  'length',
  'width',
  'height',
  'weight',
  'price',
  'category',
  'sipp',
  'dangerous',
  'lithium_battery'
] as const;

export const REQUIRED_BULK_CSV_HEADERS = BULK_CSV_HEADERS.filter(
  (header) => header !== 'sipp' && header !== 'dangerous' && header !== 'lithium_battery'
);

export const SAMPLE_BULK_CSV_ROWS: BulkCsvTemplateRow[] = [
  {
    asin: 'B0EU123456',
    market: 'UK',
    dimension_unit: 'cm',
    weight_unit: 'kg',
    length: 24,
    width: 18,
    height: 4,
    weight: 0.45,
    price: 14.99,
    category: 'Kitchen',
    sipp: false,
    dangerous: false,
    lithium_battery: false
  },
  {
    asin: 'B0US123456',
    market: 'US',
    dimension_unit: 'in',
    weight_unit: 'lb',
    length: 11,
    width: 8,
    height: 2,
    weight: 0.9,
    price: 19.99,
    category: 'Home',
    sipp: true,
    dangerous: false,
    lithium_battery: false
  }
];

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function stringifyCsvValue(value: string | number | boolean): string {
  const text = String(value);
  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function createRowObject(headers: string[], values: string[]): BulkCsvRowRaw {
  const record: Record<string, string> = {};

  headers.forEach((header, index) => {
    record[header] = (values[index] ?? '').trim();
  });

  return {
    asin: record.asin ?? '',
    market: record.market ?? '',
    dimension_unit: record.dimension_unit ?? '',
    weight_unit: record.weight_unit ?? '',
    length: record.length ?? '',
    width: record.width ?? '',
    height: record.height ?? '',
    weight: record.weight ?? '',
    price: record.price ?? '',
    category: record.category ?? '',
    sipp: record.sipp ?? '',
    dangerous: record.dangerous ?? '',
    lithium_battery: record.lithium_battery ?? ''
  };
}

export function parseBulkCsv(text: string): BulkCsvImportResult {
  const normalizedText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  if (!normalizedText) {
    return {
      headers: [],
      rows: [],
      errors: [{ message: 'CSV file is empty.' }]
    };
  }

  const lines = normalizedText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      headers: [],
      rows: [],
      errors: [{ message: 'CSV file is empty.' }]
    };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const errors: BulkCsvImportError[] = [];
  const missingHeaders = REQUIRED_BULK_CSV_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    errors.push({ message: `Missing required columns: ${missingHeaders.join(', ')}` });
  }

  const rows = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);

    if (values.length > headers.length) {
      errors.push({ rowIndex: index + 2, message: 'Row has more columns than the header.' });
    }

    return createRowObject(headers, values);
  });

  return {
    headers,
    rows,
    errors
  };
}

export function createSampleBulkCsv(): string {
  return exportRowsToCsv(SAMPLE_BULK_CSV_ROWS, [...BULK_CSV_HEADERS]);
}

export function exportRowsToCsv<T extends Record<string, string | number | boolean>>(
  rows: T[],
  headers: readonly string[]
): string {
  const csvLines = [headers.join(',')];

  rows.forEach((row) => {
    csvLines.push(headers.map((header) => stringifyCsvValue(row[header] ?? '')).join(','));
  });

  return csvLines.join('\n');
}