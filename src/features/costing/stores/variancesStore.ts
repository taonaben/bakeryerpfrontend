import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { variancesService } from '../services/variancesService';
import type {
  Variance,
  VarianceSummaryItem,
  VarianceFilters,
  VarianceSummaryFilters,
} from '../types/variances_models';

const CACHE_TTL_MS = 5 * 60 * 1000;
const isStale = (ts: number | null) => !ts || Date.now() - ts > CACHE_TTL_MS;

interface VariancesState {
  items: Variance[];
  itemMap: Record<string, Variance>;
  summary: VarianceSummaryItem[];
  count: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isSummaryLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  isFetching: boolean;
  fetchAll: (filters?: VarianceFilters, force?: boolean) => Promise<void>;
  fetchById: (id: string, force?: boolean) => Promise<void>;
  fetchSummary: (filters?: VarianceSummaryFilters) => Promise<void>;
  clearError: () => void;
}

export const useVariancesStore = create<VariancesState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      itemMap: {},
      summary: [],
      count: 0,
      totalPages: 1,
      currentPage: 1,
      isLoading: false,
      isSummaryLoading: false,
      error: null,
      lastFetched: null,
      isFetching: false,

      fetchAll: async (filters, force = false) => {
        const state = get();
        if (!force && !isStale(state.lastFetched) && state.items.length > 0) return;
        if (state.isFetching) return;
        set((d) => { d.isFetching = true; d.isLoading = true; d.error = null; });
        try {
          const result = await variancesService.fetchAll(filters);
          set((d) => {
            d.items = result.data;
            d.count = result.count;
            d.totalPages = result.totalPages;
            d.currentPage = result.currentPage;
            d.itemMap = result.data.reduce<Record<string, Variance>>((acc, v) => {
              acc[v.id] = v; return acc;
            }, {});
            d.lastFetched = Date.now();
            d.isFetching = false;
            d.isLoading = false;
          });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isFetching = false; d.isLoading = false; });
        }
      },

      fetchById: async (id, force = false) => {
        const state = get();
        if (!force && state.itemMap[id]) return;
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const item = await variancesService.fetchById(id);
          set((d) => { d.itemMap[id] = item; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      fetchSummary: async (filters) => {
        set((d) => { d.isSummaryLoading = true; d.error = null; });
        try {
          const summary = await variancesService.fetchSummary(filters);
          set((d) => { d.summary = summary; d.isSummaryLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSummaryLoading = false; });
        }
      },

      clearError: () => set((d) => { d.error = null; }),
    })),
    { name: 'variances-store' },
  ),
);
