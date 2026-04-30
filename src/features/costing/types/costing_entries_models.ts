import type { PaginatedResponse } from './shared';
export type { PaginatedResponse };

// ──────────────────────────────────────────────
// Costing Entries
// ──────────────────────────────────────────────

export interface CostingEntryLine {
  id: string;
  product: string;
  product_name: string;
  batch_material: string;
  actual_quantity_used: string;
  unit_price_used: string;
  actual_cost: string;
}

export interface CostingEntry {
  id: string;
  production_batch: string;
  batch_number: string;
  product: string;
  product_name: string;
  warehouse: string;
  warehouse_name: string;
  total_cost: string;
  cost_per_unit: string;
  actual_output_quantity: string;
  currency: string;
  computed_at: string;
}

export interface CostingEntryDetail extends CostingEntry {
  standard_cost: string;
  overhead_rate: string;
  total_material_cost: string;
  overhead_cost: string;
  actual_waste_quantity: string;
  lines: CostingEntryLine[];
}

export interface ComputeCostingEntryDTO {
  production_batch_id: string;
  force?: boolean;
}

export interface CostingEntryFilters {
  product_id?: string;
  warehouse_id?: string;
  batch_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
