import type { PaginatedResponse } from './shared';
export type { PaginatedResponse };

// ──────────────────────────────────────────────
// Variances
// ──────────────────────────────────────────────

export interface Variance {
  id: string;
  costing_entry: string;
  standard_cost: string;
  production_batch: string;
  batch_number: string;
  product: string;
  product_name: string;
  warehouse: string;
  warehouse_name: string;
  material_price_variance: string;
  material_usage_variance: string;
  yield_variance: string;
  overhead_variance: string;
  total_variance: string;
  variance_percentage: string;
  is_favourable: boolean;
  computed_at: string;
}

export type VarianceSummaryGroupBy = 'product' | 'warehouse';

export interface VarianceSummaryItem {
  group_by: VarianceSummaryGroupBy;
  group_id: string;
  group_name: string;
  total_variance: string;
  avg_variance_percentage: string;
  favourable_count: number;
  adverse_count: number;
  batch_count: number;
}

export interface VarianceFilters {
  product_id?: string;
  warehouse_id?: string;
  is_favourable?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface VarianceSummaryFilters {
  group_by?: VarianceSummaryGroupBy;
  date_from?: string;
  date_to?: string;
}
