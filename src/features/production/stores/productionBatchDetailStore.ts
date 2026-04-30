import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { productionService } from '../services/productionServices';
import type { BatchDetailState } from '../types/productionModels';

export const useProductionBatchDetailStore = create<BatchDetailState>()(
  devtools(
    immer((set) => ({
      batch: null,
      isLoading: false,
      error: null,

      fetchBatch: async (orderId: string, batchId: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const batch = await productionService.fetchBatch(orderId, batchId);
          set((state) => {
            state.batch = batch;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch production batch';
            state.isLoading = false;
          });
        }
      },

      clearBatch: () => {
        set((state) => {
          state.batch = null;
          state.error = null;
        });
      },
    })),
    { name: 'production-batch-detail-store' },
  ),
);

export default useProductionBatchDetailStore;
