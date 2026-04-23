import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { productionService } from '../services/productionServices';
import type {
  FinishReworkPayload,
  ReworkOrderDetailState,
  StartReworkPayload,
  UpdateReworkOrderPayload,
} from '../types/productionModels';
import { ProductionApiServiceError } from '../utils/errorHandling';

const getErrorDetails = (error: unknown) =>
  error instanceof ProductionApiServiceError ? error.details : null;

export const useReworkOrderDetailStore = create<ReworkOrderDetailState>()(
  devtools(
    immer((set) => ({
      order: null,
      lastStartResult: null,
      lastFinishResult: null,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      isStarting: false,
      isFinishing: false,
      error: null,
      errorDetails: null,

      fetchOrder: async (id) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const order = await productionService.fetchReworkOrder(id);
          set((state) => {
            state.order = order;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch rework order';
            state.errorDetails = getErrorDetails(error);
            state.isLoading = false;
          });
        }
      },

      createOrder: async (payload) => {
        set((state) => {
          state.isSaving = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const order = await productionService.createReworkOrder(payload);
          set((state) => {
            state.order = order;
            state.lastStartResult = null;
            state.lastFinishResult = null;
            state.isSaving = false;
          });
          return order;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to create rework order';
            state.errorDetails = getErrorDetails(error);
            state.isSaving = false;
          });
          throw error;
        }
      },

      updateOrder: async (
        id: string,
        payload: UpdateReworkOrderPayload,
        method: 'put' | 'patch' = 'patch',
      ) => {
        set((state) => {
          state.isSaving = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const order =
            method === 'put'
              ? await productionService.replaceReworkOrder(id, payload)
              : await productionService.updateReworkOrder(id, payload);
          set((state) => {
            state.order = {
              ...state.order,
              ...order,
              inputs: state.order?.inputs ?? order.inputs,
              outputs: state.order?.outputs ?? order.outputs,
            };
            state.isSaving = false;
          });
          return order;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to update rework order';
            state.errorDetails = getErrorDetails(error);
            state.isSaving = false;
          });
          throw error;
        }
      },

      deleteOrder: async (id) => {
        set((state) => {
          state.isDeleting = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          await productionService.deleteReworkOrder(id);
          set((state) => {
            state.order = null;
            state.lastStartResult = null;
            state.lastFinishResult = null;
            state.isDeleting = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to delete rework order';
            state.errorDetails = getErrorDetails(error);
            state.isDeleting = false;
          });
          throw error;
        }
      },

      startOrder: async (id, payload: StartReworkPayload) => {
        set((state) => {
          state.isStarting = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const result = await productionService.startReworkOrder(id, payload);
          set((state) => {
            state.order = result.order;
            state.lastStartResult = result;
            state.isStarting = false;
          });
          return result;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to start rework order';
            state.errorDetails = getErrorDetails(error);
            state.isStarting = false;
          });
          throw error;
        }
      },

      finishOrder: async (id, payload: FinishReworkPayload) => {
        set((state) => {
          state.isFinishing = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const result = await productionService.finishReworkOrder(id, payload);
          set((state) => {
            state.order = result.order;
            state.lastFinishResult = result;
            state.isFinishing = false;
          });
          return result;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to finish rework order';
            state.errorDetails = getErrorDetails(error);
            state.isFinishing = false;
          });
          throw error;
        }
      },

      clearOrder: () => {
        set((state) => {
          state.order = null;
          state.lastStartResult = null;
          state.lastFinishResult = null;
          state.error = null;
          state.errorDetails = null;
        });
      },
    })),
    { name: 'rework-order-detail-store' },
  ),
);

export default useReworkOrderDetailStore;
