import { EuMarketplace } from '../types';

export interface MarketplaceOption {
  code: EuMarketplace;
  label: string;
  symbol: string;
}

interface WeightStep {
  w: number;
  fee: number;
}

interface EnvelopeOrParcelTier {
  name: string;
  maxL: number;
  maxW: number;
  maxH: number;
  maxWeight: number;
  steps: WeightStep[];
}

interface SelectedParcelTier {
  name: string;
  maxL: number;
  maxW: number;
  maxH: number;
  maxUnitWeight: number;
  baseFee: number;
  per100g: number;
}

interface OversizeTier {
  name: string;
  maxL: number;
  maxW: number;
  maxH: number;
  minUnitWeight: number;
  maxUnitWeight: number;
  maxBillableWeight: number;
  baseWeightLimit: number;
  baseFee: number;
  perKgFee: number;
}

interface SpecialOversizeConfig {
  maxFlatWeight: WeightStep[];
  baseWeightLimit: number;
  baseFee: number;
  perKgFee: number;
}

interface LowPriceLimits {
  restricted: number;
  regular: number;
}

export interface EuMarketplaceRateConfig {
  code: EuMarketplace;
  currency: string;
  symbol: string;
  hazmatRegion: 'UK' | 'EU';
  lowPriceLimits: LowPriceLimits;
  lowPrice: EnvelopeOrParcelTier[];
  standard: EnvelopeOrParcelTier[];
  selectedParcel: SelectedParcelTier[];
  oversize: OversizeTier[];
  specialOversize: SpecialOversizeConfig;
}

export const EU_SELECTED_PARCEL_CATEGORIES = [
  'Clothing and Accessories',
  'Door, Window and Shower Accessories',
  'Eyewear Protection',
  'Baby Strollers and Safety Equipment',
  'Footwear',
  'Furniture Accessories',
  'Grocery and Gourmet',
  'Home adhesives and cable ties',
  'Home Linen and Rugs',
  'Luggage Accessories',
  'Mattresses',
  'Packing Material',
  'Pet Clothing and Food',
  'Pet Supplies',
  'Printer and Scanner accessories',
  'Reusable Work and Safety Gloves',
  'Backpacks and Handbags'
] as const;

export const EU_CATEGORIES = [
  'Beauty',
  'Health & Personal Care',
  'Office Products',
  'Kitchen',
  'Home',
  'Business, Industrial and Scientific Supplies',
  'Footwear',
  'Grocery and Gourmet',
  'Books',
  'Amazon Device Accessories',
  'Sports',
  'Toys & Games',
  ...EU_SELECTED_PARCEL_CATEGORIES,
  'General'
] as const;

export const EU_FORM_CONFIG = {
  symbol: 'EUR',
  dimensionUnit: 'cm' as const,
  weightUnit: 'kg' as const
};

export const EU_MARKETPLACE_OPTIONS: readonly MarketplaceOption[] = [
  { code: 'UK', label: 'United Kingdom', symbol: '£' },
  { code: 'DE', label: 'Germany', symbol: '€' },
  { code: 'FR', label: 'France', symbol: '€' },
  { code: 'ES', label: 'Spain', symbol: '€' },
  { code: 'IT', label: 'Italy', symbol: '€' }
];

export const CATEGORY_NORMALIZATION: Record<string, string> = {
  Business: 'Business, Industrial and Scientific Supplies',
  Office: 'Office Products',
  Grocery: 'Grocery and Gourmet',
  'Amazon Devices': 'Amazon Device Accessories'
};

export const LOW_PRICE_RESTRICTED_CATEGORIES = new Set([
  'Beauty',
  'Health & Personal Care',
  'Business, Industrial and Scientific Supplies',
  'Office Products',
  'Grocery and Gourmet',
  'Books',
  'Amazon Device Accessories',
  'Kitchen'
]);

export const SELECTED_PARCEL_CATEGORIES = new Set(EU_SELECTED_PARCEL_CATEGORIES);

export const HAZMAT_SURCHARGES = {
  dangerousGoods: {
    UK: 0.1,
    EU: 0.1
  },
  lithiumBatteries: {
    UK: 0.1,
    EU: 0.1
  }
} as const;

export const EU_MARKETPLACE_CONFIGS: Record<EuMarketplace, EuMarketplaceRateConfig> = {
  UK: {
    code: 'UK',
    currency: 'GBP',
    symbol: '£',
    hazmatRegion: 'UK',
    lowPriceLimits: { restricted: 10, regular: 20 },
    lowPrice: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 1.46 }, { w: 40, fee: 1.5 }, { w: 60, fee: 1.52 }, { w: 80, fee: 1.67 }, { w: 100, fee: 1.7 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 1.73 }, { w: 460, fee: 1.87 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 2.42 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 2.65 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 400, steps: [{ w: 150, fee: 2.67 }, { w: 400, fee: 2.7 }] }
    ],
    standard: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 1.83 }, { w: 40, fee: 1.87 }, { w: 60, fee: 1.89 }, { w: 80, fee: 2.07 }, { w: 100, fee: 2.08 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 2.1 }, { w: 460, fee: 2.16 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 2.72 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 2.94 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 3900, steps: [{ w: 150, fee: 2.91 }, { w: 400, fee: 3 }, { w: 900, fee: 3.04 }, { w: 1400, fee: 3.05 }, { w: 1900, fee: 3.25 }, { w: 3900, fee: 3.27 }] },
      { name: 'Standard parcel', maxL: 45, maxW: 34, maxH: 26, maxWeight: 11900, steps: [{ w: 150, fee: 2.94 }, { w: 400, fee: 3.01 }, { w: 900, fee: 3.06 }, { w: 1400, fee: 3.26 }, { w: 1900, fee: 3.48 }, { w: 2900, fee: 3.49 }, { w: 3900, fee: 3.54 }, { w: 5900, fee: 3.56 }, { w: 8900, fee: 3.57 }, { w: 11900, fee: 3.58 }] }
    ],
    selectedParcel: [
      { name: 'Small parcel 1', maxL: 35, maxW: 25, maxH: 7, maxUnitWeight: 3900, baseFee: 2.83, per100g: 0.02 },
      { name: 'Small parcel 2', maxL: 35, maxW: 25, maxH: 9, maxUnitWeight: 3900, baseFee: 2.87, per100g: 0.02 },
      { name: 'Small parcel 3', maxL: 35, maxW: 25, maxH: 12, maxUnitWeight: 3900, baseFee: 2.91, per100g: 0.02 },
      { name: 'Medium parcel 1', maxL: 40, maxW: 30, maxH: 6, maxUnitWeight: 11900, baseFee: 2.97, per100g: 0.02 },
      { name: 'Medium parcel 2', maxL: 40, maxW: 30, maxH: 20, maxUnitWeight: 11900, baseFee: 3.1, per100g: 0.03 },
      { name: 'Large parcel 1', maxL: 45, maxW: 34, maxH: 10, maxUnitWeight: 11900, baseFee: 3.34, per100g: 0.03 },
      { name: 'Large parcel 2', maxL: 45, maxW: 34, maxH: 26, maxUnitWeight: 11900, baseFee: 3.97, per100g: 0.03 }
    ],
    oversize: [
      { name: 'Small oversize', maxL: 61, maxW: 46, maxH: 46, minUnitWeight: 0, maxUnitWeight: 1760, maxBillableWeight: 25820, baseWeightLimit: 760, baseFee: 3.49, perKgFee: 0.25 },
      { name: 'Standard oversize light', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 15000, maxBillableWeight: 72720, baseWeightLimit: 760, baseFee: 4.35, perKgFee: 0.15 },
      { name: 'Standard oversize heavy', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 15000, maxUnitWeight: 23000, maxBillableWeight: 72720, baseWeightLimit: 15760, baseFee: 6.58, perKgFee: 0.08 },
      { name: 'Standard oversize large', maxL: 120, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 86400, baseWeightLimit: 760, baseFee: 5.67, perKgFee: 0.07 },
      { name: 'Bulky oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 126000, baseWeightLimit: 760, baseFee: 10.2, perKgFee: 0.24 },
      { name: 'Heavy oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 23000, maxUnitWeight: 31500, maxBillableWeight: 126000, baseWeightLimit: 31500, baseFee: 13.04, perKgFee: 0.09 }
    ],
    specialOversize: {
      maxFlatWeight: [{ w: 30000, fee: 16.22 }, { w: 40000, fee: 17.24 }, { w: 50000, fee: 34.38 }, { w: 60000, fee: 42.04 }],
      baseWeightLimit: 60000,
      baseFee: 42.04,
      perKgFee: 0.35
    }
  },
  DE: {
    code: 'DE',
    currency: 'EUR',
    symbol: '€',
    hazmatRegion: 'EU',
    lowPriceLimits: { restricted: 11, regular: 20 },
    lowPrice: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 1.61 }, { w: 40, fee: 1.64 }, { w: 60, fee: 1.66 }, { w: 80, fee: 1.8 }, { w: 100, fee: 1.83 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 1.86 }, { w: 460, fee: 2.02 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 2.39 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 2.78 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 400, steps: [{ w: 150, fee: 2.78 }, { w: 400, fee: 2.99 }] }
    ],
    standard: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 2.07 }, { w: 40, fee: 2.11 }, { w: 60, fee: 2.13 }, { w: 80, fee: 2.26 }, { w: 100, fee: 2.28 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 2.31 }, { w: 460, fee: 2.42 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 2.78 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 3.16 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 3900, steps: [{ w: 150, fee: 3.12 }, { w: 400, fee: 3.13 }, { w: 900, fee: 3.14 }, { w: 1400, fee: 3.15 }, { w: 1900, fee: 3.17 }, { w: 3900, fee: 4.28 }] },
      { name: 'Standard parcel', maxL: 45, maxW: 34, maxH: 26, maxWeight: 11900, steps: [{ w: 150, fee: 3.13 }, { w: 400, fee: 3.16 }, { w: 900, fee: 3.18 }, { w: 1400, fee: 3.67 }, { w: 1900, fee: 3.69 }, { w: 2900, fee: 4.29 }, { w: 3900, fee: 4.83 }, { w: 5900, fee: 4.96 }, { w: 8900, fee: 5.77 }, { w: 11900, fee: 6.39 }] }
    ],
    selectedParcel: [
      { name: 'Small parcel 1', maxL: 35, maxW: 25, maxH: 7, maxUnitWeight: 3900, baseFee: 3.3, per100g: 0.05 },
      { name: 'Small parcel 2', maxL: 35, maxW: 25, maxH: 9, maxUnitWeight: 3900, baseFee: 3.34, per100g: 0.06 },
      { name: 'Small parcel 3', maxL: 35, maxW: 25, maxH: 12, maxUnitWeight: 3900, baseFee: 3.38, per100g: 0.07 },
      { name: 'Medium parcel 1', maxL: 40, maxW: 30, maxH: 6, maxUnitWeight: 11900, baseFee: 3.5, per100g: 0.07 },
      { name: 'Medium parcel 2', maxL: 40, maxW: 30, maxH: 20, maxUnitWeight: 11900, baseFee: 3.73, per100g: 0.07 },
      { name: 'Large parcel 1', maxL: 45, maxW: 34, maxH: 10, maxUnitWeight: 11900, baseFee: 3.97, per100g: 0.07 },
      { name: 'Large parcel 2', maxL: 45, maxW: 34, maxH: 26, maxUnitWeight: 11900, baseFee: 4.38, per100g: 0.08 }
    ],
    oversize: [
      { name: 'Small oversize', maxL: 61, maxW: 46, maxH: 46, minUnitWeight: 0, maxUnitWeight: 1760, maxBillableWeight: 25820, baseWeightLimit: 760, baseFee: 4.3, perKgFee: 0.18 },
      { name: 'Standard oversize light', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 15000, maxBillableWeight: 72720, baseWeightLimit: 760, baseFee: 4.33, perKgFee: 0.18 },
      { name: 'Standard oversize heavy', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 15000, maxUnitWeight: 23000, maxBillableWeight: 72720, baseWeightLimit: 15760, baseFee: 6.99, perKgFee: 0.07 },
      { name: 'Standard oversize large', maxL: 120, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 86400, baseWeightLimit: 760, baseFee: 5.8, perKgFee: 0.08 },
      { name: 'Bulky oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 126000, baseWeightLimit: 760, baseFee: 7.98, perKgFee: 0.27 },
      { name: 'Heavy oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 23000, maxUnitWeight: 31500, maxBillableWeight: 126000, baseWeightLimit: 31500, baseFee: 12.74, perKgFee: 0.15 }
    ],
    specialOversize: {
      maxFlatWeight: [{ w: 30000, fee: 21.3 }, { w: 40000, fee: 24.19 }, { w: 50000, fee: 47.98 }, { w: 60000, fee: 51.99 }],
      baseWeightLimit: 60000,
      baseFee: 51.99,
      perKgFee: 0.36
    }
  },
  FR: {
    code: 'FR',
    currency: 'EUR',
    symbol: '€',
    hazmatRegion: 'EU',
    lowPriceLimits: { restricted: 12, regular: 20 },
    lowPrice: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 2.24 }, { w: 40, fee: 2.26 }, { w: 60, fee: 2.27 }, { w: 80, fee: 2.79 }, { w: 100, fee: 2.81 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 2.81 }, { w: 460, fee: 3.31 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 3.96 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 4.31 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 400, steps: [{ w: 150, fee: 4.31 }, { w: 400, fee: 4.71 }] }
    ],
    standard: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 2.75 }, { w: 40, fee: 2.76 }, { w: 60, fee: 2.78 }, { w: 80, fee: 3.3 }, { w: 100, fee: 3.32 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 3.33 }, { w: 460, fee: 3.77 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 4.39 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 4.72 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 3900, steps: [{ w: 150, fee: 4.56 }, { w: 400, fee: 5.07 }, { w: 900, fee: 5.79 }, { w: 1400, fee: 5.87 }, { w: 1900, fee: 6.1 }, { w: 3900, fee: 7.8 }] },
      { name: 'Standard parcel', maxL: 45, maxW: 34, maxH: 26, maxWeight: 11900, steps: [{ w: 150, fee: 4.58 }, { w: 400, fee: 5.22 }, { w: 900, fee: 6.01 }, { w: 1400, fee: 6.41 }, { w: 1900, fee: 6.44 }, { w: 2900, fee: 7.08 }, { w: 3900, fee: 7.81 }, { w: 5900, fee: 8.22 }, { w: 8900, fee: 8.84 }, { w: 11900, fee: 9.38 }] }
    ],
    selectedParcel: [
      { name: 'Small parcel 1', maxL: 35, maxW: 25, maxH: 7, maxUnitWeight: 3900, baseFee: 4.97, per100g: 0.03 },
      { name: 'Small parcel 2', maxL: 35, maxW: 25, maxH: 9, maxUnitWeight: 3900, baseFee: 5.01, per100g: 0.05 },
      { name: 'Small parcel 3', maxL: 35, maxW: 25, maxH: 12, maxUnitWeight: 3900, baseFee: 5.05, per100g: 0.08 },
      { name: 'Medium parcel 1', maxL: 40, maxW: 30, maxH: 6, maxUnitWeight: 11900, baseFee: 5.45, per100g: 0.08 },
      { name: 'Medium parcel 2', maxL: 40, maxW: 30, maxH: 20, maxUnitWeight: 11900, baseFee: 5.69, per100g: 0.08 },
      { name: 'Large parcel 1', maxL: 45, maxW: 34, maxH: 10, maxUnitWeight: 11900, baseFee: 6.16, per100g: 0.08 },
      { name: 'Large parcel 2', maxL: 45, maxW: 34, maxH: 26, maxUnitWeight: 11900, baseFee: 6.25, per100g: 0.08 }
    ],
    oversize: [
      { name: 'Small oversize', maxL: 61, maxW: 46, maxH: 46, minUnitWeight: 0, maxUnitWeight: 1760, maxBillableWeight: 25820, baseWeightLimit: 760, baseFee: 7.05, perKgFee: 0.2 },
      { name: 'Standard oversize light', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 15000, maxBillableWeight: 72720, baseWeightLimit: 760, baseFee: 7.29, perKgFee: 0.21 },
      { name: 'Standard oversize heavy', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 15000, maxUnitWeight: 23000, maxBillableWeight: 72720, baseWeightLimit: 15760, baseFee: 10.42, perKgFee: 0.11 },
      { name: 'Standard oversize large', maxL: 120, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 86400, baseWeightLimit: 760, baseFee: 8.47, perKgFee: 0.13 },
      { name: 'Bulky oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 126000, baseWeightLimit: 760, baseFee: 15.38, perKgFee: 0.45 },
      { name: 'Heavy oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 23000, maxUnitWeight: 31500, maxBillableWeight: 126000, baseWeightLimit: 31500, baseFee: 15.59, perKgFee: 0.18 }
    ],
    specialOversize: {
      maxFlatWeight: [{ w: 30000, fee: 24.88 }, { w: 40000, fee: 28.77 }, { w: 50000, fee: 46.66 }, { w: 60000, fee: 50.54 }],
      baseWeightLimit: 60000,
      baseFee: 50.54,
      perKgFee: 0.49
    }
  },
  ES: {
    code: 'ES',
    currency: 'EUR',
    symbol: '€',
    hazmatRegion: 'EU',
    lowPriceLimits: { restricted: 12, regular: 20 },
    lowPrice: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 2.15 }, { w: 40, fee: 2.21 }, { w: 60, fee: 2.23 }, { w: 80, fee: 2.55 }, { w: 100, fee: 2.59 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 2.61 }, { w: 460, fee: 2.85 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 3 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 3.23 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 400, steps: [{ w: 150, fee: 3.23 }, { w: 400, fee: 3.46 }] }
    ],
    standard: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 2.77 }, { w: 40, fee: 2.84 }, { w: 60, fee: 2.87 }, { w: 80, fee: 3.21 }, { w: 100, fee: 3.23 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 3.26 }, { w: 460, fee: 3.45 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 3.6 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 3.85 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 3900, steps: [{ w: 150, fee: 3.52 }, { w: 400, fee: 3.74 }, { w: 900, fee: 3.95 }, { w: 1400, fee: 4.21 }, { w: 1900, fee: 4.27 }, { w: 3900, fee: 5.5 }] },
      { name: 'Standard parcel', maxL: 45, maxW: 34, maxH: 26, maxWeight: 11900, steps: [{ w: 150, fee: 3.55 }, { w: 400, fee: 3.77 }, { w: 900, fee: 3.99 }, { w: 1400, fee: 4.85 }, { w: 1900, fee: 4.94 }, { w: 2900, fee: 4.98 }, { w: 3900, fee: 5.53 }, { w: 5900, fee: 5.96 }, { w: 8900, fee: 7.24 }, { w: 11900, fee: 7.85 }] }
    ],
    selectedParcel: [
      { name: 'Small parcel 1', maxL: 35, maxW: 25, maxH: 7, maxUnitWeight: 3900, baseFee: 3.55, per100g: 0.04 },
      { name: 'Small parcel 2', maxL: 35, maxW: 25, maxH: 9, maxUnitWeight: 3900, baseFee: 3.59, per100g: 0.04 },
      { name: 'Small parcel 3', maxL: 35, maxW: 25, maxH: 12, maxUnitWeight: 3900, baseFee: 3.62, per100g: 0.05 },
      { name: 'Medium parcel 1', maxL: 40, maxW: 30, maxH: 6, maxUnitWeight: 11900, baseFee: 3.85, per100g: 0.07 },
      { name: 'Medium parcel 2', maxL: 40, maxW: 30, maxH: 20, maxUnitWeight: 11900, baseFee: 3.91, per100g: 0.08 },
      { name: 'Large parcel 1', maxL: 45, maxW: 34, maxH: 10, maxUnitWeight: 11900, baseFee: 4.08, per100g: 0.11 },
      { name: 'Large parcel 2', maxL: 45, maxW: 34, maxH: 26, maxUnitWeight: 11900, baseFee: 4.53, per100g: 0.11 }
    ],
    oversize: [
      { name: 'Small oversize', maxL: 61, maxW: 46, maxH: 46, minUnitWeight: 0, maxUnitWeight: 1760, maxBillableWeight: 25820, baseWeightLimit: 760, baseFee: 5.68, perKgFee: 0.04 },
      { name: 'Standard oversize light', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 15000, maxBillableWeight: 72720, baseWeightLimit: 760, baseFee: 6.55, perKgFee: 0.34 },
      { name: 'Standard oversize heavy', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 15000, maxUnitWeight: 23000, maxBillableWeight: 72720, baseWeightLimit: 15760, baseFee: 11.72, perKgFee: 0.27 },
      { name: 'Standard oversize large', maxL: 120, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 86400, baseWeightLimit: 760, baseFee: 6.76, perKgFee: 0.33 },
      { name: 'Bulky oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 126000, baseWeightLimit: 760, baseFee: 9.95, perKgFee: 0.43 },
      { name: 'Heavy oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 23000, maxUnitWeight: 31500, maxBillableWeight: 126000, baseWeightLimit: 31500, baseFee: 14, perKgFee: 0.12 }
    ],
    specialOversize: {
      maxFlatWeight: [{ w: 30000, fee: 19.93 }, { w: 40000, fee: 20.8 }, { w: 50000, fee: 34.32 }, { w: 60000, fee: 36.93 }],
      baseWeightLimit: 60000,
      baseFee: 36.93,
      perKgFee: 0.45
    }
  },
  IT: {
    code: 'IT',
    currency: 'EUR',
    symbol: '€',
    hazmatRegion: 'EU',
    lowPriceLimits: { restricted: 12, regular: 20 },
    lowPrice: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 2.64 }, { w: 40, fee: 2.65 }, { w: 60, fee: 2.67 }, { w: 80, fee: 2.79 }, { w: 100, fee: 2.81 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 2.81 }, { w: 460, fee: 3.04 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 3.35 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 3.59 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 400, steps: [{ w: 150, fee: 3.59 }, { w: 400, fee: 3.91 }] }
    ],
    standard: [
      { name: 'Light envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 100, steps: [{ w: 20, fee: 3.23 }, { w: 40, fee: 3.26 }, { w: 60, fee: 3.28 }, { w: 80, fee: 3.39 }, { w: 100, fee: 3.41 }] },
      { name: 'Standard envelope', maxL: 33, maxW: 23, maxH: 2.5, maxWeight: 460, steps: [{ w: 210, fee: 3.45 }, { w: 460, fee: 3.64 }] },
      { name: 'Large envelope', maxL: 33, maxW: 23, maxH: 4, maxWeight: 960, steps: [{ w: 960, fee: 3.94 }] },
      { name: 'Extra-large envelope', maxL: 33, maxW: 23, maxH: 6, maxWeight: 960, steps: [{ w: 960, fee: 4.17 }] },
      { name: 'Small parcel', maxL: 35, maxW: 25, maxH: 12, maxWeight: 3900, steps: [{ w: 150, fee: 4.13 }, { w: 400, fee: 4.54 }, { w: 900, fee: 4.95 }, { w: 1400, fee: 5.11 }, { w: 1900, fee: 5.14 }, { w: 3900, fee: 5.16 }] },
      { name: 'Standard parcel', maxL: 45, maxW: 34, maxH: 26, maxWeight: 11900, steps: [{ w: 150, fee: 4.29 }, { w: 400, fee: 4.7 }, { w: 900, fee: 5.15 }, { w: 1400, fee: 5.26 }, { w: 1900, fee: 5.29 }, { w: 2900, fee: 5.3 }, { w: 3900, fee: 5.35 }, { w: 5900, fee: 5.38 }, { w: 8900, fee: 5.41 }, { w: 11900, fee: 6.25 }] }
    ],
    selectedParcel: [
      { name: 'Small parcel 1', maxL: 35, maxW: 25, maxH: 7, maxUnitWeight: 3900, baseFee: 4.54, per100g: 0.02 },
      { name: 'Small parcel 2', maxL: 35, maxW: 25, maxH: 9, maxUnitWeight: 3900, baseFee: 4.58, per100g: 0.03 },
      { name: 'Small parcel 3', maxL: 35, maxW: 25, maxH: 12, maxUnitWeight: 3900, baseFee: 4.62, per100g: 0.06 },
      { name: 'Medium parcel 1', maxL: 40, maxW: 30, maxH: 6, maxUnitWeight: 11900, baseFee: 4.83, per100g: 0.06 },
      { name: 'Medium parcel 2', maxL: 40, maxW: 30, maxH: 20, maxUnitWeight: 11900, baseFee: 5.05, per100g: 0.07 },
      { name: 'Large parcel 1', maxL: 45, maxW: 34, maxH: 10, maxUnitWeight: 11900, baseFee: 5.3, per100g: 0.08 },
      { name: 'Large parcel 2', maxL: 45, maxW: 34, maxH: 26, maxUnitWeight: 11900, baseFee: 5.44, per100g: 0.08 }
    ],
    oversize: [
      { name: 'Small oversize', maxL: 61, maxW: 46, maxH: 46, minUnitWeight: 0, maxUnitWeight: 1760, maxBillableWeight: 25820, baseWeightLimit: 760, baseFee: 7.21, perKgFee: 0.08 },
      { name: 'Standard oversize light', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 15000, maxBillableWeight: 72720, baseWeightLimit: 760, baseFee: 7.45, perKgFee: 0.22 },
      { name: 'Standard oversize heavy', maxL: 101, maxW: 60, maxH: 60, minUnitWeight: 15000, maxUnitWeight: 23000, maxBillableWeight: 72720, baseWeightLimit: 15760, baseFee: 10.63, perKgFee: 0.08 },
      { name: 'Standard oversize large', maxL: 120, maxW: 60, maxH: 60, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 86400, baseWeightLimit: 760, baseFee: 9.13, perKgFee: 0.09 },
      { name: 'Bulky oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 0, maxUnitWeight: 23000, maxBillableWeight: 126000, baseWeightLimit: 760, baseFee: 9.59, perKgFee: 0.3 },
      { name: 'Heavy oversize', maxL: Infinity, maxW: Infinity, maxH: Infinity, minUnitWeight: 23000, maxUnitWeight: 31500, maxBillableWeight: 126000, baseWeightLimit: 31500, baseFee: 16.85, perKgFee: 0.15 }
    ],
    specialOversize: {
      maxFlatWeight: [{ w: 30000, fee: 21.7 }, { w: 40000, fee: 24.1 }, { w: 50000, fee: 32.19 }, { w: 60000, fee: 32.82 }],
      baseWeightLimit: 60000,
      baseFee: 32.82,
      perKgFee: 0.65
    }
  }
};
