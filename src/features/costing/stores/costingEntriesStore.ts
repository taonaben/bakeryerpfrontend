import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { costingEntriesService } from '../services/costingEntriesService';
import type {
  CostingEntry,
  CostingEntryDetail,
  ComputeCostingEntryDTO,
  CostingEntryFilters,
} from '../types/costing_entries_models';

const CACHE_TTL_MS = 5 * 60 * 1000;
const isStale = (ts: number | null) => !ts || Date.now() - ts > CACHE_TTL_MS;

interface CostingEntriesState {
  items: CostingEntry[];
  detailMap: Record<string, CostingEntryDetail>;
  count: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isComputing: boolean;
  error: string | null;
  lastFetched: number | null;
  isFetching: boolean;
  fetchAll: (filters?: CostingEntryFilters, force?: boolean) => Promise<void>;
  fetchById: (id: string, force?: boolean) => Promise<void>;
  compute: (dto: ComputeCostingEntryDTO) => Promise<CostingEntryDetail>;
  clearError: () => void;
}

export const useCostingEntriesStore = create<CostingEntriesState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      detailMap: {},
      count: 0,
      totalPages: 1,
      currentPage: 1,
      isLoading: false,
      isComputing: false,
      error: null,
      lastFetched: null,
      isFetching: false,

      fetchAll: async (filters, force = false) => {
        const state = get();
        if (!force && !isStale(state.lastFetched) && state.items.length > 0) return;
        if (state.isFetching) return;
        set((d) => { d.isFetching = true; d.isLoading = true; d.error = null; });
        try {
          const result = await costingEntriesService.fetchAll(filters);
          set((d) => {
            d.items = result.data;
            d.count = result.count;
            d.totalPages = result.totalPages;
            d.currentPage = result.currentPage;
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
        if (!force && state.detailMap[id]) return;
        set((d) => { d.isLoading = true; d.error = null; });
        try {
          const detail = await costingEntriesService.fetchById(id);
          set((d) => { d.detailMap[id] = detail; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      compute: async (dto) => {
        set((d) => { d.isComputing = true; d.error = null; });
        try {
          const result = await costingEntriesService.compute(dto);
          set((d) => {
            d.detailMap[result.id] = result;
            d.items = [result, ...d.items.filter((i) => i.id !== result.id)];
            d.isComputing = false;
            d.lastFetched = null;
          });
          return result;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isComputing = false; });
          throw e;
        }
      },

      clearError: () => set((d) => { d.error = null; }),
    })),
    { name: 'costing-entries-store' },
  ),
);
