export function normalizeDimensions(length: number, width: number, height: number): [number, number, number] {
  const normalized = [length, width, height].map((value) => Number(value.toFixed(4)));
  normalized.sort((a, b) => b - a);
  return [normalized[0], normalized[1], normalized[2]];
}

export function normalizeCategory(selectedCategory: string, customCategory: string): string {
  const custom = customCategory.trim();
  if (custom.length > 0) {
    return custom;
  }
  return selectedCategory.trim();
}
