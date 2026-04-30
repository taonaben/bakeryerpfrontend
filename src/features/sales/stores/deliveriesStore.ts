import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { deliveriesService } from '../services/deliveriesService';
import type {
  Delivery,
  DeliveryDetail,
  ConfirmDeliveryDTO,
  FailDeliveryDTO,
  DeliveryFilters,
} from '../types/deliveries_models';

const CACHE_TTL_MS = 5 * 60 * 1000;
const isStale = (ts: number | null) => !ts || Date.now() - ts > CACHE_TTL_MS;

interface DeliveriesState {
  items: Delivery[];
  detailMap: Record<string, DeliveryDetail>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastFetched: number | null;
  isFetching: boolean;

  fetchAll: (filters?: DeliveryFilters, force?: boolean) => Promise<void>;
  fetchById: (id: string, force?: boolean) => Promise<void>;
  confirmReceipt: (id: string, dto?: ConfirmDeliveryDTO) => Promise<DeliveryDetail>;
  fail: (id: string, dto: FailDeliveryDTO) => Promise<DeliveryDetail>;
  clearError: () => void;
}

export const useDeliveriesStore = create<DeliveriesState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      detailMap: {},
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
          const items = await deliveriesService.fetchAll(filters);
          set((d) => {
            d.items = items;
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
          const detail = await deliveriesService.fetchById(id);
          set((d) => { d.detailMap[id] = detail; d.isLoading = false; });
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isLoading = false; });
        }
      },

      confirmReceipt: async (id, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await deliveriesService.confirmReceipt(id, dto);
          set((d) => {
            d.detailMap[id] = updated;
            d.items = d.items.map((i) => (i.id === id ? updated : i));
            d.isSubmitting = false;
          });
          return updated;
        } catch (e: any) {
          set((d) => { d.error = e.message; d.isSubmitting = false; });
          throw e;
        }
      },

      fail: async (id, dto) => {
        set((d) => { d.isSubmitting = true; d.error = null; });
        try {
          const updated = await deliveriesService.fail(id, dto);
          set((d) => {
            d.detailMap[id] = updated;
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
    { name: 'deliveries-store' },
  ),
);
