// ──────────────────────────────────────────────
// Reports & Analytics
// ──────────────────────────────────────────────

export interface CostTrendDataPoint {
  batch_number: string;
  production_batch: string;
  computed_at: string;
  cost_per_unit: string;
  total_cost: string;
  actual_output_quantity: string;
}

export interface VarianceAnalysisReport {
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  total_variance: string;
  material_price_variance: string;
  material_usage_variance: string;
  yield_variance: string;
  overhead_variance: string;
  avg_variance_percentage: string;
  batch_count: number;
}

export interface MarginReportItem {
  product_id: string;
  product_name: string;
  standard_cost_per_unit: string;
  recommended_selling_price: string;
  minimum_selling_price: string;
  target_gross_margin_percentage: string;
  minimum_margin_percentage: string;
  currency: string;
}

export interface IngredientCostBreakdownItem {
  product_id: string;
  product_name: string;
  cost_per_unit: string;
  cost_percentage: string;
  quantity_per_unit: string;
  unit_price_used: string;
}

export interface CostTrendFilters {
  warehouse_id?: string;
  limit?: number;
}

export interface VarianceAnalysisReportFilters {
  product_id?: string;
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface MarginReportFilters {
  product_id?: string;
}

export interface IngredientCostBreakdownFilters {
  product_id?: string;
  formula_id?: string;
}
