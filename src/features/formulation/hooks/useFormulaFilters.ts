import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { FormulaStatus } from '../types/models';

export interface FormulaFilters {
  search: string;
  status: FormulaStatus | '';
  product: string;
  ordering: string;
  page: number;
  page_size: number;
}

interface FormulaFiltersState {
  filters: FormulaFilters;
  setFilter: (key: keyof FormulaFilters, value: any) => void;
  setFilters: (partial: Partial<FormulaFilters>) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
  activeFilterCount: () => number;
}

const DEFAULT_FILTERS: FormulaFilters = {
  search: '',
  status: '',
  product: '',
  ordering: '-created_at',
  page: 1,
  page_size: 25,
};

const useFormulaFilters = create<FormulaFiltersState>()(
  devtools(
    immer((set, get) => ({
      filters: { ...DEFAULT_FILTERS },

      setFilter: (key, value) => {
        set((state) => {
          (state.filters as any)[key] = value;
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
        if (filters.status) params.status = filters.status;
        if (filters.product) params.product = filters.product;
        if (filters.ordering) params.ordering = filters.ordering;

        params.page = filters.page;
        params.page_size = filters.page_size;

        return params;
      },

      activeFilterCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.product) count++;
        if (filters.ordering && filters.ordering !== '-created_at') count++;
        return count;
      },
    })),
    { name: 'formula-filters' },
  ),
);

export default useFormulaFilters;
