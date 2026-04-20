import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { grnService, DEFAULT_GRN_FILTERS } from '../services/grn_services';
import type { GoodsReceiptListState } from '../types/store';
import type { GoodsReceiptListFilters } from '../types/grn_models';

const CACHE_TTL_MS = 60 * 1000; // 1 minute

const isCacheStale = (lastFetched: number | null, ttl: number): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > ttl;
};

const filtersChanged = (a: GoodsReceiptListFilters, b: GoodsReceiptListFilters): boolean =>
  JSON.stringify(a) !== JSON.stringify(b);

export const useGoodsReceiptListStore = create<GoodsReceiptListState>()(
  devtools(
    immer((set, get) => ({
      receipts: [],
      count: 0,
      currentPage: 1,
      totalPages: 0,
      filters: { ...DEFAULT_GRN_FILTERS },
      isLoading: false,
      isRefreshing: false,
      error: null,
      cache: {
        lastFetched: null,
        ttl: CACHE_TTL_MS,
        isFetching: false,
      },
      refreshToken: 0,

      fetchReceipts: async (force: boolean = false) => {
        const state = get();
        if (
          !force &&
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.receipts.length > 0
        ) {
          return;
        }
        if (state.cache.isFetching) return;

        set((draft) => {
          draft.cache.isFetching = true;
          draft.error = null;
          draft.isLoading = !force;
          draft.isRefreshing = force;
        });

        try {
          const result = await grnService.fetchReceipts(state.filters, state.filters.page);
          set((draft) => {
            draft.receipts = result.data;
            draft.count = result.count;
            draft.currentPage = result.currentPage;
            draft.totalPages = result.totalPages;
            draft.cache.lastFetched = Date.now();
            draft.cache.isFetching = false;
            draft.isLoading = false;
            draft.isRefreshing = false;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch goods receipts';
            draft.cache.isFetching = false;
            draft.isLoading = false;
            draft.isRefreshing = false;
          });
        }
      },

      setFilters: async (partial: Partial<GoodsReceiptListFilters>) => {
        const prevFilters = get().filters;
        const nextFilters = {
          ...prevFilters,
          ...partial,
        };

        // Reset pagination when non-page filters change
        if (
          partial.search !== undefined ||
          partial.status !== undefined ||
          partial.purchase_order_id !== undefined ||
          partial.warehouse_id !== undefined ||
          partial.received_date_after !== undefined ||
          partial.received_date_before !== undefined ||
          partial.ordering !== undefined ||
          partial.page_size !== undefined
        ) {
          nextFilters.page = 1;
        }

        if (!filtersChanged(prevFilters, nextFilters)) return;

        set((draft) => {
          draft.filters = nextFilters;
          draft.cache.lastFetched = null;
        });

        await get().fetchReceipts();
      },

      clearFilters: async () => {
        set((draft) => {
          draft.filters = { ...DEFAULT_GRN_FILTERS };
          draft.cache.lastFetched = null;
        });
        await get().fetchReceipts();
      },

      setPage: async (page: number) => {
        if (page < 1) return;
        set((draft) => {
          draft.filters.page = page;
          draft.cache.lastFetched = null;
        });
        await get().fetchReceipts();
      },

      refresh: async () => {
        await get().fetchReceipts(true);
      },

      invalidateCache: () => {
        set((draft) => {
          draft.cache.lastFetched = null;
          draft.refreshToken = Date.now();
        });
      },

      notifyMutation: () => {
        set((draft) => {
          draft.cache.lastFetched = null;
          draft.refreshToken = Date.now();
        });
      },

      setError: (error: string | null) => {
        set((draft) => {
          draft.error = error;
        });
      },
    })),
    { name: 'goods-receipt-list-store' },
  ),
);

export default useGoodsReceiptListStore;
