import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { planningService } from '../services/planningServices';
import type { PlannedOrderListState } from '../types/store';
import type { PlannedOrder } from '../types/plannedOrderModel';

export const usePlannedOrderListStore = create<PlannedOrderListState>()(
  devtools(
    immer((set, get) => ({
      // ─── Initial State ────────────────────────
      orders: [] as PlannedOrder[],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      count: 0,
      selectedIds: new Set<string>(),

      // ─── Fetch Orders ─────────────────────────
      fetchOrders: async (params) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const result = await planningService.fetchPlannedOrders(params);
          set((state) => {
            state.orders = result.data;
            state.count = result.count;
            state.currentPage = result.currentPage;
            state.totalPages = result.totalPages;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Failed to fetch planned orders';
            state.isLoading = false;
          });
        }
      },

      // ─── Selection Management ─────────────────
      selectOrder: (id: string) => {
        set((state) => {
          state.selectedIds.add(id);
        });
      },

      deselectOrder: (id: string) => {
        set((state) => {
          state.selectedIds.delete(id);
        });
      },

      selectAll: (ids: string[]) => {
        set((state) => {
          state.selectedIds = new Set(ids);
        });
      },

      clearSelection: () => {
        set((state) => {
          state.selectedIds.clear();
        });
      },

      isSelected: (id: string): boolean => {
        const state = get();
        return state.selectedIds.has(id);
      },
    })),
    { name: 'planned-order-list-store' },
  ),
);

// Use this at component level to check selection
export const getPlannedOrderListState = usePlannedOrderListStore.getState;
