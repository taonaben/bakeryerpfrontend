import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { productionService } from '../services/productionServices';
import type { BatchListState, BatchQueryParams } from '../types/productionModels';

export const useProductionBatchListStore = create<BatchListState>()(
  devtools(
    immer((set) => ({
      batches: [],
      isLoading: false,
      error: null,
      orderId: null,

      fetchBatches: async (orderId: string, params: BatchQueryParams = {}) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
          state.orderId = orderId;
        });

        try {
          const batches = await productionService.fetchBatches(orderId, params);
          set((state) => {
            state.batches = batches;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch production batches';
            state.isLoading = false;
          });
        }
      },

      fetchBatchesForWarehouse: async (warehouseId: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
          state.orderId = null;
        });

        try {
          // Fetch all production orders for this warehouse
          const orders = await productionService.fetchProductionOrders({ warehouse_id: warehouseId });

          // Fetch batches for each order in parallel
          const batchArrays = await Promise.all(
            orders.map((order) =>
              productionService.fetchBatches(order.id).catch(() => []),
            ),
          );

          const allBatches = batchArrays.flat();

          set((state) => {
            state.batches = allBatches;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch batches for warehouse';
            state.isLoading = false;
          });
        }
      },

      clearBatches: () => {
        set((state) => {
          state.batches = [];
          state.error = null;
          state.orderId = null;
        });
      },
    })),
    { name: 'production-batch-list-store' },
  ),
);

export default useProductionBatchListStore;
