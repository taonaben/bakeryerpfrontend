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

/** Unwrap plain array or paginated { results: [...] } envelope */
const toArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export const costingReportsApi = {
  getCostTrend: async (
    productId: string,
    params?: CostTrendFilters,
  ): Promise<CostTrendDataPoint[]> => {
    const { data } = await apiClient.get(`${BASE}/cost-trend/${productId}`, { params });
    return toArray<CostTrendDataPoint>(data);
  },

  getVarianceAnalysis: async (
    params?: VarianceAnalysisReportFilters,
  ): Promise<VarianceAnalysisReport[]> => {
    const { data } = await apiClient.get(`${BASE}/variance-analysis`, { params });
    return toArray<VarianceAnalysisReport>(data);
  },

  getMarginReport: async (params?: MarginReportFilters): Promise<MarginReportItem[]> => {
    const { data } = await apiClient.get(`${BASE}/margin-report`, { params });
    return toArray<MarginReportItem>(data);
  },

  getIngredientCostBreakdown: async (
    params?: IngredientCostBreakdownFilters,
  ): Promise<IngredientCostBreakdownItem[]> => {
    const { data } = await apiClient.get(`${BASE}/ingredient-cost-breakdown`, { params });
    const items = toArray<IngredientCostBreakdownItem>(data);
    // Log raw shape once so we can confirm field names
    if (items.length > 0) {
      console.log('[IngredientCostBreakdown] raw item keys:', Object.keys(items[0]));
      console.log('[IngredientCostBreakdown] first item:', items[0]);
    }
    return items;
  },
};
