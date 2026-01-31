import type { product } from './models';

export interface CacheMetadata {
  lastFetched: number | null;
  isStale: boolean;
  isFetching: boolean;
}

export interface ProductStoreState {
  // Data
  products: product[];
  productMap: Record<string, product>;

  // UI State
  searchTerm: string;

  // Cache metadata
  productsCache: CacheMetadata;
  productCache: Record<string, CacheMetadata>;

  // Loading & Error
  loading: boolean;
  error: string | null;
}
