import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface BatchFilters {
  // Text filters
  batch_number__icontains: string;
  product__sku__icontains: string;
  // Manufacture date range
  manufacture_date_start: string;
  manufacture_date_end: string;
  // Expiry date range
  expiry_date_start: string;
  expiry_date_end: string;
  // Created at range
  created_at_start: string;
  created_at_end: string;
  // Sorting and pagination
  ordering: string;
  page: number;
  page_size: number;
}

interface BatchFiltersState {
  filters: BatchFilters;
  setFilter: (key: keyof BatchFilters, value: any) => void;
  setFilters: (partial: Partial<BatchFilters>) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
  activeFilterCount: () => number;
  // Aliases used by InventoryPage.tsx
  updateFilter: (key: keyof BatchFilters, value: any) => void;
  setQuickFilter: (preset: string) => void;
  setDatePreset: (preset: string) => void;
  applyAdvancedFilters: (filters: Partial<BatchFilters>) => void;
}

const DEFAULT_FILTERS: BatchFilters = {
  batch_number__icontains: '',
  product__sku__icontains: '',
  manufacture_date_start: '',
  manufacture_date_end: '',
  expiry_date_start: '',
  expiry_date_end: '',
  created_at_start: '',
  created_at_end: '',
  ordering: '',
  page: 1,
  page_size: 25,
};

const useBatchFiltersStore = create<BatchFiltersState>()(
  devtools(
    immer((set, get) => ({
      filters: { ...DEFAULT_FILTERS },

      setFilter: (key, value) => {
        set((state) => {
          (state.filters as any)[key] = value;
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

        // Text filters
        if (filters.batch_number__icontains) {
          params.batch_number__icontains = filters.batch_number__icontains;
        }
        if (filters.product__sku__icontains) {
          params.product__sku__icontains = filters.product__sku__icontains;
        }

        // Date ranges — serialise as field__range=start,end
        if (filters.manufacture_date_start && filters.manufacture_date_end) {
          params.manufacture_date__range = `${filters.manufacture_date_start},${filters.manufacture_date_end}`;
        } else if (filters.manufacture_date_start) {
          params.manufacture_date__gte = filters.manufacture_date_start;
        } else if (filters.manufacture_date_end) {
          params.manufacture_date__lte = filters.manufacture_date_end;
        }

        if (filters.expiry_date_start && filters.expiry_date_end) {
          params.expiry_date__range = `${filters.expiry_date_start},${filters.expiry_date_end}`;
        } else if (filters.expiry_date_start) {
          params.expiry_date__gte = filters.expiry_date_start;
        } else if (filters.expiry_date_end) {
          params.expiry_date__lte = filters.expiry_date_end;
        }

        if (filters.created_at_start && filters.created_at_end) {
          params.created_at__range = `${filters.created_at_start},${filters.created_at_end}`;
        } else if (filters.created_at_start) {
          params.created_at__gte = filters.created_at_start;
        } else if (filters.created_at_end) {
          params.created_at__lte = filters.created_at_end;
        }

        // Sorting
        if (filters.ordering) {
          params.ordering = filters.ordering;
        }

        // Pagination (always included)
        params.page = filters.page;
        params.page_size = filters.page_size;

        return params;
      },

      activeFilterCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.batch_number__icontains) count++;
        if (filters.product__sku__icontains) count++;
        if (filters.manufacture_date_start || filters.manufacture_date_end) count++;
        if (filters.expiry_date_start || filters.expiry_date_end) count++;
        if (filters.created_at_start || filters.created_at_end) count++;
        if (filters.ordering) count++;
        return count;
      },

      // Aliases / stubs for InventoryPage.tsx compatibility
      updateFilter: (key, value) => {
        get().setFilter(key, value);
      },

      setQuickFilter: (preset) => {
        // Stub — extend per business requirement
        console.debug('[BatchFilters] setQuickFilter:', preset);
      },

      setDatePreset: (preset) => {
        // Stub — extend per business requirement
        console.debug('[BatchFilters] setDatePreset:', preset);
      },

      applyAdvancedFilters: (filters) => {
        get().setFilters(filters);
      },
    })),
    { name: 'BatchFiltersStore' }
  )
);

export const useBatchFilters = () => useBatchFiltersStore();
export default useBatchFilters;
