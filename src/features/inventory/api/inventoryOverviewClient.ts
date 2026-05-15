import apiClient from '@/shared/services/api';
import type {
  InventoryOverviewMovementTrends,
  InventoryOverviewMovementTrendsParams,
  InventoryOverviewSummary,
  InventoryOverviewSummaryParams,
} from '../types/inventoryOverview';

export const inventoryOverviewApi = {
  /** GET /inventory/overview/summary/ */
  getSummary: async (
    params?: InventoryOverviewSummaryParams,
  ): Promise<InventoryOverviewSummary> => {
    const { data } = await apiClient.get('/inventory/overview/summary/', { params });
    return data;
  },

  /** GET /inventory/overview/movement-trends/ */
  getMovementTrends: async (
    params?: InventoryOverviewMovementTrendsParams,
  ): Promise<InventoryOverviewMovementTrends> => {
    const { data } = await apiClient.get('/inventory/overview/movement-trends/', {
      params,
    });
    return data;
  },
};
