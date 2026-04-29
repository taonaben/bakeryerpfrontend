import { costingReportsApi } from '../api/reports_client';
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

// ──────────────────────────────────────────────
// Costing Reports Service
// ──────────────────────────────────────────────

export const costingReportsService = {
  async getCostTrend(
    productId: string,
    filters?: CostTrendFilters,
  ): Promise<CostTrendDataPoint[]> {
    if (!productId) throw new Error('Product ID is required');
    return costingReportsApi.getCostTrend(productId, filters);
  },

  async getVarianceAnalysis(
    filters?: VarianceAnalysisReportFilters,
  ): Promise<VarianceAnalysisReport[]> {
    return costingReportsApi.getVarianceAnalysis(filters);
  },

  async getMarginReport(filters?: MarginReportFilters): Promise<MarginReportItem[]> {
    return costingReportsApi.getMarginReport(filters);
  },

  async getIngredientCostBreakdown(
    filters?: IngredientCostBreakdownFilters,
  ): Promise<IngredientCostBreakdownItem[]> {
    return costingReportsApi.getIngredientCostBreakdown(filters);
  },
};
