import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  DEFAULT_INVENTORY_OVERVIEW_FILTERS,
  inventoryOverviewService,
} from '../services/inventoryOverviewService';
import type {
  InventoryOverviewFilters,
  InventoryOverviewMovementTrends,
  InventoryOverviewSummary,
} from '../types/inventoryOverview';

const CACHE_TTL_MS = 60 * 1000;

interface InventoryOverviewCache {
  lastFetched: number | null;
  ttl: number;
  isFetching: boolean;
}

interface InventoryOverviewStoreState {
  summary: InventoryOverviewSummary | null;
  movementTrends: InventoryOverviewMovementTrends | null;
  filters: InventoryOverviewFilters;
  isLoadingSummary: boolean;
  isLoadingMovementTrends: boolean;
  isRefreshing: boolean;
  error: string | null;
  summaryError: string | null;
  movementTrendsError: string | null;
  cache: {
    summary: InventoryOverviewCache;
    movementTrends: InventoryOverviewCache;
  };
  refreshToken: number;
  fetchSummary: (force?: boolean) => Promise<void>;
  fetchMovementTrends: (force?: boolean) => Promise<void>;
  fetchOverview: (force?: boolean) => Promise<void>;
  setFilters: (partial: Partial<InventoryOverviewFilters>) => Promise<void>;
  clearFilters: () => Promise<void>;
  invalidateCache: () => void;
  refresh: () => Promise<void>;
  setError: (error: string | null) => void;
}

const createCache = (): InventoryOverviewCache => ({
  lastFetched: null,
  ttl: CACHE_TTL_MS,
  isFetching: false,
});

const isCacheStale = (cache: InventoryOverviewCache): boolean => {
  if (!cache.lastFetched) return true;
  return Date.now() - cache.lastFetched > cache.ttl;
};

const filtersChanged = (
  a: InventoryOverviewFilters,
  b: InventoryOverviewFilters,
): boolean => JSON.stringify(a) !== JSON.stringify(b);

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const useInventoryOverviewStore = create<InventoryOverviewStoreState>()(
  devtools(
    immer((set, get) => ({
      summary: null,
      movementTrends: null,
      filters: { ...DEFAULT_INVENTORY_OVERVIEW_FILTERS },
      isLoadingSummary: false,
      isLoadingMovementTrends: false,
      isRefreshing: false,
      error: null,
      summaryError: null,
      movementTrendsError: null,
      cache: {
        summary: createCache(),
        movementTrends: createCache(),
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
          const summary = await inventoryOverviewService.fetchSummary(state.filters);
          set((draft) => {
            draft.summary = summary;
            draft.cache.summary.lastFetched = Date.now();
            draft.cache.summary.isFetching = false;
            draft.isLoadingSummary = false;
            draft.isRefreshing = false;
            draft.summaryError = null;
          });
        } catch (error) {
          const message = getErrorMessage(error, 'Failed to fetch inventory summary');
          set((draft) => {
            draft.summaryError = message;
            draft.error = message;
            draft.cache.summary.isFetching = false;
            draft.isLoadingSummary = false;
            draft.isRefreshing = false;
          });
        }
      },

      fetchMovementTrends: async (force: boolean = false) => {
        const state = get();
        if (
          !force &&
          state.movementTrends &&
          !isCacheStale(state.cache.movementTrends)
        ) {
          return;
        }
        if (state.cache.movementTrends.isFetching) return;

        set((draft) => {
          draft.cache.movementTrends.isFetching = true;
          draft.isLoadingMovementTrends = !force;
          draft.isRefreshing = force;
          draft.movementTrendsError = null;
          draft.error = null;
        });

        try {
          const movementTrends = await inventoryOverviewService.fetchMovementTrends(
            state.filters,
          );
          set((draft) => {
            draft.movementTrends = movementTrends;
            draft.cache.movementTrends.lastFetched = Date.now();
            draft.cache.movementTrends.isFetching = false;
            draft.isLoadingMovementTrends = false;
            draft.isRefreshing = false;
            draft.movementTrendsError = null;
          });
        } catch (error) {
          const message = getErrorMessage(
            error,
            'Failed to fetch inventory movement trends',
          );
          set((draft) => {
            draft.movementTrendsError = message;
            draft.error = message;
            draft.cache.movementTrends.isFetching = false;
            draft.isLoadingMovementTrends = false;
            draft.isRefreshing = false;
          });
        }
      },

      fetchOverview: async (force: boolean = false) => {
        await Promise.all([get().fetchSummary(force), get().fetchMovementTrends(force)]);
      },

      setFilters: async (partial: Partial<InventoryOverviewFilters>) => {
        const previous = get().filters;
        const next = {
          ...previous,
          ...partial,
        };

        if (!filtersChanged(previous, next)) return;

        set((draft) => {
          draft.filters = next;
          draft.cache.summary.lastFetched = null;
          draft.cache.movementTrends.lastFetched = null;
        });

        await get().fetchOverview(true);
      },

      clearFilters: async () => {
        set((draft) => {
          draft.filters = { ...DEFAULT_INVENTORY_OVERVIEW_FILTERS };
          draft.cache.summary.lastFetched = null;
          draft.cache.movementTrends.lastFetched = null;
        });

        await get().fetchOverview(true);
      },

      invalidateCache: () => {
        set((draft) => {
          draft.cache.summary.lastFetched = null;
          draft.cache.movementTrends.lastFetched = null;
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
    { name: 'inventory-overview-store' },
  ),
);

export default useInventoryOverviewStore;
