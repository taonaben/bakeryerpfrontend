import type { PurchaseRequisition, UpdateRequisitionDTO } from './models';

// ──────────────────────────────────────────────
// Cache metadata (shared by all detail stores)
// ──────────────────────────────────────────────

export interface CacheMetadata {
  lastFetched: number | null;
  ttl: number;
  isFetching: boolean;
}

// ──────────────────────────────────────────────
// Requisition Detail Store State
// ──────────────────────────────────────────────

export interface RequisitionDetailState {
  // Main data
  requisition: PurchaseRequisition | null;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  isApproving: boolean;
  isRejecting: boolean;

  // Error states
  error: string | null;
  updateError: string | null;

  // Cache
  cache: CacheMetadata;

  // Actions
  fetchRequisition: (id: string) => Promise<void>;
  updateRequisition: (id: string, data: UpdateRequisitionDTO) => Promise<void>;
  deleteRequisition: (id: string) => Promise<void>;
  submitRequisition: (id: string) => Promise<void>;
  approveRequisition: (id: string) => Promise<void>;
  rejectRequisition: (id: string, reason: string) => Promise<void>;
  clearRequisition: () => void;
  setError: (error: string | null) => void;
}
