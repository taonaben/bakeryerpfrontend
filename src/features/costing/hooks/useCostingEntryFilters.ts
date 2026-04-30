import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CostingEntryFilters } from '../types/costing_entries_models';

interface State {
  filters: CostingEntryFilters;
  setFilter: (key: keyof CostingEntryFilters, value: any) => void;
  clearFilters: () => void;
  getApiParams: () => Record<string, any>;
}

const DEFAULTS: CostingEntryFilters = {
  product_id: '',
  warehouse_id: '',
  batch_id: '',
  date_from: '',
  date_to: '',
  search: '',
  ordering: '-computed_at',
  page: 1,
  page_size: 25,
};

const useCostingEntryFilters = create<State>()(
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
        if (f.warehouse_id) p.warehouse_id = f.warehouse_id;
        if (f.batch_id) p.batch_id = f.batch_id;
        if (f.date_from) p.date_from = f.date_from;
        if (f.date_to) p.date_to = f.date_to;
        if (f.search) p.search = f.search;
        if (f.ordering) p.ordering = f.ordering;
        return p;
      },
    })),
    { name: 'costing-entry-filters' },
  ),
);

export default useCostingEntryFilters;
