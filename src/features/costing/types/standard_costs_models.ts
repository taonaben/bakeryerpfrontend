import type { PaginatedResponse } from './shared';
export type { PaginatedResponse };

export type OverheadAllocationMethod = 'labor_minutes' | 'unit_rate';

// ──────────────────────────────────────────────
// Standard Costs
// ──────────────────────────────────────────────

export interface StandardCostLine {
  id: string;
  product: string;
  product_name: string;
  formula_line: string;
  quantity_per_batch: string;
  quantity_per_unit: string;
  unit_price_used: string;
  supplier_product_used: string;
  supplier_name: string;
  cost_per_unit: string;
  cost_percentage: string;
}

export interface StandardCost {
  id: string;
  formula: string;
  formula_revision: number;
  product: string;
  product_name: string;
  total_standard_cost_per_unit: string;
  material_cost_per_unit: string;
  overhead_cost_per_unit: string;
  overhead_allocation_method?: OverheadAllocationMethod;
  currency: string;
  computed_at: string;
}

export interface StandardCostDetail extends StandardCost {
  overhead_rate: string;
  batch_size_used: string;
  yield_percentage_used: string;
  computed_by: string;
  computed_by_name: string;
  lines: StandardCostLine[];
}

export interface ComputeStandardCostDTO {
  formula_id: string;
  warehouse_id: string;
}

export interface StandardCostFilters {
  product_id?: string;
  formula_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
