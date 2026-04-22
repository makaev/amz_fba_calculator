import { ValidationErrors } from '../types';

function validatePositiveNumber(value: number, label: string): string | undefined {
  if (Number.isNaN(value)) {
    return `${label} is required.`;
  }
  if (value <= 0) {
    return `${label} must be greater than 0.`;
  }
  return undefined;
}

export function validateInput(
  length: number,
  width: number,
  height: number,
  weight: number,
  category: string,
  price?: number,
  marketplace?: string
): ValidationErrors {
  return {
    length: validatePositiveNumber(length, 'Length'),
    width: validatePositiveNumber(width, 'Width'),
    height: validatePositiveNumber(height, 'Height'),
    weight: validatePositiveNumber(weight, 'Weight'),
    price: price === undefined ? undefined : validatePositiveNumber(price, 'Price'),
    marketplace: marketplace === undefined || marketplace.trim() ? undefined : 'Marketplace is required.',
    category: category.trim() ? undefined : 'Category is required.'
  };
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.values(errors).some(Boolean);
}
