export type ProductionOverviewInterval = 'day' | 'week' | 'month';

export type ProductionOverviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type ProductionOverviewStatusCounts = Record<ProductionOverviewStatus, number>;

export interface ProductionOverviewSummaryParams {
  date_from?: string;
  date_to?: string;
  warehouse_id?: string;
  limit?: number;
}

export interface ProductionOverviewWipParams {
  warehouse_id?: string;
  limit?: number;
}

export interface ProductionOverviewYieldTrendsParams {
  date_from?: string;
  date_to?: string;
  warehouse_id?: string;
  interval?: ProductionOverviewInterval;
}

export interface ProductionOverviewScheduleAdherenceParams {
  date_from?: string;
  date_to?: string;
  warehouse_id?: string;
  limit?: number;
}

export interface ProductionOverviewFilters {
  warehouse_id: string;
  date_from: string;
  date_to: string;
  interval: ProductionOverviewInterval;
  limit: number;
  wip_limit: number;
  schedule_limit: number;
}

export interface ProductionOutputComparison {
  expected_output: number;
  actual_output: number;
}

export interface ProductionWasteSummary {
  quantity: number;
  waste_rate: number | null;
}

export interface ProductionVarianceSummary {
  quantity: number;
  variance_rate: number | null;
}

export interface ProductionTopProductProduced {
  product_id: string;
  product_name: string;
  total_quantity: number;
  batch_count: number;
}

export interface ProductionOverviewSummary {
  as_of_date: string;
  date_from: string | null;
  date_to: string | null;
  warehouse_id: string | null;
  production_order_counts_by_status: ProductionOverviewStatusCounts;
  rework_order_counts_by_status: ProductionOverviewStatusCounts;
  wip_order_count: number;
  in_progress_batch_count: number;
  scheduled_orders_overdue_to_start: number;
  completed_quantity: number;
  expected_vs_actual_output: ProductionOutputComparison;
  waste: ProductionWasteSummary;
  variance: ProductionVarianceSummary;
  top_products_produced: ProductionTopProductProduced[];
}

export interface ProductionWipOrder {
  order_id: string;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  status: ProductionOverviewStatus | string;
  scheduled_start: string;
  scheduled_end: string;
  formula_id: string;
  formula_name: string | null;
}

export interface ProductionBlockedWipOrder extends ProductionWipOrder {
  blocking_reasons: string[];
}

export interface ProductionWipBatch {
  batch_id: string;
  batch_number: string;
  order_id: string;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity_produced: number;
  status: ProductionOverviewStatus | string;
  started_at: string;
  completed_at: string | null;
}

export interface ProductionOverviewWip {
  as_of_date: string;
  warehouse_id: string | null;
  in_progress_orders: ProductionWipOrder[];
  in_progress_batches: ProductionWipBatch[];
  scheduled_orders_due_today: ProductionWipOrder[];
  scheduled_orders_overdue: ProductionWipOrder[];
  orders_blocked_by_unavailable_formula: ProductionBlockedWipOrder[];
}

export interface ProductionYieldOutputPoint {
  period: string;
  expected_output: number;
  actual_output: number;
  variance: number;
  completed_orders: number;
}

export interface ProductionWasteTrendPoint {
  period: string;
  quantity: number;
  line_count: number;
}

export interface ProductionVarianceByProductRow {
  product_id: string;
  product_name: string;
  expected_output: number;
  actual_output: number;
  variance: number;
  completed_orders: number;
}

export interface ProductionOverviewYieldTrends {
  date_from: string | null;
  date_to: string | null;
  warehouse_id: string | null;
  interval: ProductionOverviewInterval;
  output: ProductionYieldOutputPoint[];
  waste: ProductionWasteTrendPoint[];
  variance_by_product: ProductionVarianceByProductRow[];
}

export interface ProductionScheduleAdherenceOrder {
  order_id: string;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  scheduled_start: string;
  scheduled_end: string;
  first_batch_started_at: string | null;
  last_batch_completed_at: string | null;
  start_delay_minutes: number | null;
  finish_delay_minutes: number | null;
}

export interface ProductionOverviewScheduleAdherence {
  date_from: string | null;
  date_to: string | null;
  warehouse_id: string | null;
  on_time_start_rate: number | null;
  on_time_finish_rate: number | null;
  orders: ProductionScheduleAdherenceOrder[];
}
