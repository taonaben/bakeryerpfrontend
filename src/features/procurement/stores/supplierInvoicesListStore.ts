import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  supplierInvoiceService,
  DEFAULT_SUPPLIER_INVOICE_FILTERS,
} from '../services/supplier_invoices_services';
import type { SupplierInvoiceListState } from '../types/store';
import type { SupplierInvoiceListFilters } from '../types/supplier_invoices_model';

const CACHE_TTL_MS = 60 * 1000;

const isCacheStale = (lastFetched: number | null, ttl: number): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > ttl;
};

const filtersChanged = (
  a: SupplierInvoiceListFilters,
  b: SupplierInvoiceListFilters,
): boolean => JSON.stringify(a) !== JSON.stringify(b);

export const useSupplierInvoicesListStore = create<SupplierInvoiceListState>()(
  devtools(
    immer((set, get) => ({
      invoices: [],
      count: 0,
      currentPage: 1,
      totalPages: 0,
      filters: { ...DEFAULT_SUPPLIER_INVOICE_FILTERS },
      isLoading: false,
      isRefreshing: false,
      error: null,
      cache: {
        lastFetched: null,
        ttl: CACHE_TTL_MS,
        isFetching: false,
      },
      refreshToken: 0,

      fetchInvoices: async (force: boolean = false) => {
        const state = get();
        if (
          !force &&
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.invoices.length > 0
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
          const result = await supplierInvoiceService.fetchInvoices(
            state.filters,
            state.filters.page,
          );
          set((draft) => {
            draft.invoices = result.data;
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
            draft.error = error.message || 'Failed to fetch supplier invoices';
            draft.cache.isFetching = false;
            draft.isLoading = false;
            draft.isRefreshing = false;
          });
        }
      },

      setFilters: async (partial: Partial<SupplierInvoiceListFilters>) => {
        const prevFilters = get().filters;
        const nextFilters = {
          ...prevFilters,
          ...partial,
        };

        if (
          partial.search !== undefined ||
          partial.status !== undefined ||
          partial.supplier_id !== undefined ||
          partial.purchase_order_id !== undefined ||
          partial.warehouse_id !== undefined ||
          partial.invoice_date_after !== undefined ||
          partial.invoice_date_before !== undefined ||
          partial.due_date_after !== undefined ||
          partial.due_date_before !== undefined ||
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

        await get().fetchInvoices();
      },

      clearFilters: async () => {
        set((draft) => {
          draft.filters = { ...DEFAULT_SUPPLIER_INVOICE_FILTERS };
          draft.cache.lastFetched = null;
        });
        await get().fetchInvoices();
      },

      setPage: async (page: number) => {
        if (page < 1) return;
        set((draft) => {
          draft.filters.page = page;
          draft.cache.lastFetched = null;
        });
        await get().fetchInvoices();
      },

      refresh: async () => {
        await get().fetchInvoices(true);
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
    { name: 'supplier-invoices-list-store' },
  ),
);

export default useSupplierInvoicesListStore;
