import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  DEFAULT_PROCUREMENT_OVERVIEW_FILTERS,
  procurementOverviewService,
} from '../services/procurement_overview_services';
import type {
  ProcurementOverviewFilters,
  ProcurementOverviewSummary,
  ProcurementOverviewTrends,
  ProcurementSupplierPerformance,
} from '../types/procurement_overview_models';

const CACHE_TTL_MS = 60 * 1000;

interface ProcurementOverviewCache {
  lastFetched: number | null;
  ttl: number;
  isFetching: boolean;
}

interface ProcurementOverviewStoreState {
  summary: ProcurementOverviewSummary | null;
  trends: ProcurementOverviewTrends | null;
  supplierPerformance: ProcurementSupplierPerformance | null;
  filters: ProcurementOverviewFilters;
  isLoadingSummary: boolean;
  isLoadingTrends: boolean;
  isLoadingSupplierPerformance: boolean;
  isRefreshing: boolean;
  error: string | null;
  summaryError: string | null;
  trendsError: string | null;
  supplierPerformanceError: string | null;
  cache: {
    summary: ProcurementOverviewCache;
    trends: ProcurementOverviewCache;
    supplierPerformance: ProcurementOverviewCache;
  };
  refreshToken: number;
  fetchSummary: (force?: boolean) => Promise<void>;
  fetchTrends: (force?: boolean) => Promise<void>;
  fetchSupplierPerformance: (force?: boolean) => Promise<void>;
  fetchOverview: (force?: boolean) => Promise<void>;
  setFilters: (partial: Partial<ProcurementOverviewFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  invalidateCache: () => void;
  refresh: () => Promise<void>;
  setError: (error: string | null) => void;
}

const createCache = (): ProcurementOverviewCache => ({
  lastFetched: null,
  ttl: CACHE_TTL_MS,
  isFetching: false,
});

const isCacheStale = (cache: ProcurementOverviewCache): boolean => {
  if (!cache.lastFetched) return true;
  return Date.now() - cache.lastFetched > cache.ttl;
};

const filtersChanged = (
  a: ProcurementOverviewFilters,
  b: ProcurementOverviewFilters,
): boolean => JSON.stringify(a) !== JSON.stringify(b);

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const useProcurementOverviewStore = create<ProcurementOverviewStoreState>()(
  devtools(
    immer((set, get) => ({
      summary: null,
      trends: null,
      supplierPerformance: null,
      filters: { ...DEFAULT_PROCUREMENT_OVERVIEW_FILTERS },
      isLoadingSummary: false,
      isLoadingTrends: false,
      isLoadingSupplierPerformance: false,
      isRefreshing: false,
      error: null,
      summaryError: null,
      trendsError: null,
      supplierPerformanceError: null,
      cache: {
        summary: createCache(),
        trends: createCache(),
        supplierPerformance: createCache(),
      },
      refreshToken: 0,

      fetchSummary: async (force: boolean = false) => {
        const state = get();
        if (!force && state.summary && !isCacheStale(state.cache.summary)) return;
        if (state.cache.summary.isFetching) return;

        set((draft) => {
          draft.cache.summary.isFetching = true;
          draft.isLoadingSummary = !force;
          draft.isRefreshing = force;
          draft.summaryError = null;
          draft.error = null;
        });

        try {
          const summary = await procurementOverviewService.fetchSummary(state.filters);
          set((draft) => {
            draft.summary = summary;
            draft.cache.summary.lastFetched = Date.now();
            draft.cache.summary.isFetching = false;
            draft.isLoadingSummary = false;
            draft.isRefreshing = false;
            draft.summaryError = null;
          });
        } catch (error) {
          const message = getErrorMessage(error, 'Failed to fetch procurement summary');
          set((draft) => {
            draft.summaryError = message;
            draft.error = message;
            draft.cache.summary.isFetching = false;
            draft.isLoadingSummary = false;
            draft.isRefreshing = false;
          });
        }
      },

      fetchTrends: async (force: boolean = false) => {
        const state = get();
        if (!force && state.trends && !isCacheStale(state.cache.trends)) return;
        if (state.cache.trends.isFetching) return;

        set((draft) => {
          draft.cache.trends.isFetching = true;
          draft.isLoadingTrends = !force;
          draft.isRefreshing = force;
          draft.trendsError = null;
          draft.error = null;
        });

        try {
          const trends = await procurementOverviewService.fetchTrends(state.filters);
          set((draft) => {
            draft.trends = trends;
            draft.cache.trends.lastFetched = Date.now();
            draft.cache.trends.isFetching = false;
            draft.isLoadingTrends = false;
            draft.isRefreshing = false;
            draft.trendsError = null;
          });
        } catch (error) {
          const message = getErrorMessage(error, 'Failed to fetch procurement trends');
          set((draft) => {
            draft.trendsError = message;
            draft.error = message;
            draft.cache.trends.isFetching = false;
            draft.isLoadingTrends = false;
            draft.isRefreshing = false;
          });
        }
      },

      fetchSupplierPerformance: async (force: boolean = false) => {
        const state = get();
        if (
          !force &&
          state.supplierPerformance &&
          !isCacheStale(state.cache.supplierPerformance)
        ) {
          return;
        }
        if (state.cache.supplierPerformance.isFetching) return;

        set((draft) => {
          draft.cache.supplierPerformance.isFetching = true;
          draft.isLoadingSupplierPerformance = !force;
          draft.isRefreshing = force;
          draft.supplierPerformanceError = null;
          draft.error = null;
        });

        try {
          const supplierPerformance =
            await procurementOverviewService.fetchSupplierPerformance(state.filters);
          set((draft) => {
            draft.supplierPerformance = supplierPerformance;
            draft.cache.supplierPerformance.lastFetched = Date.now();
            draft.cache.supplierPerformance.isFetching = false;
            draft.isLoadingSupplierPerformance = false;
            draft.isRefreshing = false;
            draft.supplierPerformanceError = null;
          });
        } catch (error) {
          const message = getErrorMessage(error, 'Failed to fetch supplier performance');
          set((draft) => {
            draft.supplierPerformanceError = message;
            draft.error = message;
            draft.cache.supplierPerformance.isFetching = false;
            draft.isLoadingSupplierPerformance = false;
            draft.isRefreshing = false;
          });
        }
      },

      fetchOverview: async (force: boolean = false) => {
        await Promise.all([
          get().fetchSummary(force),
          get().fetchTrends(force),
          get().fetchSupplierPerformance(force),
        ]);
      },

      setFilters: async (partial: Partial<ProcurementOverviewFilters>) => {
        const previous = get().filters;
        const next = {
          ...previous,
          ...partial,
        };

        if (!filtersChanged(previous, next)) return;

        set((draft) => {
          draft.filters = next;
          draft.cache.summary.lastFetched = null;
          draft.cache.trends.lastFetched = null;
          draft.cache.supplierPerformance.lastFetched = null;
        });

        await get().fetchOverview(true);
      },

      clearFilters: async () => {
        set((draft) => {
          draft.filters = { ...DEFAULT_PROCUREMENT_OVERVIEW_FILTERS };
          draft.cache.summary.lastFetched = null;
          draft.cache.trends.lastFetched = null;
          draft.cache.supplierPerformance.lastFetched = null;
        });

        await get().fetchOverview(true);
      },

      invalidateCache: () => {
        set((draft) => {
          draft.cache.summary.lastFetched = null;
          draft.cache.trends.lastFetched = null;
          draft.cache.supplierPerformance.lastFetched = null;
          draft.refreshToken = Date.now();
        });
      },

      refresh: async () => {
        await get().fetchOverview(true);
      },

      setError: (error: string | null) => {
        set((draft) => {
          draft.error = error;
        });
      },
    })),
    { name: 'procurement-overview-store' },
  ),
);

export default useProcurementOverviewStore;
