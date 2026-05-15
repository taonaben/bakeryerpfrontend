import { inventoryOverviewApi } from '../api/inventoryOverviewClient';
import type {
  InventoryAlertCountsByType,
  InventoryBatchesExpiringSummary,
  InventoryMovementCountsByType,
  InventoryMovementTrendPoint,
  InventoryOverviewFilters,
  InventoryOverviewInterval,
  InventoryOverviewMovementTrends,
  InventoryOverviewMovementTrendsParams,
  InventoryOverviewSummary,
  InventoryOverviewSummaryParams,
  InventoryProductWithoutReorderPolicy,
  InventoryProductsWithoutActiveReorderPolicy,
  InventoryQuantityBucket,
  InventoryStockStatus,
  InventoryStockStatusCounts,
  InventoryTopLowStockProduct,
} from '../types/inventoryOverview';

export const DEFAULT_INVENTORY_OVERVIEW_FILTERS: InventoryOverviewFilters = {
  warehouse_id: '',
  date_from: '',
  date_to: '',
  interval: 'month',
  low_stock_limit: 10,
};

const STOCK_STATUSES: InventoryStockStatus[] = ['EMPTY', 'ALMOST_OUT', 'GOOD', 'FULL'];
const ALERT_TYPES = ['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRY'] as const;
const MOVEMENT_TYPES = ['IN', 'OUT', 'ADJUSTMENT', 'RETURN'] as const;

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

const normalizeStatus = (value: unknown): InventoryStockStatus => {
  const status = String(value || '').toUpperCase();
  return STOCK_STATUSES.includes(status as InventoryStockStatus)
    ? (status as InventoryStockStatus)
    : 'GOOD';
};

const normalizeBucket = (raw: any): InventoryQuantityBucket => ({
  count: toCount(raw?.count),
  quantity: toNumber(raw?.quantity),
});

const normalizeBatchesExpiring = (raw: any): InventoryBatchesExpiringSummary => ({
  within_7_days: normalizeBucket(raw?.within_7_days),
  within_14_days: normalizeBucket(raw?.within_14_days),
  within_30_days: normalizeBucket(raw?.within_30_days),
});

const normalizeStockStatusCounts = (raw: any): InventoryStockStatusCounts =>
  STOCK_STATUSES.reduce<InventoryStockStatusCounts>(
    (acc, status) => {
      acc[status] = toCount(raw?.[status]);
      return acc;
    },
    { EMPTY: 0, ALMOST_OUT: 0, GOOD: 0, FULL: 0 },
  );

const normalizeAlertCounts = (raw: any): InventoryAlertCountsByType =>
  ALERT_TYPES.reduce<InventoryAlertCountsByType>(
    (acc, type) => {
      acc[type] = toCount(raw?.[type]);
      return acc;
    },
    { LOW_STOCK: 0, OUT_OF_STOCK: 0, EXPIRY: 0 },
  );

const normalizeMovementCounts = (raw: any): InventoryMovementCountsByType =>
  MOVEMENT_TYPES.reduce<InventoryMovementCountsByType>(
    (acc, type) => {
      acc[type] = toCount(raw?.[type]);
      return acc;
    },
    { IN: 0, OUT: 0, ADJUSTMENT: 0, RETURN: 0 },
  );

const normalizeLowStockProduct = (raw: any): InventoryTopLowStockProduct => ({
  product_id: raw?.product_id || '',
  sku: raw?.sku || '',
  product_name: raw?.product_name || 'Unknown product',
  warehouse_id: raw?.warehouse_id || '',
  warehouse_name: raw?.warehouse_name || 'Unknown warehouse',
  quantity_on_hand: toNumber(raw?.quantity_on_hand),
  status: normalizeStatus(raw?.status),
  min_stock_level: toNullableNumber(raw?.min_stock_level),
  reorder_qty: toNullableNumber(raw?.reorder_qty),
});

const normalizeProductWithoutPolicy = (
  raw: any,
): InventoryProductWithoutReorderPolicy => ({
  id: raw?.id || '',
  sku: raw?.sku || '',
  name: raw?.name || 'Unknown product',
  category: raw?.category ?? null,
  unit_of_measure: raw?.unit_of_measure ?? null,
});

const normalizeProductsWithoutPolicy = (
  raw: any,
): InventoryProductsWithoutActiveReorderPolicy => ({
  count: toCount(raw?.count),
  products: Array.isArray(raw?.products)
    ? raw.products.map(normalizeProductWithoutPolicy)
    : [],
});

const normalizeMovementTrendPoint = (raw: any): InventoryMovementTrendPoint => ({
  period: raw?.period || '',
  count: toCount(raw?.count),
  total_quantity: toNumber(raw?.total_quantity),
});

const normalizeInterval = (value: unknown): InventoryOverviewInterval => {
  if (value === 'day' || value === 'week' || value === 'month') return value;
  return DEFAULT_INVENTORY_OVERVIEW_FILTERS.interval;
};

export const inventoryOverviewService = {
  buildSummaryParams(
    filters: Partial<InventoryOverviewFilters> = {},
  ): InventoryOverviewSummaryParams {
    const merged = { ...DEFAULT_INVENTORY_OVERVIEW_FILTERS, ...filters };
    return cleanParams({
      warehouse_id: merged.warehouse_id,
      low_stock_limit: merged.low_stock_limit,
    }) as InventoryOverviewSummaryParams;
  },

  buildMovementTrendsParams(
    filters: Partial<InventoryOverviewFilters> = {},
  ): InventoryOverviewMovementTrendsParams {
    const merged = { ...DEFAULT_INVENTORY_OVERVIEW_FILTERS, ...filters };
    return cleanParams({
      date_from: merged.date_from,
      date_to: merged.date_to,
      warehouse_id: merged.warehouse_id,
      interval: merged.interval,
    }) as InventoryOverviewMovementTrendsParams;
  },

  async fetchSummary(
    filters?: Partial<InventoryOverviewFilters>,
  ): Promise<InventoryOverviewSummary> {
    const raw = await inventoryOverviewApi.getSummary(this.buildSummaryParams(filters));
    return this.normalizeSummary(raw);
  },

  async fetchMovementTrends(
    filters?: Partial<InventoryOverviewFilters>,
  ): Promise<InventoryOverviewMovementTrends> {
    const raw = await inventoryOverviewApi.getMovementTrends(
      this.buildMovementTrendsParams(filters),
    );
    return this.normalizeMovementTrends(raw);
  },

  normalizeSummary(raw: any): InventoryOverviewSummary {
    return {
      as_of_date: raw?.as_of_date || '',
      warehouse_id: raw?.warehouse_id ?? null,
      total_active_products: toCount(raw?.total_active_products),
      total_warehouses: toCount(raw?.total_warehouses),
      stock_status_counts: normalizeStockStatusCounts(raw?.stock_status_counts),
      open_alert_counts_by_type: normalizeAlertCounts(raw?.open_alert_counts_by_type),
      batches_expiring: normalizeBatchesExpiring(raw?.batches_expiring),
      expired_batches_with_quantity: normalizeBucket(raw?.expired_batches_with_quantity),
      stock_movement_counts_by_type: normalizeMovementCounts(
        raw?.stock_movement_counts_by_type,
      ),
      top_low_stock_products: Array.isArray(raw?.top_low_stock_products)
        ? raw.top_low_stock_products.map(normalizeLowStockProduct)
        : [],
      products_without_active_reorder_policy: normalizeProductsWithoutPolicy(
        raw?.products_without_active_reorder_policy,
      ),
    };
  },

  normalizeMovementTrends(raw: any): InventoryOverviewMovementTrends {
    return {
      date_from: raw?.date_from ?? null,
      date_to: raw?.date_to ?? null,
      warehouse_id: raw?.warehouse_id ?? null,
      interval: normalizeInterval(raw?.interval),
      inbound: Array.isArray(raw?.inbound)
        ? raw.inbound.map(normalizeMovementTrendPoint)
        : [],
      outbound: Array.isArray(raw?.outbound)
        ? raw.outbound.map(normalizeMovementTrendPoint)
        : [],
      adjustments: Array.isArray(raw?.adjustments)
        ? raw.adjustments.map(normalizeMovementTrendPoint)
        : [],
      returns: Array.isArray(raw?.returns)
        ? raw.returns.map(normalizeMovementTrendPoint)
        : [],
    };
  },
};
