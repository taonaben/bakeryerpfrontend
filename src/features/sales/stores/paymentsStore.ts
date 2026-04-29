import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { paymentsService } from '../services/paymentsService';
import type { Payment, PaymentFilters } from '../types/payments_models';

const CACHE_TTL_MS = 5 * 60 * 1000;
const isStale = (ts: number | null) => !ts || Date.now() - ts > CACHE_TTL_MS;

interface PaymentsState {
  items: Payment[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  isFetching: boolean;

  fetchAll: (filters?: PaymentFilters, force?: boolean) => Promise<void>;
  clearError: () => void;
}

export const usePaymentsStore = create<PaymentsState>()(
  devtools(
    immer((set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      isFetching: false,

      fetchAll: async (filters, force = false) => {
        const state = get();
        if (!force && !isStale(state.lastFetched) && state.items.length > 0) return;
        if (state.isFetching) return;
        set((d) => { d.isFetching = true; d.isLoading = true; d.error = null; });
        try {
          const items = await paymentsService.fetchAll(filters);
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

      clearError: () => set((d) => { d.error = null; }),
    })),
    { name: 'payments-store' },
  ),
);
