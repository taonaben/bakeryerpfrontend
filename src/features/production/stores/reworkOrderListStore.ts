import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { productionService } from '../services/productionServices';
import type {
  ProductionQueryParams,
  ReworkOrderListState,
} from '../types/productionModels';
import { ProductionApiServiceError } from '../utils/errorHandling';

export const useReworkOrderListStore = create<ReworkOrderListState>()(
  devtools(
    immer((set, get) => ({
      orders: [],
      filters: {},
      isLoading: false,
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
          const orders = await productionService.fetchReworkOrders(params);
          set((state) => {
            state.orders = orders;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch rework orders';
            state.errorDetails =
              error instanceof ProductionApiServiceError ? error.details : null;
            state.isLoading = false;
          });
        }
      },

      setFilters: (filters: Partial<ProductionQueryParams>) => {
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
    { name: 'rework-order-list-store' },
  ),
);

export default useReworkOrderListStore;
