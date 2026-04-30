import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { productionService } from '../services/productionServices';
import type {
  CopyProductionOrderPayload,
  CreateProductionOrderPayload,
  FinishProductionPayload,
  ProductionOrderDetailState,
  StartProductionPayload,
  UpdateProductionOrderPayload,
} from '../types/productionModels';
import { ProductionApiServiceError } from '../utils/errorHandling';

const getErrorDetails = (error: unknown) =>
  error instanceof ProductionApiServiceError ? error.details : null;

export const useProductionOrderDetailStore = create<ProductionOrderDetailState>()(
  devtools(
    immer((set) => ({
      order: null,
      summary: null,
      finishExpectations: null,
      planResult: null,
      lastStartResult: null,
      lastFinishResult: null,
      lastCopiedOrder: null,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      isPlanning: false,
      isStarting: false,
      isFinishing: false,
      isCopying: false,
      isLoadingSummary: false,
      isLoadingExpectations: false,
      error: null,
      errorDetails: null,

      fetchOrder: async (id) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const order = await productionService.fetchProductionOrder(id);
          set((state) => {
            state.order = order;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch production order';
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
          const order = await productionService.createProductionOrder(payload);
          set((state) => {
            state.order = order;
            state.summary = null;
            state.finishExpectations = null;
            state.planResult = null;
            state.lastStartResult = null;
            state.lastFinishResult = null;
            state.isSaving = false;
          });
          return order;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to create production order';
            state.errorDetails = getErrorDetails(error);
            state.isSaving = false;
          });
          throw error;
        }
      },

      updateOrder: async (
        id: string,
        payload: UpdateProductionOrderPayload,
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
              ? await productionService.replaceProductionOrder(id, payload)
              : await productionService.updateProductionOrder(id, payload);
          set((state) => {
            state.order = order;
            state.summary = null;
            state.finishExpectations = null;
            state.planResult = null;
            state.isSaving = false;
          });
          return order;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to update production order';
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
          await productionService.deleteProductionOrder(id);
          set((state) => {
            state.order = null;
            state.summary = null;
            state.finishExpectations = null;
            state.planResult = null;
            state.lastStartResult = null;
            state.lastFinishResult = null;
            state.lastCopiedOrder = null;
            state.isDeleting = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to delete production order';
            state.errorDetails = getErrorDetails(error);
            state.isDeleting = false;
          });
          throw error;
        }
      },

      fetchSummary: async (id) => {
        set((state) => {
          state.isLoadingSummary = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const summary = await productionService.fetchProductionOrderSummary(id);
          set((state) => {
            state.summary = summary;
            state.isLoadingSummary = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch production summary';
            state.errorDetails = getErrorDetails(error);
            state.isLoadingSummary = false;
          });
          throw error;
        }
      },

      fetchFinishExpectations: async (id) => {
        set((state) => {
          state.isLoadingExpectations = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const expectations = await productionService.getProductionFinishExpectations(id);
          set((state) => {
            state.finishExpectations = expectations;
            state.isLoadingExpectations = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch production finish expectations';
            state.errorDetails = getErrorDetails(error);
            state.isLoadingExpectations = false;
          });
          throw error;
        }
      },

      planOrder: async (id) => {
        set((state) => {
          state.isPlanning = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const plan = await productionService.planProductionOrder(id);
          set((state) => {
            state.planResult = plan;
            state.isPlanning = false;
          });
          return plan;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to generate production plan';
            state.errorDetails = getErrorDetails(error);
            state.isPlanning = false;
          });
          throw error;
        }
      },

      startOrder: async (id, payload: StartProductionPayload = {}) => {
        set((state) => {
          state.isStarting = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const result = await productionService.startProductionOrder(id, payload);
          set((state) => {
            state.lastStartResult = result;
            state.planResult = result.plan;
            if (state.order) {
              state.order.status = result.batch.status;
            }
            state.summary = null;
            state.isStarting = false;
          });
          return result;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to start production order';
            state.errorDetails = getErrorDetails(error);
            state.isStarting = false;
          });
          throw error;
        }
      },

      finishOrder: async (id, payload: FinishProductionPayload) => {
        set((state) => {
          state.isFinishing = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const result = await productionService.finishProductionOrder(id, payload);
          set((state) => {
            state.lastFinishResult = result;
            state.finishExpectations = {
              expected_output: result.expected_output,
              expected_waste: result.expected_waste,
            };
            if (state.order) {
              state.order.status = result.batch.status;
            }
            state.summary = null;
            state.isFinishing = false;
          });
          return result;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to finish production order';
            state.errorDetails = getErrorDetails(error);
            state.isFinishing = false;
          });
          throw error;
        }
      },

      copyOrder: async (id, payload?: CopyProductionOrderPayload) => {
        set((state) => {
          state.isCopying = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const copied = await productionService.copyProductionOrder(id, payload);
          set((state) => {
            state.lastCopiedOrder = copied;
            state.isCopying = false;
          });
          return copied;
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to copy production order';
            state.errorDetails = getErrorDetails(error);
            state.isCopying = false;
          });
          throw error;
        }
      },

      clearOrder: () => {
        set((state) => {
          state.order = null;
          state.summary = null;
          state.finishExpectations = null;
          state.planResult = null;
          state.lastStartResult = null;
          state.lastFinishResult = null;
          state.lastCopiedOrder = null;
          state.error = null;
          state.errorDetails = null;
          state.isLoadingSummary = false;
          state.isLoadingExpectations = false;
        });
      },
    })),
    { name: 'production-order-detail-store' },
  ),
);

export default useProductionOrderDetailStore;
