import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { GoodsReceiptListFilters } from '../types/grn_models';

// ──────────────────────────────────────────────
// Store interface
// ──────────────────────────────────────────────

interface GoodsReceiptFiltersState {
  filters: GoodsReceiptListFilters;
  setFilter: (key: keyof GoodsReceiptListFilters, value: any) => void;
  setFilters: (partial: Partial<GoodsReceiptListFilters>) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
  activeFilterCount: () => number;
}

// ──────────────────────────────────────────────
// Defaults
// ──────────────────────────────────────────────

const DEFAULT_FILTERS: GoodsReceiptListFilters = {
  search: '',
  status: '',
  purchase_order_id: '',
  warehouse_id: '',
  received_date_after: '',
  received_date_before: '',
  ordering: '-created_at',
  page: 1,
  page_size: 25,
};

// ──────────────────────────────────────────────
// Zustand store
// ──────────────────────────────────────────────

const useGoodsReceiptFilters = create<GoodsReceiptFiltersState>()(
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
          const changedNonPageFilter = Object.keys(partial).some((key) => key !== 'page');
          if (changedNonPageFilter) {
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
        const params: Record<string, any> = {};

        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.purchase_order_id) params.purchase_order_id = filters.purchase_order_id;
        if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;

        if (filters.received_date_after && filters.received_date_before) {
          params.received_date__range = `${filters.received_date_after},${filters.received_date_before}`;
        } else if (filters.received_date_after) {
          params.received_date__gte = filters.received_date_after;
        } else if (filters.received_date_before) {
          params.received_date__lte = filters.received_date_before;
        }

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
        if (filters.purchase_order_id) count++;
        if (filters.warehouse_id) count++;
        if (filters.received_date_after || filters.received_date_before) count++;
        if (filters.ordering && filters.ordering !== '-created_at') count++;
        return count;
      },
    })),
    { name: 'goods-receipt-filters' },
  ),
);

export default useGoodsReceiptFilters;
