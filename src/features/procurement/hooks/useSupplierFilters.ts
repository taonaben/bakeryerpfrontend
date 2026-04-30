import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ──────────────────────────────────────────────
// Filter shape
// ──────────────────────────────────────────────

export interface SupplierFilters {
  search: string;
  /** 'true' = Active only, 'false' = Inactive only, '' = All */
  is_active: 'true' | 'false' | '';
  ordering: string;
  page: number;
  page_size: number;
}

// ──────────────────────────────────────────────
// Store interface
// ──────────────────────────────────────────────

interface SupplierFiltersState {
  filters: SupplierFilters;
  setFilter: (key: keyof SupplierFilters, value: any) => void;
  setFilters: (partial: Partial<SupplierFilters>) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
}

// ──────────────────────────────────────────────
// Defaults
// ──────────────────────────────────────────────

const DEFAULT_FILTERS: SupplierFilters = {
  search: '',
  is_active: 'true',
  ordering: '-created_at',
  page: 1,
  page_size: 25,
};

// ──────────────────────────────────────────────
// Zustand store
// ──────────────────────────────────────────────

const useSupplierFilters = create<SupplierFiltersState>()(
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

        if (filters.search) params.search = filters.search;
        // Omit is_active entirely when '' (All tab) — backend returns all
        if (filters.is_active !== '') params.is_active = filters.is_active;
        if (filters.ordering) params.ordering = filters.ordering;
        params.page = filters.page;
        params.page_size = filters.page_size;

        return params;
      },
    })),
    { name: 'SupplierFiltersStore' },
  ),
);

export default useSupplierFilters;
