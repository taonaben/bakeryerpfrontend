import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StandardCostFilters } from '../types/standard_costs_models';

interface State {
  filters: StandardCostFilters;
  setFilter: (key: keyof StandardCostFilters, value: any) => void;
  clearFilters: () => void;
  getApiParams: () => Record<string, any>;
}

const DEFAULTS: StandardCostFilters = {
  product_id: '',
  formula_id: '',
  date_from: '',
  date_to: '',
  search: '',
  ordering: '-computed_at',
  page: 1,
  page_size: 25,
};

const useStandardCostFilters = create<State>()(
  devtools(
    immer((set, get) => ({
      filters: { ...DEFAULTS },

      setFilter: (key, value) =>
        set((s) => {
          (s.filters as any)[key] = value;
          if (key !== 'page') s.filters.page = 1;
        }),

      clearFilters: () => set((s) => { s.filters = { ...DEFAULTS }; }),

      getApiParams: () => {
        const { filters: f } = get();
        const p: Record<string, any> = { page: f.page, page_size: f.page_size };
        if (f.product_id) p.product_id = f.product_id;
        if (f.formula_id) p.formula_id = f.formula_id;
        if (f.date_from) p.date_from = f.date_from;
        if (f.date_to) p.date_to = f.date_to;
        if (f.search) p.search = f.search;
        if (f.ordering) p.ordering = f.ordering;
        return p;
      },
    })),
    { name: 'standard-cost-filters' },
  ),
);

export default useStandardCostFilters;
