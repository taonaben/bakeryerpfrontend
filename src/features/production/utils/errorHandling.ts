import type { AxiosError } from 'axios';
import type { ProductionApiErrorResponse } from '../types/productionModels';

export class ProductionApiServiceError extends Error {
  details: ProductionApiErrorResponse | null;

  constructor(message: string, details: ProductionApiErrorResponse | null = null) {
    super(message);
    this.name = 'ProductionApiServiceError';
    this.details = details;
  }
}

const stringifyDetails = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyDetails(item))
      .filter(Boolean)
      .join(', ');
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const nestedMessage = stringifyDetails(nested);
        return nestedMessage ? `${key}: ${nestedMessage}` : key;
      })
      .join(', ');
  }

  return null;
};

export const toProductionServiceError = (
  error: unknown,
  fallbackMessage: string,
): ProductionApiServiceError => {
  const axiosError = error as AxiosError<ProductionApiErrorResponse>;
  const details = axiosError.response?.data || null;
  const message =
    stringifyDetails(details?.errors) ||
    details?.detail ||
    details?.message ||
    (error as Error)?.message ||
    fallbackMessage;

  return new ProductionApiServiceError(message, details);
};
