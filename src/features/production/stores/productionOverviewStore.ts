import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  DEFAULT_PRODUCTION_OVERVIEW_FILTERS,
  productionOverviewService,
} from '../services/productionOverviewService';
import type {
  ProductionOverviewFilters,
  ProductionOverviewScheduleAdherence,
  ProductionOverviewSummary,
  ProductionOverviewWip,
  ProductionOverviewYieldTrends,
} from '../types/productionOverviewModels';

const CACHE_TTL_MS = 60 * 1000;

interface ProductionOverviewCache {
  lastFetched: number | null;
  ttl: number;
  isFetching: boolean;
}

interface ProductionOverviewStoreState {
  summary: ProductionOverviewSummary | null;
  wip: ProductionOverviewWip | null;
  yieldTrends: ProductionOverviewYieldTrends | null;
  scheduleAdherence: ProductionOverviewScheduleAdherence | null;
  filters: ProductionOverviewFilters;
  isLoadingSummary: boolean;
  isLoadingWip: boolean;
  isLoadingYieldTrends: boolean;
  isLoadingScheduleAdherence: boolean;
  isRefreshing: boolean;
  error: string | null;
  summaryError: string | null;
  wipError: string | null;
  yieldTrendsError: string | null;
  scheduleAdherenceError: string | null;
  cache: {
    summary: ProductionOverviewCache;
    wip: ProductionOverviewCache;
    yieldTrends: ProductionOverviewCache;
    scheduleAdherence: ProductionOverviewCache;
  };
  refreshToken: number;
  fetchSummary: (force?: boolean) => Promise<void>;
  fetchWip: (force?: boolean) => Promise<void>;
  fetchYieldTrends: (force?: boolean) => Promise<void>;
  fetchScheduleAdherence: (force?: boolean) => Promise<void>;
  fetchOverview: (force?: boolean) => Promise<void>;
  setFilters: (partial: Partial<ProductionOverviewFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  invalidateCache: () => void;
  refresh: () => Promise<void>;
  setError: (error: string | null) => void;
}

const createCache = (): ProductionOverviewCache => ({
  lastFetched: null,
  ttl: CACHE_TTL_MS,
  isFetching: false,
});

const isCacheStale = (cache: ProductionOverviewCache): boolean => {
  if (!cache.lastFetched) return true;
  return Date.now() - cache.lastFetched > cache.ttl;
};

const filtersChanged = (
  a: ProductionOverviewFilters,
  b: ProductionOverviewFilters,
): boolean => JSON.stringify(a) !== JSON.stringify(b);

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const useProductionOverviewStore = create<ProductionOverviewStoreState>()(
  devtools(
    immer((set, get) => ({
      summary: null,
      wip: null,
      yieldTrends: null,
      scheduleAdherence: null,
      filters: { ...DEFAULT_PRODUCTION_OVERVIEW_FILTERS },
      isLoadingSummary: false,
      isLoadingWip: false,
      isLoadingYieldTrends: false,
      isLoadingScheduleAdherence: false,
      isRefreshing: false,
      error: null,
      summaryError: null,
      wipError: null,
      yieldTrendsError: null,
      scheduleAdherenceError: null,
      cache: {
        summary: createCache(),
        wip: createCache(),
        yieldTrends: createCache(),
        scheduleAdherence: createCache(),
      },
      refreshToken: 0,

      fetchSummary: async (force = false) => {
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
          const summary = await productionOverviewService.fetchSummary(state.filters);
          set((draft) => {
            draft.summary = summary;
            draft.cache.summary.lastFetched = Date.now();
            draft.cache.summary.isFetching = false;
            draft.isLoadingSummary = false;
            draft.isRefreshing = false;
            draft.summaryError = null;
          });
        } catch (error) {
          const message = getErrorMessage(error, 'Failed to fetch production summary');
          set((draft) => {
            draft.summaryError = message;
            draft.error = message;
            draft.cache.summary.isFetching = false;
            draft.isLoadingSummary = false;
            draft.isRefreshing = false;
          });
        }
      },

      fetchWip: async (force = false) => {
        const state = get();
        if (!force && state.wip && !isCacheStale(state.cache.wip)) return;
        if (state.cache.wip.isFetching) return;

        set((draft) => {
          draft.cache.wip.isFetching = true;
          draft.isLoadingWip = !force;
          draft.isRefreshing = force;
          draft.wipError = null;
          draft.error = null;
        });

        try {
          const wip = await productionOverviewService.fetchWip(state.filters);
          set((draft) => {
            draft.wip = wip;
            draft.cache.wip.lastFetched = Date.now();
            draft.cache.wip.isFetching = false;
            draft.isLoadingWip = false;
            draft.isRefreshing = false;
            draft.wipError = null;
          });
        } catch (error) {
          const message = getErrorMessage(error, 'Failed to fetch production WIP');
          set((draft) => {
            draft.wipError = message;
            draft.error = message;
            draft.cache.wip.isFetching = false;
            draft.isLoadingWip = false;
            draft.isRefreshing = false;
          });
        }
      },

      fetchYieldTrends: async (force = false) => {
        const state = get();
        if (!force && state.yieldTrends && !isCacheStale(state.cache.yieldTrends)) return;
        if (state.cache.yieldTrends.isFetching) return;

        set((draft) => {
          draft.cache.yieldTrends.isFetching = true;
          draft.isLoadingYieldTrends = !force;
          draft.isRefreshing = force;
          draft.yieldTrendsError = null;
          draft.error = null;
        });

        try {
          const yieldTrends = await productionOverviewService.fetchYieldTrends(state.filters);
          set((draft) => {
            draft.yieldTrends = yieldTrends;
            draft.cache.yieldTrends.lastFetched = Date.now();
            draft.cache.yieldTrends.isFetching = false;
            draft.isLoadingYieldTrends = false;
            draft.isRefreshing = false;
            draft.yieldTrendsError = null;
          });
        } catch (error) {
          const message = getErrorMessage(error, 'Failed to fetch production yield trends');
          set((draft) => {
            draft.yieldTrendsError = message;
            draft.error = message;
            draft.cache.yieldTrends.isFetching = false;
            draft.isLoadingYieldTrends = false;
            draft.isRefreshing = false;
          });
        }
      },

      fetchScheduleAdherence: async (force = false) => {
        const state = get();
        if (
          !force &&
          state.scheduleAdherence &&
          !isCacheStale(state.cache.scheduleAdherence)
        ) {
          return;
        }
        if (state.cache.scheduleAdherence.isFetching) return;

        set((draft) => {
          draft.cache.scheduleAdherence.isFetching = true;
          draft.isLoadingScheduleAdherence = !force;
          draft.isRefreshing = force;
          draft.scheduleAdherenceError = null;
          draft.error = null;
        });

        try {
          const scheduleAdherence =
            await productionOverviewService.fetchScheduleAdherence(state.filters);
          set((draft) => {
            draft.scheduleAdherence = scheduleAdherence;
            draft.cache.scheduleAdherence.lastFetched = Date.now();
            draft.cache.scheduleAdherence.isFetching = false;
            draft.isLoadingScheduleAdherence = false;
            draft.isRefreshing = false;
            draft.scheduleAdherenceError = null;
          });
        } catch (error) {
          const message = getErrorMessage(error, 'Failed to fetch schedule adherence');
          set((draft) => {
            draft.scheduleAdherenceError = message;
            draft.error = message;
            draft.cache.scheduleAdherence.isFetching = false;
            draft.isLoadingScheduleAdherence = false;
            draft.isRefreshing = false;
          });
        }
      },

      fetchOverview: async (force = false) => {
        await Promise.all([
          get().fetchSummary(force),
          get().fetchWip(force),
          get().fetchYieldTrends(force),
          get().fetchScheduleAdherence(force),
        ]);
      },

      setFilters: async (partial) => {
        const previous = get().filters;
        const next = { ...previous, ...partial };

        if (!filtersChanged(previous, next)) return;

        set((draft) => {
          draft.filters = next;
          draft.cache.summary.lastFetched = null;
          draft.cache.wip.lastFetched = null;
          draft.cache.yieldTrends.lastFetched = null;
          draft.cache.scheduleAdherence.lastFetched = null;
        });

        await get().fetchOverview(true);
      },

      clearFilters: async () => {
        set((draft) => {
          draft.filters = { ...DEFAULT_PRODUCTION_OVERVIEW_FILTERS };
          draft.cache.summary.lastFetched = null;
          draft.cache.wip.lastFetched = null;
          draft.cache.yieldTrends.lastFetched = null;
          draft.cache.scheduleAdherence.lastFetched = null;
        });

        await get().fetchOverview(true);
      },

      invalidateCache: () => {
        set((draft) => {
          draft.cache.summary.lastFetched = null;
          draft.cache.wip.lastFetched = null;
          draft.cache.yieldTrends.lastFetched = null;
          draft.cache.scheduleAdherence.lastFetched = null;
          draft.refreshToken = Date.now();
        });
      },

      refresh: async () => {
        await get().fetchOverview(true);
      },

      setError: (error) => {
        set((draft) => {
          draft.error = error;
        });
      },
    })),
    { name: 'production-overview-store' },
  ),
);

export default useProductionOverviewStore;
