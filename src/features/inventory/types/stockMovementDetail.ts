/**
 * Stock Movement Detail Types
 * Extended stock movement model with all API response fields and related data
 */

import { StockMovement, BatchRegistry } from './models';

/**
 * Full stock movement detail response from API
 * Includes expanded batch details within batches_detail array
 */
export interface StockMovementDetailResponse {
  id: string;
  warehouse: string;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reference_number: string;
  notes?: string;
  total_quantity: number | string;
  created_at: string; // ISO datetime
  updated_at?: string; // ISO datetime
  batches_detail: StockMovementBatchDetailFull[];
}

/**
 * Expanded batch detail within a stock movement
 * Includes full batch registry object + movement quantity
 */
export interface StockMovementBatchDetailFull {
  batch: BatchRegistryExpanded;
  quantity: number | string;
}

/**
 * Expanded batch registry with denormalized fields
 */
export interface BatchRegistryExpanded extends BatchRegistry {
  product_name?: string; // Denormalized from API
  warehouse_name?: string; // Denormalized from API
}

/**
 * Stock movement type enum
 */
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

/**
 * Stock movement status enum
 */
export type MovementStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED';

/**
 * Stock movement detail page store state
 */
export interface StockMovementDetailState {
  // Main data
  movement: StockMovementDetailResponse | null;
  movementsList: StockMovementDetailResponse[]; // For breadcrumb dropdown
  
  // Loading states
  isLoading: boolean;
  isDeletingMovement: boolean;
  isLoadingList: boolean;
  
  // Error states
  error: string | null;
  deleteError: string | null;
  
  // Cache metadata
  cache: {
    lastFetched: number | null;
    ttl: number; // milliseconds (default 5 min)
    isFetching: boolean;
  };
  
  // Pagination for movements list (for dropdown)
  movementsListPagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };

  // Actions
  fetchMovement: (movementId: string) => Promise<void>;
  deleteMovement: (movementId: string) => Promise<void>;
  fetchMovementsList: (page?: number, pageSize?: number) => Promise<void>;
  clearMovement: () => void;
  setError: (error: string | null) => void;
}

/**
 * Delete movement response
 */
export interface DeleteMovementResponse {
  success: boolean;
  message: string;
}
