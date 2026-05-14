import apiClient from '@/shared/services/api';
import type {
  ProcurementOverviewSummary,
  ProcurementOverviewSummaryParams,
  ProcurementOverviewTrends,
  ProcurementOverviewTrendsParams,
  ProcurementSupplierPerformance,
  ProcurementSupplierPerformanceParams,
} from '../types/procurement_overview_models';

export const procurementOverviewApi = {
  /** GET /purchasing/overview/summary/ */
  getSummary: async (
    params?: ProcurementOverviewSummaryParams,
  ): Promise<ProcurementOverviewSummary> => {
    const { data } = await apiClient.get('/purchasing/overview/summary/', { params });
    return data;
  },

  /** GET /purchasing/overview/trends/ */
  getTrends: async (
    params?: ProcurementOverviewTrendsParams,
  ): Promise<ProcurementOverviewTrends> => {
    const { data } = await apiClient.get('/purchasing/overview/trends/', { params });
    return data;
  },

  /** GET /purchasing/overview/supplier-performance/ */
  getSupplierPerformance: async (
    params?: ProcurementSupplierPerformanceParams,
  ): Promise<ProcurementSupplierPerformance> => {
    const { data } = await apiClient.get('/purchasing/overview/supplier-performance/', {
      params,
    });
    return data;
  },
};
