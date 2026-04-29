import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PricingRuleFilters } from '../types/pricing_rules_models';

interface State {
  filters: PricingRuleFilters;
  setFilter: (key: keyof PricingRuleFilters, value: any) => void;
  clearFilters: () => void;
  getApiParams: () => Record<string, any>;
}

const DEFAULTS: PricingRuleFilters = {
  product_id: '',
  search: '',
  ordering: '-last_updated',
  page: 1,
  page_size: 25,
};

const usePricingRuleFilters = create<State>()(
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
        if (f.search) p.search = f.search;
        if (f.ordering) p.ordering = f.ordering;
        return p;
      },
    })),
    { name: 'pricing-rule-filters' },
  ),
);

export default usePricingRuleFilters;
