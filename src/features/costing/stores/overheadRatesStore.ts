import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { overheadRatesService } from '../services/overheadRatesService';
import type {
  OverheadRate,
  CreateOverheadRateDTO,
  UpdateOverheadRateDTO,
  OverheadRateFilters,
} from '../types/overhead_rates_models';

const CACHE_TTL_MS = 5 * 60 * 1000;
const isStale = (ts: number | null) => !ts || Date.now() - ts > CACHE_TTL_MS;

interface OverheadRatesState {
  // Data
  items: OverheadRate[];
  itemMap: Record<string, OverheadRate>;
  count: number;
  totalPages: number;
  currentPage: number;
  // Loading
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  // Cache
  lastFetched: number | null;
  isFetching: boolean;
  // Actions
  fetchAll: (filters?: OverheadRateFilters, force?: boolean) => Promise<void>;
  fetchById: (id: string, force?: boolean) => Promise<void>;
  create: (dto: CreateOverheadRateDTO) => Promise<OverheadRate>;
  patch: (id: string, dto: UpdateOverheadRateDTO) => Promise<OverheadRate>;
  clearError: () => void;
}

export const useOverheadRatesStore = create<OverheadRatesState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      itemMap: {},
      count: 0,
      totalPages: 1,
      currentPage: 1,
      isLoading: false,
      isSubmitting: false,
      error: null,
      lastFetched: null,
      isFetching: false,

      fetchAll: async (filters, force = false) => {
        const state = get();
        if (!force && !isStale(state.lastFetched) && state.items.length > 0) return;
        if (state.isFetching) return;
        set((d) => { d.isFetching = true; d.isLoading = true; d.error = null; });
        try {
          const result = await overheadRatesService.fetchAll(filters);
          set((d) => {
            d.items = result.data;
            d.count = result.count;
            d.totalPages = result.totalPages;
            d.currentPage = result.currentPage;
            d.itemMap = result.data.reduce<Record<string, OverheadRate>>((acc, r) => {
              acc[r.id] = r; return acc;
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
          const item = await overheadRatesService.fetchById(id);
          set((d) => { d.itemMap[id] = item; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      create: async (dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const created = await overheadRatesService.create(dto);
          set((d) => {
            d.items = [created, ...d.items];
            d.itemMap[created.id] = created;
            d.isSubmitting = false;
            d.lastFetched = null; // invalidate
          });
          return created;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      patch: async (id, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await overheadRatesService.patch(id, dto);
          set((d) => {
            d.itemMap[id] = updated;
            d.items = d.items.map((i) => (i.id === id ? updated : i));
            d.isSubmitting = false;
          });
          return updated;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      clearError: () => set((d) => { d.error = null; }),
    })),
    { name: 'overhead-rates-store' },
  ),
);
