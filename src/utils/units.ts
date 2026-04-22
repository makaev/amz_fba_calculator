export type DimensionUnit = 'cm' | 'in';
export type WeightUnit = 'kg' | 'lb';

export function convertDimension(value: number, from: DimensionUnit, to: DimensionUnit): number {
  if (from === to) return value;
  return from === 'cm' ? value / 2.54 : value * 2.54;
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  return from === 'kg' ? value * 2.2046226218 : value / 2.2046226218;
}
