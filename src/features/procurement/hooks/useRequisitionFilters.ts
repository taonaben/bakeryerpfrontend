import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { RequisitionStatus } from '../types/models';

// ──────────────────────────────────────────────
// Filter shape
// ──────────────────────────────────────────────

export interface RequisitionFilters {
  // Text search (PR number + title)
  search: string;
  // Status filter
  status: RequisitionStatus | '';
  // Relational
  warehouse_id: string;
  requested_by: string;
  // Date range
  created_at_after: string;
  created_at_before: string;
  // Sort
  ordering: string;
  // Pagination
  page: number;
  page_size: number;
}

// ──────────────────────────────────────────────
// Store interface
// ──────────────────────────────────────────────

interface RequisitionFiltersState {
  filters: RequisitionFilters;
  setFilter: (key: keyof RequisitionFilters, value: any) => void;
  setFilters: (partial: Partial<RequisitionFilters>) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
  activeFilterCount: () => number;
}

// ──────────────────────────────────────────────
// Defaults
// ──────────────────────────────────────────────

const DEFAULT_FILTERS: RequisitionFilters = {
  search: '',
  status: '',
  warehouse_id: '',
  requested_by: '',
  created_at_after: '',
  created_at_before: '',
  ordering: '-created_at',
  page: 1,
  page_size: 25,
};

// ──────────────────────────────────────────────
// Zustand store
// ──────────────────────────────────────────────

const useRequisitionFilters = create<RequisitionFiltersState>()(
  devtools(
    immer((set, get) => ({
      filters: { ...DEFAULT_FILTERS },

      setFilter: (key, value) => {
        set((state) => {
          (state.filters as any)[key] = value;
          // Reset to page 1 whenever a non-pagination filter changes
          if (key !== 'page') {
            state.filters.page = 1;
          }
        });
      },

      setFilters: (partial) => {
        set((state) => {
          Object.assign(state.filters, partial);
        });
      },

      clearAllFilters: () => {
        set((state) => {
          state.filters = { ...DEFAULT_FILTERS };
        });
      },

      getApiQueryParams: () => {
        const { filters } = get();
        const params: Record<string, any> = {};

        // Text search
        if (filters.search) params.search = filters.search;

        // Status
        if (filters.status) params.status = filters.status;

        // Relational
        if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;
        if (filters.requested_by) params.requested_by = filters.requested_by;

        // Date range
        if (filters.created_at_after && filters.created_at_before) {
          params.created_at__range = `${filters.created_at_after},${filters.created_at_before}`;
        } else if (filters.created_at_after) {
          params.created_at__gte = filters.created_at_after;
        } else if (filters.created_at_before) {
          params.created_at__lte = filters.created_at_before;
        }

        // Sorting
        if (filters.ordering) params.ordering = filters.ordering;

        // Pagination (always included)
        params.page = filters.page;
        params.page_size = filters.page_size;

        return params;
      },

      activeFilterCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.warehouse_id) count++;
        if (filters.requested_by) count++;
        if (filters.created_at_after || filters.created_at_before) count++;
        if (filters.ordering && filters.ordering !== '-created_at') count++;
        return count;
      },
    })),
    { name: 'requisition-filters' },
  ),
);

export default useRequisitionFilters;
