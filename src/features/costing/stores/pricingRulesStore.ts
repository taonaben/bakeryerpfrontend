import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { pricingRulesService } from '../services/pricingRulesService';
import type {
  PricingRule,
  CreatePricingRuleDTO,
  UpdatePricingRuleDTO,
  PricingRuleFilters,
} from '../types/pricing_rules_models';

const CACHE_TTL_MS = 5 * 60 * 1000;
const isStale = (ts: number | null) => !ts || Date.now() - ts > CACHE_TTL_MS;

interface PricingRulesState {
  items: PricingRule[];
  itemMap: Record<string, PricingRule>;
  count: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastFetched: number | null;
  isFetching: boolean;
  fetchAll: (filters?: PricingRuleFilters, force?: boolean) => Promise<void>;
  fetchById: (id: string, force?: boolean) => Promise<void>;
  create: (dto: CreatePricingRuleDTO) => Promise<PricingRule>;
  patch: (id: string, dto: UpdatePricingRuleDTO) => Promise<PricingRule>;
  recalculate: (id: string) => Promise<PricingRule>;
  clearError: () => void;
}

export const usePricingRulesStore = create<PricingRulesState>()(
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
          const result = await pricingRulesService.fetchAll(filters);
          set((d) => {
            d.items = result.data;
            d.count = result.count;
            d.totalPages = result.totalPages;
            d.currentPage = result.currentPage;
            d.itemMap = result.data.reduce<Record<string, PricingRule>>((acc, r) => {
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
          const item = await pricingRulesService.fetchById(id);
          set((d) => { d.itemMap[id] = item; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      create: async (dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const created = await pricingRulesService.create(dto);
          set((d) => {
            d.items = [created, ...d.items];
            d.itemMap[created.id] = created;
            d.isSubmitting = false;
            d.lastFetched = null;
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
          const updated = await pricingRulesService.patch(id, dto);
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

      recalculate: async (id) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await pricingRulesService.recalculate(id);
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
    { name: 'pricing-rules-store' },
  ),
);
