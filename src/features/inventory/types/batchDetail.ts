/**
 * Batch Detail Types
 * Extended batch model with all API response fields and related data
 */

import { StockMovement } from './models';

/**
 * Full batch detail response from API
 * Includes denormalized product/warehouse names
 */
export interface BatchDetailResponse {
  id: string;
  product: string; // Product ID
  product_name: string; // Denormalized from API
  warehouse: string; // Warehouse ID
  warehouse_name: string; // Denormalized from API
  batch_number: string;
  quantity: string | number;
  manufacture_date: string; // ISO date
  expiry_date: string; // ISO date
  rework_consumed: boolean; // Flag indicating if this batch was reworked
  created_at: string; // ISO datetime
  updated_at?: string; // ISO datetime
}

/**
 * Rework tracking info
 * When a batch is reworked, it's flagged and quantity set to 0
 */
export interface ReworkInfo {
  consumed: boolean;
  quantity_before_rework?: number;
  rework_timestamp?: string;
}

/**
 * Expiry status enum
 */
export type ExpiryStatus = 'good' | 'near' | 'expired';

/**
 * Batch status enum
 */
export type BatchStatus = 'ACTIVE' | 'EXPIRED' | 'DEPLETED' | 'REWORKED';

/**
 * Batch detail page store state
 */
export interface BatchDetailState {
  // Main data
  batch: BatchDetailResponse | null;
  movements: StockMovement[];
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isDeletingbatch: boolean;
  
  // Error states
  error: string | null;
  updateError: string | null;
  
  // Cache metadata
  cache: {
    lastFetched: number | null;
    ttl: number; // milliseconds (default 5 min)
    isFetching: boolean;
  };
  
  // Pagination for movements
  movementsPagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };

  // Actions
  fetchBatch: (batchId: string, warehouseId?: string) => Promise<void>;
  updateBatch: (
    batchId: string,
    data: Partial<Pick<BatchDetailResponse, 'quantity' | 'manufacture_date' | 'expiry_date'>>
  ) => Promise<void>;
  deleteBatch: (batchId: string) => Promise<void>;
  fetchMovements: (batchId: string, page?: number) => Promise<void>;
  clearBatch: () => void;
  setError: (error: string | null) => void;
}

/**
 * Update batch payload (API PATCH request)
 */
export interface UpdateBatchPayload {
  quantity?: number | string;
  manufacture_date?: string;
  expiry_date?: string;
}

/**
 * Delete batch response (might be empty 204, or contain deleted resource)
 */
export interface DeleteBatchResponse {
  success: boolean;
  message?: string;
}
