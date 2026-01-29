// Base types
export interface Timestamp {
  created_at: string;
  updated_at: string;
}



// Domain models

export interface BatchRegistry extends Timestamp {
  id: string;
  batch_number: string;
  product: string;
  warehouse: string;
  manufacture_date: string;
  expiry_date: string;
  quantity: number | string;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
}

export interface StockMovementBatchDetail {
  batch: BatchRegistry;
  quantity: number | string;
}
export interface StockMovement extends Timestamp {
  id: string;
  warehouse?: string;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reference_number: string;
  notes?: string;
  total_quantity: number;
  created_at: string;
  batches_detail: StockMovementBatchDetail[];

}

export interface StockBalance extends Timestamp {
  id: string;
  product: string;
  warehouse: string;
  quantity_on_hand: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  last_updated: string;
}



// API response wrappers
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Form DTOs
export interface CreateMovementDTO {
  warehouse: string;
  batch: string;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reference_number: string;
  notes: string;
}