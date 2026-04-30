import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type StockStatus = 'EMPTY' | 'ALMOST_OUT' | 'GOOD' | 'FULL';

export interface StockFilters {
  product__sku__icontains: string;
  quantity_on_hand__gte: string;
  quantity_on_hand__lte: string;
  status: StockStatus[];
  created_at_start: string;
  created_at_end: string;
  last_updated_start: string;
  last_updated_end: string;
  ordering: string;
  page: number;
  page_size: number;
}

interface StockFiltersState {
  filters: StockFilters;
  setFilter: (key: keyof StockFilters, value: any) => void;
  setFilters: (partial: Partial<StockFilters>) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
  activeFilterCount: () => number;
  updateFilter: (key: keyof StockFilters, value: any) => void;
}

const DEFAULT_FILTERS: StockFilters = {
  product__sku__icontains: '',
  quantity_on_hand__gte: '',
  quantity_on_hand__lte: '',
  status: [],
  created_at_start: '',
  created_at_end: '',
  last_updated_start: '',
  last_updated_end: '',
  ordering: '',
  page: 1,
  page_size: 25,
};

const useStockFiltersStore = create<StockFiltersState>()(
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

        if (filters.product__sku__icontains) {
          params.product__sku__icontains = filters.product__sku__icontains;
        }
        if (filters.quantity_on_hand__gte) {
          params.quantity_on_hand__gte = filters.quantity_on_hand__gte;
        }
        if (filters.quantity_on_hand__lte) {
          params.quantity_on_hand__lte = filters.quantity_on_hand__lte;
        }
        if (filters.status.length > 0) {
          // Comma-separated for Django CSV filter
          params.status = filters.status.join(',');
        }
        if (filters.created_at_start && filters.created_at_end) {
          params.created_at__range = `${filters.created_at_start},${filters.created_at_end}`;
        } else if (filters.created_at_start) {
          params.created_at__gte = filters.created_at_start;
        } else if (filters.created_at_end) {
          params.created_at__lte = filters.created_at_end;
        }
        if (filters.last_updated_start && filters.last_updated_end) {
          params.last_updated__range = `${filters.last_updated_start},${filters.last_updated_end}`;
        } else if (filters.last_updated_start) {
          params.last_updated__gte = filters.last_updated_start;
        } else if (filters.last_updated_end) {
          params.last_updated__lte = filters.last_updated_end;
        }
        if (filters.ordering) {
          params.ordering = filters.ordering;
        }
        params.page = filters.page;
        params.page_size = filters.page_size;

        return params;
      },

      activeFilterCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.product__sku__icontains) count++;
        if (filters.quantity_on_hand__gte || filters.quantity_on_hand__lte) count++;
        if (filters.status.length > 0) count++;
        if (filters.created_at_start || filters.created_at_end) count++;
        if (filters.last_updated_start || filters.last_updated_end) count++;
        if (filters.ordering) count++;
        return count;
      },

      updateFilter: (key, value) => {
        get().setFilter(key, value);
      },
    })),
    { name: 'StockFiltersStore' }
  )
);

export const useStockFilters = () => useStockFiltersStore();
export default useStockFilters;
