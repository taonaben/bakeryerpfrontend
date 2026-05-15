export type ProcurementOverviewInterval = 'day' | 'week' | 'month';

export interface ProcurementOverviewSummaryParams {
  warehouse_id?: string;
  expiring_within_days?: number;
}

export interface ProcurementOverviewTrendsParams {
  date_from?: string;
  date_to?: string;
  warehouse_id?: string;
  interval?: ProcurementOverviewInterval;
}

export interface ProcurementSupplierPerformanceParams {
  date_from?: string;
  date_to?: string;
  supplier_id?: string;
  limit?: number;
}

export interface ProcurementStatusCounts {
  [status: string]: number;
}

export interface ProcurementOverduePOsSummary {
  count: number;
  value: number;
}

export interface ProcurementPendingApprovalsSummary {
  submitted_prs: number;
  submitted_pos: number;
  draft_grns: number;
  draft_supplier_invoices: number;
}

export interface ProcurementSupplierRiskSummary {
  suppliers_on_hold: number;
  inactive_suppliers: number;
  expired_documents: number;
  expiring_documents: number;
  expiring_within_days: number;
}

export interface ProcurementMatchExceptionsSummary {
  price_variance_lines: number;
  quantity_variance_lines: number;
  unmatched_lines: number;
  invoices_with_exceptions: number;
  checked_invoices: number;
}

export interface ProcurementOverviewSummary {
  as_of_date: string;
  warehouse_id: string | null;
  pr_counts_by_status: ProcurementStatusCounts;
  po_counts_by_status: ProcurementStatusCounts;
  open_po_value: number;
  overdue_pos: ProcurementOverduePOsSummary;
  grn_counts_by_status: ProcurementStatusCounts;
  supplier_invoice_counts_by_status: ProcurementStatusCounts;
  pending_approvals: ProcurementPendingApprovalsSummary;
  supplier_risk: ProcurementSupplierRiskSummary;
  match_exceptions: ProcurementMatchExceptionsSummary;
}

export interface ProcurementValueTrendPoint {
  period: string;
  count: number;
  total_value: number;
}

export interface ProcurementCountTrendPoint {
  period: string;
  count: number;
}

export interface ProcurementOverviewTrends {
  date_from: string | null;
  date_to: string | null;
  warehouse_id: string | null;
  interval: ProcurementOverviewInterval;
  po_value: ProcurementValueTrendPoint[];
  grns_approved: ProcurementCountTrendPoint[];
  supplier_invoices_approved: ProcurementValueTrendPoint[];
  supplier_invoices_paid: ProcurementValueTrendPoint[];
  overdue_pos: ProcurementValueTrendPoint[];
}

export interface ProcurementSupplierPerformanceRow {
  supplier_id: string;
  supplier_name: string;
  rating: number | null;
  on_hold: boolean;
  is_active: boolean;
  total_grns: number;
  approved_grns: number;
  rejected_grns: number;
  on_time_delivery_rate: number | null;
  average_lead_time_days: number | null;
  price_variance_lines: number;
  quantity_variance_lines: number;
  unmatched_lines: number;
  invoices_with_exceptions: number;
  total_exception_lines: number;
}

export interface ProcurementSupplierPerformance {
  date_from: string | null;
  date_to: string | null;
  supplier_id: string | null;
  suppliers: ProcurementSupplierPerformanceRow[];
  best_suppliers: ProcurementSupplierPerformanceRow[];
  worst_suppliers: ProcurementSupplierPerformanceRow[];
}

export interface ProcurementOverviewFilters {
  warehouse_id: string;
  date_from: string;
  date_to: string;
  interval: ProcurementOverviewInterval;
  expiring_within_days: number;
  supplier_id: string;
  supplier_limit: number;
}
