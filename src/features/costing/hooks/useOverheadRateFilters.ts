import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { OverheadRateFilters } from '../types/overhead_rates_models';

interface State {
  filters: OverheadRateFilters;
  setFilter: (key: keyof OverheadRateFilters, value: any) => void;
  clearFilters: () => void;
  getApiParams: () => Record<string, any>;
}

const DEFAULTS: OverheadRateFilters = {
  warehouse_id: '',
  period_start: '',
  period_end: '',
  search: '',
  ordering: '-created_at',
  page: 1,
  page_size: 25,
};

const useOverheadRateFilters = create<State>()(
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
        if (f.warehouse_id) p.warehouse_id = f.warehouse_id;
        if (f.period_start) p.period_start = f.period_start;
        if (f.period_end) p.period_end = f.period_end;
        if (f.search) p.search = f.search;
        if (f.ordering) p.ordering = f.ordering;
        return p;
      },
    })),
    { name: 'overhead-rate-filters' },
  ),
);

export default useOverheadRateFilters;
