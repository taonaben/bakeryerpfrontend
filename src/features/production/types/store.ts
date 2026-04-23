// ──────────────────────────────────────────────
// Production Planning – Store Type Definitions
// ──────────────────────────────────────────────

import type { PlannedOrder, PlannedOrderPriority, PlannedOrderStatus } from './plannedOrderModel';

// ──────────────────────────────────────────────
// List Store
// ──────────────────────────────────────────────

export interface PlannedOrderListState {
  // Data
  orders: PlannedOrder[];
  count: number;
  currentPage: number;
  totalPages: number;

  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Selection (for bulk actions)
  selectedIds: Set<string>;

  // Actions
  fetchOrders: (params: Record<string, any>) => Promise<void>;
  selectOrder: (id: string) => void;
  deselectOrder: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

// ──────────────────────────────────────────────
// Detail Store
// ──────────────────────────────────────────────

export interface CacheMetadata {
  lastFetched: number | null;
  ttl: number;
  isFetching: boolean;
}

export interface PlannedOrderDetailState {
  // Data
  order: PlannedOrder | null;

  // Loading & Error States
  isLoading: boolean;
  isUpdating: boolean;
  isRequesting: boolean; // Priority override request
  isApproving: boolean;
  isRejecting: boolean;
  isDeleting: boolean;
  error: string | null;
  updateError: string | null;
  overrideError: string | null;

  // Cache
  cache: CacheMetadata;

  // Actions
  fetchOrder: (id: string) => Promise<void>;
  updateOrder: (id: string, data: any) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  requestPriorityOverride: (id: string, data: any) => Promise<void>;
  approvePriorityOverride: (id: string) => Promise<void>;
  rejectPriorityOverride: (id: string, reason: string) => Promise<void>;
  clearOrder: () => void;
  invalidateCache: () => void;
}

// ──────────────────────────────────────────────
// Filter State
// ──────────────────────────────────────────────

export interface PlanningFilters {
  // Text search
  search: string;
  // Status filter
  status: PlannedOrderStatus | '';
  // Priority filter
  priority: PlannedOrderPriority | '';
  // Warehouse
  warehouse_id: string;
  // Date range
  need_by_after: string;
  need_by_before: string;
  // Sort
  ordering: string;
  // Pagination
  page: number;
  page_size: number;
}

export interface PlanningFiltersState {
  filters: PlanningFilters;
  setFilter: (key: keyof PlanningFilters, value: any) => void;
  setFilters: (partial: Partial<PlanningFilters>) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
  activeFilterCount: () => number;
}
