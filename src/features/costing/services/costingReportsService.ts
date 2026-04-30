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
    if (!productId) return [];
    try {
      const result = await costingReportsApi.getCostTrend(productId, filters);
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  },

  async getVarianceAnalysis(
    filters?: VarianceAnalysisReportFilters,
  ): Promise<VarianceAnalysisReport[]> {
    try {
      const result = await costingReportsApi.getVarianceAnalysis(filters);
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  },

  async getMarginReport(filters?: MarginReportFilters): Promise<MarginReportItem[]> {
    try {
      const result = await costingReportsApi.getMarginReport(filters);
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  },

  async getIngredientCostBreakdown(
    filters?: IngredientCostBreakdownFilters,
  ): Promise<IngredientCostBreakdownItem[]> {
    try {
      const result = await costingReportsApi.getIngredientCostBreakdown(filters);
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  },
};
