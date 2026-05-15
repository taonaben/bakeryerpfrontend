import productionOverviewClient from '../api/productionOverviewClient';
import type {
  ProductionBlockedWipOrder,
  ProductionOverviewFilters,
  ProductionOverviewInterval,
  ProductionOverviewScheduleAdherence,
  ProductionOverviewScheduleAdherenceParams,
  ProductionOverviewStatus,
  ProductionOverviewStatusCounts,
  ProductionOverviewSummary,
  ProductionOverviewSummaryParams,
  ProductionOverviewWip,
  ProductionOverviewWipParams,
  ProductionOverviewYieldTrends,
  ProductionOverviewYieldTrendsParams,
  ProductionScheduleAdherenceOrder,
  ProductionTopProductProduced,
  ProductionVarianceByProductRow,
  ProductionWasteTrendPoint,
  ProductionWipBatch,
  ProductionWipOrder,
  ProductionYieldOutputPoint,
} from '../types/productionOverviewModels';
import { toProductionServiceError } from '../utils/errorHandling';

export const DEFAULT_PRODUCTION_OVERVIEW_FILTERS: ProductionOverviewFilters = {
  warehouse_id: '',
  date_from: '',
  date_to: '',
  interval: 'month',
  limit: 10,
  wip_limit: 20,
  schedule_limit: 20,
};

const STATUSES: ProductionOverviewStatus[] = [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
];

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

const normalizeStatusCounts = (raw: any): ProductionOverviewStatusCounts =>
  STATUSES.reduce<ProductionOverviewStatusCounts>(
    (acc, status) => {
      acc[status] = toCount(raw?.[status]);
      return acc;
    },
    { scheduled: 0, in_progress: 0, completed: 0, cancelled: 0 },
  );

const normalizeInterval = (value: unknown): ProductionOverviewInterval => {
  if (value === 'day' || value === 'week' || value === 'month') return value;
  return DEFAULT_PRODUCTION_OVERVIEW_FILTERS.interval;
};

const normalizeTopProduct = (raw: any): ProductionTopProductProduced => ({
  product_id: raw?.product_id || '',
  product_name: raw?.product_name || 'Unknown product',
  total_quantity: toNumber(raw?.total_quantity),
  batch_count: toCount(raw?.batch_count),
});

const normalizeWipOrder = (raw: any): ProductionWipOrder => ({
  order_id: raw?.order_id || '',
  product_id: raw?.product_id || '',
  product_name: raw?.product_name || 'Unknown product',
  warehouse_id: raw?.warehouse_id || '',
  warehouse_name: raw?.warehouse_name || 'Unknown warehouse',
  quantity: toNumber(raw?.quantity),
  status: raw?.status || 'scheduled',
  scheduled_start: raw?.scheduled_start || '',
  scheduled_end: raw?.scheduled_end || '',
  formula_id: raw?.formula_id || '',
  formula_name: raw?.formula_name ?? null,
});

const normalizeBlockedWipOrder = (raw: any): ProductionBlockedWipOrder => ({
  ...normalizeWipOrder(raw),
  blocking_reasons: Array.isArray(raw?.blocking_reasons)
    ? raw.blocking_reasons.map(String)
    : [],
});

const normalizeWipBatch = (raw: any): ProductionWipBatch => ({
  batch_id: raw?.batch_id || '',
  batch_number: raw?.batch_number || '',
  order_id: raw?.order_id || '',
  product_id: raw?.product_id || '',
  product_name: raw?.product_name || 'Unknown product',
  warehouse_id: raw?.warehouse_id || '',
  warehouse_name: raw?.warehouse_name || 'Unknown warehouse',
  quantity_produced: toNumber(raw?.quantity_produced),
  status: raw?.status || 'in_progress',
  started_at: raw?.started_at || '',
  completed_at: raw?.completed_at ?? null,
});

const normalizeOutputPoint = (raw: any): ProductionYieldOutputPoint => ({
  period: raw?.period || '',
  expected_output: toNumber(raw?.expected_output),
  actual_output: toNumber(raw?.actual_output),
  variance: toNumber(raw?.variance),
  completed_orders: toCount(raw?.completed_orders),
});

const normalizeWastePoint = (raw: any): ProductionWasteTrendPoint => ({
  period: raw?.period || '',
  quantity: toNumber(raw?.quantity),
  line_count: toCount(raw?.line_count),
});

const normalizeVarianceByProduct = (raw: any): ProductionVarianceByProductRow => ({
  product_id: raw?.product_id || '',
  product_name: raw?.product_name || 'Unknown product',
  expected_output: toNumber(raw?.expected_output),
  actual_output: toNumber(raw?.actual_output),
  variance: toNumber(raw?.variance),
  completed_orders: toCount(raw?.completed_orders),
});

const normalizeScheduleOrder = (raw: any): ProductionScheduleAdherenceOrder => ({
  order_id: raw?.order_id || '',
  product_id: raw?.product_id || '',
  product_name: raw?.product_name || 'Unknown product',
  warehouse_id: raw?.warehouse_id || '',
  warehouse_name: raw?.warehouse_name || 'Unknown warehouse',
  scheduled_start: raw?.scheduled_start || '',
  scheduled_end: raw?.scheduled_end || '',
  first_batch_started_at: raw?.first_batch_started_at ?? null,
  last_batch_completed_at: raw?.last_batch_completed_at ?? null,
  start_delay_minutes: toNullableNumber(raw?.start_delay_minutes),
  finish_delay_minutes: toNullableNumber(raw?.finish_delay_minutes),
});

export const productionOverviewService = {
  buildSummaryParams(
    filters: Partial<ProductionOverviewFilters> = {},
  ): ProductionOverviewSummaryParams {
    const merged = { ...DEFAULT_PRODUCTION_OVERVIEW_FILTERS, ...filters };
    return cleanParams({
      date_from: merged.date_from,
      date_to: merged.date_to,
      warehouse_id: merged.warehouse_id,
      limit: merged.limit,
    }) as ProductionOverviewSummaryParams;
  },

  buildWipParams(filters: Partial<ProductionOverviewFilters> = {}): ProductionOverviewWipParams {
    const merged = { ...DEFAULT_PRODUCTION_OVERVIEW_FILTERS, ...filters };
    return cleanParams({
      warehouse_id: merged.warehouse_id,
      limit: merged.wip_limit,
    }) as ProductionOverviewWipParams;
  },

  buildYieldTrendsParams(
    filters: Partial<ProductionOverviewFilters> = {},
  ): ProductionOverviewYieldTrendsParams {
    const merged = { ...DEFAULT_PRODUCTION_OVERVIEW_FILTERS, ...filters };
    return cleanParams({
      date_from: merged.date_from,
      date_to: merged.date_to,
      warehouse_id: merged.warehouse_id,
      interval: merged.interval,
    }) as ProductionOverviewYieldTrendsParams;
  },

  buildScheduleAdherenceParams(
    filters: Partial<ProductionOverviewFilters> = {},
  ): ProductionOverviewScheduleAdherenceParams {
    const merged = { ...DEFAULT_PRODUCTION_OVERVIEW_FILTERS, ...filters };
    return cleanParams({
      date_from: merged.date_from,
      date_to: merged.date_to,
      warehouse_id: merged.warehouse_id,
      limit: merged.schedule_limit,
    }) as ProductionOverviewScheduleAdherenceParams;
  },

  async fetchSummary(
    filters?: Partial<ProductionOverviewFilters>,
  ): Promise<ProductionOverviewSummary> {
    try {
      const raw = await productionOverviewClient.getSummary(this.buildSummaryParams(filters));
      return this.normalizeSummary(raw);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch production overview summary');
    }
  },

  async fetchWip(filters?: Partial<ProductionOverviewFilters>): Promise<ProductionOverviewWip> {
    try {
      const raw = await productionOverviewClient.getWip(this.buildWipParams(filters));
      return this.normalizeWip(raw);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch production WIP overview');
    }
  },

  async fetchYieldTrends(
    filters?: Partial<ProductionOverviewFilters>,
  ): Promise<ProductionOverviewYieldTrends> {
    try {
      const raw = await productionOverviewClient.getYieldTrends(
        this.buildYieldTrendsParams(filters),
      );
      return this.normalizeYieldTrends(raw);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch production yield trends');
    }
  },

  async fetchScheduleAdherence(
    filters?: Partial<ProductionOverviewFilters>,
  ): Promise<ProductionOverviewScheduleAdherence> {
    try {
      const raw = await productionOverviewClient.getScheduleAdherence(
        this.buildScheduleAdherenceParams(filters),
      );
      return this.normalizeScheduleAdherence(raw);
    } catch (error) {
      throw toProductionServiceError(error, 'Failed to fetch schedule adherence');
    }
  },

  normalizeSummary(raw: any): ProductionOverviewSummary {
    return {
      as_of_date: raw?.as_of_date || '',
      date_from: raw?.date_from ?? null,
      date_to: raw?.date_to ?? null,
      warehouse_id: raw?.warehouse_id ?? null,
      production_order_counts_by_status: normalizeStatusCounts(
        raw?.production_order_counts_by_status,
      ),
      rework_order_counts_by_status: normalizeStatusCounts(raw?.rework_order_counts_by_status),
      wip_order_count: toCount(raw?.wip_order_count),
      in_progress_batch_count: toCount(raw?.in_progress_batch_count),
      scheduled_orders_overdue_to_start: toCount(raw?.scheduled_orders_overdue_to_start),
      completed_quantity: toNumber(raw?.completed_quantity),
      expected_vs_actual_output: {
        expected_output: toNumber(raw?.expected_vs_actual_output?.expected_output),
        actual_output: toNumber(raw?.expected_vs_actual_output?.actual_output),
      },
      waste: {
        quantity: toNumber(raw?.waste?.quantity),
        waste_rate: toNullableNumber(raw?.waste?.waste_rate),
      },
      variance: {
        quantity: toNumber(raw?.variance?.quantity),
        variance_rate: toNullableNumber(raw?.variance?.variance_rate),
      },
      top_products_produced: Array.isArray(raw?.top_products_produced)
        ? raw.top_products_produced.map(normalizeTopProduct)
        : [],
    };
  },

  normalizeWip(raw: any): ProductionOverviewWip {
    return {
      as_of_date: raw?.as_of_date || '',
      warehouse_id: raw?.warehouse_id ?? null,
      in_progress_orders: Array.isArray(raw?.in_progress_orders)
        ? raw.in_progress_orders.map(normalizeWipOrder)
        : [],
      in_progress_batches: Array.isArray(raw?.in_progress_batches)
        ? raw.in_progress_batches.map(normalizeWipBatch)
        : [],
      scheduled_orders_due_today: Array.isArray(raw?.scheduled_orders_due_today)
        ? raw.scheduled_orders_due_today.map(normalizeWipOrder)
        : [],
      scheduled_orders_overdue: Array.isArray(raw?.scheduled_orders_overdue)
        ? raw.scheduled_orders_overdue.map(normalizeWipOrder)
        : [],
      orders_blocked_by_unavailable_formula: Array.isArray(
        raw?.orders_blocked_by_unavailable_formula,
      )
        ? raw.orders_blocked_by_unavailable_formula.map(normalizeBlockedWipOrder)
        : [],
    };
  },

  normalizeYieldTrends(raw: any): ProductionOverviewYieldTrends {
    return {
      date_from: raw?.date_from ?? null,
      date_to: raw?.date_to ?? null,
      warehouse_id: raw?.warehouse_id ?? null,
      interval: normalizeInterval(raw?.interval),
      output: Array.isArray(raw?.output) ? raw.output.map(normalizeOutputPoint) : [],
      waste: Array.isArray(raw?.waste) ? raw.waste.map(normalizeWastePoint) : [],
      variance_by_product: Array.isArray(raw?.variance_by_product)
        ? raw.variance_by_product.map(normalizeVarianceByProduct)
        : [],
    };
  },

  normalizeScheduleAdherence(raw: any): ProductionOverviewScheduleAdherence {
    return {
      date_from: raw?.date_from ?? null,
      date_to: raw?.date_to ?? null,
      warehouse_id: raw?.warehouse_id ?? null,
      on_time_start_rate: toNullableNumber(raw?.on_time_start_rate),
      on_time_finish_rate: toNullableNumber(raw?.on_time_finish_rate),
      orders: Array.isArray(raw?.orders) ? raw.orders.map(normalizeScheduleOrder) : [],
    };
  },
};

export default productionOverviewService;
