import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { productionService } from '../services/productionServices';
import type {
  ProductionOrderListState,
  ProductionQueryParams,
} from '../types/productionModels';
import { ProductionApiServiceError } from '../utils/errorHandling';

const defaultFilters: ProductionQueryParams = {};

export const useProductionOrderListStore = create<ProductionOrderListState>()(
  devtools(
    immer((set, get) => ({
      orders: [],
      finishedOrders: [],
      filters: defaultFilters,
      isLoading: false,
      isLoadingFinished: false,
      error: null,
      errorDetails: null,

      fetchOrders: async (params = get().filters) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
          state.errorDetails = null;
          state.filters = params;
        });

        try {
          const orders = await productionService.fetchProductionOrders(params);
          set((state) => {
            state.orders = orders;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch production orders';
            state.errorDetails =
              error instanceof ProductionApiServiceError ? error.details : null;
            state.isLoading = false;
          });
        }
      },

      fetchFinishedOrders: async () => {
        set((state) => {
          state.isLoadingFinished = true;
          state.error = null;
          state.errorDetails = null;
        });

        try {
          const orders = await productionService.fetchFinishedProductionOrders();
          set((state) => {
            state.finishedOrders = orders;
            state.isLoadingFinished = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch finished production orders';
            state.errorDetails =
              error instanceof ProductionApiServiceError ? error.details : null;
            state.isLoadingFinished = false;
          });
        }
      },

      setFilters: (filters) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        });
      },

      clearFilters: () => {
        set((state) => {
          state.filters = {};
        });
      },
    })),
    { name: 'production-order-list-store' },
  ),
);

export default useProductionOrderListStore;
