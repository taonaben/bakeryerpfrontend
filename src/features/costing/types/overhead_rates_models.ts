import type { Timestamp, PaginatedResponse } from './shared';
export type { PaginatedResponse };

// ──────────────────────────────────────────────
// Overhead Rates
// ──────────────────────────────────────────────

export interface OverheadRate extends Timestamp {
  id: string;
  warehouse: string;
  warehouse_name: string;
  period_start: string;
  period_end: string;
  total_overhead_budgeted: string;
  planned_production_units: string;
  planned_labor_minutes?: string;
  rate_per_unit: string;
  rate_per_labor_minute?: string;
  currency: string;
  notes: string;
  created_by: string;
  created_by_name: string;
}

export interface CreateOverheadRateDTO {
  warehouse: string;
  period_start: string;
  period_end: string;
  total_overhead_budgeted: string;
  planned_production_units: string;
  planned_labor_minutes?: string;
  currency: string;
  notes?: string;
}

export type UpdateOverheadRateDTO = Partial<CreateOverheadRateDTO>;

export interface OverheadRateFilters {
  warehouse_id?: string;
  period_start?: string;
  period_end?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
