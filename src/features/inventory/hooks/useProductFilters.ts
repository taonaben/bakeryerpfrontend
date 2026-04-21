import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type ProductStatusFilter = '' | 'active' | 'reorder' | 'no-reorder';

export interface ProductFilters {
  search: string;
  status: ProductStatusFilter;
  category: string;
  page: number;
  page_size: number;
}

interface ProductFiltersState {
  filters: ProductFilters;
  setFilter: (key: keyof ProductFilters, value: any) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
}

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  status: '',
  category: '',
  page: 1,
  page_size: 25,
};

const useProductFiltersStore = create<ProductFiltersState>()(
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

      clearAllFilters: () => {
        set((state) => {
          state.filters = { ...DEFAULT_FILTERS };
        });
      },

      getApiQueryParams: () => {
        const { filters } = get();
        const params: Record<string, any> = {
          page: filters.page,
          page_size: filters.page_size,
        };

        if (filters.search) {
          params.search = filters.search;
        }
        if (filters.category) {
          params.category__icontains = filters.category;
        }
        if (filters.status === 'active') {
          params.is_active = true;
        } else if (filters.status === 'reorder') {
          params.has_reorder_policy = true;
        } else if (filters.status === 'no-reorder') {
          params.has_reorder_policy = false;
        }

        return params;
      },
    })),
    { name: 'product-filters' },
  ),
);

export const useProductFilters = () => useProductFiltersStore();
export default useProductFilters;
