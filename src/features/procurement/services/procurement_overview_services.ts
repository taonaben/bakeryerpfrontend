import { procurementOverviewApi } from '../api/procurement_overview_client';
import type {
  ProcurementCountTrendPoint,
  ProcurementMatchExceptionsSummary,
  ProcurementOverviewFilters,
  ProcurementOverviewSummary,
  ProcurementOverviewSummaryParams,
  ProcurementOverviewTrends,
  ProcurementOverviewTrendsParams,
  ProcurementPendingApprovalsSummary,
  ProcurementStatusCounts,
  ProcurementSupplierPerformance,
  ProcurementSupplierPerformanceParams,
  ProcurementSupplierPerformanceRow,
  ProcurementSupplierRiskSummary,
  ProcurementValueTrendPoint,
} from '../types/procurement_overview_models';

export const DEFAULT_PROCUREMENT_OVERVIEW_FILTERS: ProcurementOverviewFilters = {
  warehouse_id: '',
  date_from: '',
  date_to: '',
  interval: 'month',
  expiring_within_days: 30,
  supplier_id: '',
  supplier_limit: 10,
};

const toNumber = (value: unknown, fallback: number = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
};

const toCount = (value: unknown): number => Math.max(0, Math.trunc(toNumber(value)));

const cleanParams = <T extends Record<string, unknown>>(params: T): Partial<T> => {
  const cleaned: Partial<T> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    cleaned[key as keyof T] = value as T[keyof T];
  });

  return cleaned;
};

const normalizeCounts = (raw: unknown): ProcurementStatusCounts => {
  if (!raw || typeof raw !== 'object') return {};

  return Object.entries(raw as Record<string, unknown>).reduce<ProcurementStatusCounts>(
    (acc, [status, value]) => {
      acc[status] = toCount(value);
      return acc;
    },
    {},
  );
};

const normalizeValuePoint = (raw: any): ProcurementValueTrendPoint => ({
  period: raw?.period || '',
  count: toCount(raw?.count),
  total_value: toNumber(raw?.total_value),
});

const normalizeCountPoint = (raw: any): ProcurementCountTrendPoint => ({
  period: raw?.period || '',
  count: toCount(raw?.count),
});

const normalizePendingApprovals = (raw: any): ProcurementPendingApprovalsSummary => ({
  submitted_prs: toCount(raw?.submitted_prs),
  submitted_pos: toCount(raw?.submitted_pos),
  draft_grns: toCount(raw?.draft_grns),
  draft_supplier_invoices: toCount(raw?.draft_supplier_invoices),
});

const normalizeSupplierRisk = (raw: any): ProcurementSupplierRiskSummary => ({
  suppliers_on_hold: toCount(raw?.suppliers_on_hold),
  inactive_suppliers: toCount(raw?.inactive_suppliers),
  expired_documents: toCount(raw?.expired_documents),
  expiring_documents: toCount(raw?.expiring_documents),
  expiring_within_days: toCount(raw?.expiring_within_days || 30),
});

const normalizeMatchExceptions = (raw: any): ProcurementMatchExceptionsSummary => ({
  price_variance_lines: toCount(raw?.price_variance_lines),
  quantity_variance_lines: toCount(raw?.quantity_variance_lines),
  unmatched_lines: toCount(raw?.unmatched_lines),
  invoices_with_exceptions: toCount(raw?.invoices_with_exceptions),
  checked_invoices: toCount(raw?.checked_invoices),
});

const normalizeSupplierRow = (raw: any): ProcurementSupplierPerformanceRow => ({
  supplier_id: raw?.supplier_id || '',
  supplier_name: raw?.supplier_name || 'Unknown supplier',
  rating: toNullableNumber(raw?.rating),
  on_hold: Boolean(raw?.on_hold),
  is_active: raw?.is_active !== false,
  total_grns: toCount(raw?.total_grns),
  approved_grns: toCount(raw?.approved_grns),
  rejected_grns: toCount(raw?.rejected_grns),
  on_time_delivery_rate: toNullableNumber(raw?.on_time_delivery_rate),
  average_lead_time_days: toNullableNumber(raw?.average_lead_time_days),
  price_variance_lines: toCount(raw?.price_variance_lines),
  quantity_variance_lines: toCount(raw?.quantity_variance_lines),
  unmatched_lines: toCount(raw?.unmatched_lines),
  invoices_with_exceptions: toCount(raw?.invoices_with_exceptions),
  total_exception_lines: toCount(raw?.total_exception_lines),
});

export const procurementOverviewService = {
  buildSummaryParams(
    filters: Partial<ProcurementOverviewFilters> = {},
  ): ProcurementOverviewSummaryParams {
    const merged = { ...DEFAULT_PROCUREMENT_OVERVIEW_FILTERS, ...filters };
    return cleanParams({
      warehouse_id: merged.warehouse_id,
      expiring_within_days: merged.expiring_within_days,
    }) as ProcurementOverviewSummaryParams;
  },

  buildTrendsParams(
    filters: Partial<ProcurementOverviewFilters> = {},
  ): ProcurementOverviewTrendsParams {
    const merged = { ...DEFAULT_PROCUREMENT_OVERVIEW_FILTERS, ...filters };
    return cleanParams({
      date_from: merged.date_from,
      date_to: merged.date_to,
      warehouse_id: merged.warehouse_id,
      interval: merged.interval,
    }) as ProcurementOverviewTrendsParams;
  },

  buildSupplierPerformanceParams(
    filters: Partial<ProcurementOverviewFilters> = {},
  ): ProcurementSupplierPerformanceParams {
    const merged = { ...DEFAULT_PROCUREMENT_OVERVIEW_FILTERS, ...filters };
    return cleanParams({
      date_from: merged.date_from,
      date_to: merged.date_to,
      supplier_id: merged.supplier_id,
      limit: merged.supplier_limit,
    }) as ProcurementSupplierPerformanceParams;
  },

  async fetchSummary(
    filters?: Partial<ProcurementOverviewFilters>,
  ): Promise<ProcurementOverviewSummary> {
    const raw = await procurementOverviewApi.getSummary(this.buildSummaryParams(filters));
    return this.normalizeSummary(raw);
  },

  async fetchTrends(
    filters?: Partial<ProcurementOverviewFilters>,
  ): Promise<ProcurementOverviewTrends> {
    const raw = await procurementOverviewApi.getTrends(this.buildTrendsParams(filters));
    return this.normalizeTrends(raw);
  },

  async fetchSupplierPerformance(
    filters?: Partial<ProcurementOverviewFilters>,
  ): Promise<ProcurementSupplierPerformance> {
    const raw = await procurementOverviewApi.getSupplierPerformance(
      this.buildSupplierPerformanceParams(filters),
    );
    return this.normalizeSupplierPerformance(raw);
  },

  normalizeSummary(raw: any): ProcurementOverviewSummary {
    return {
      as_of_date: raw?.as_of_date || '',
      warehouse_id: raw?.warehouse_id ?? null,
      pr_counts_by_status: normalizeCounts(raw?.pr_counts_by_status),
      po_counts_by_status: normalizeCounts(raw?.po_counts_by_status),
      open_po_value: toNumber(raw?.open_po_value),
      overdue_pos: {
        count: toCount(raw?.overdue_pos?.count),
        value: toNumber(raw?.overdue_pos?.value),
      },
      grn_counts_by_status: normalizeCounts(raw?.grn_counts_by_status),
      supplier_invoice_counts_by_status: normalizeCounts(
        raw?.supplier_invoice_counts_by_status,
      ),
      pending_approvals: normalizePendingApprovals(raw?.pending_approvals),
      supplier_risk: normalizeSupplierRisk(raw?.supplier_risk),
      match_exceptions: normalizeMatchExceptions(raw?.match_exceptions),
    };
  },

  normalizeTrends(raw: any): ProcurementOverviewTrends {
    return {
      date_from: raw?.date_from ?? null,
      date_to: raw?.date_to ?? null,
      warehouse_id: raw?.warehouse_id ?? null,
      interval: raw?.interval || DEFAULT_PROCUREMENT_OVERVIEW_FILTERS.interval,
      po_value: Array.isArray(raw?.po_value)
        ? raw.po_value.map(normalizeValuePoint)
        : [],
      grns_approved: Array.isArray(raw?.grns_approved)
        ? raw.grns_approved.map(normalizeCountPoint)
        : [],
      supplier_invoices_approved: Array.isArray(raw?.supplier_invoices_approved)
        ? raw.supplier_invoices_approved.map(normalizeValuePoint)
        : [],
      supplier_invoices_paid: Array.isArray(raw?.supplier_invoices_paid)
        ? raw.supplier_invoices_paid.map(normalizeValuePoint)
        : [],
      overdue_pos: Array.isArray(raw?.overdue_pos)
        ? raw.overdue_pos.map(normalizeValuePoint)
        : [],
    };
  },

  normalizeSupplierPerformance(raw: any): ProcurementSupplierPerformance {
    return {
      date_from: raw?.date_from ?? null,
      date_to: raw?.date_to ?? null,
      supplier_id: raw?.supplier_id ?? null,
      suppliers: Array.isArray(raw?.suppliers)
        ? raw.suppliers.map(normalizeSupplierRow)
        : [],
      best_suppliers: Array.isArray(raw?.best_suppliers)
        ? raw.best_suppliers.map(normalizeSupplierRow)
        : [],
      worst_suppliers: Array.isArray(raw?.worst_suppliers)
        ? raw.worst_suppliers.map(normalizeSupplierRow)
        : [],
    };
  },
};
