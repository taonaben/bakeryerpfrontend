import apiClient from '@/shared/services/api';
import type {
  CostTrendDataPoint,
  CostTrendFilters,
  VarianceAnalysisReport,
  VarianceAnalysisReportFilters,
  MarginReportItem,
  MarginReportFilters,
  IngredientCostBreakdownItem,
  IngredientCostBreakdownFilters,
} from '../types/reports_models';

const BASE = '/costing/reports';

export const costingReportsApi = {
  getCostTrend: async (
    productId: string,
    params?: CostTrendFilters,
  ): Promise<CostTrendDataPoint[]> => {
    const { data } = await apiClient.get(`${BASE}/cost-trend/${productId}`, { params });
    return data;
  },

  getVarianceAnalysis: async (
    params?: VarianceAnalysisReportFilters,
  ): Promise<VarianceAnalysisReport[]> => {
    const { data } = await apiClient.get(`${BASE}/variance-analysis`, { params });
    return data;
  },

  getMarginReport: async (params?: MarginReportFilters): Promise<MarginReportItem[]> => {
    const { data } = await apiClient.get(`${BASE}/margin-report`, { params });
    return data;
  },

  getIngredientCostBreakdown: async (
    params?: IngredientCostBreakdownFilters,
  ): Promise<IngredientCostBreakdownItem[]> => {
    const { data } = await apiClient.get(`${BASE}/ingredient-cost-breakdown`, { params });
    return data;
  },
};
