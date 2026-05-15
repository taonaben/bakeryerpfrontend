export type InventoryOverviewInterval = 'day' | 'week' | 'month';

export type InventoryStockStatus = 'EMPTY' | 'ALMOST_OUT' | 'GOOD' | 'FULL';

export type InventoryAlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY';

export type InventoryMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';

export interface InventoryOverviewSummaryParams {
  warehouse_id?: string;
  low_stock_limit?: number;
}

export interface InventoryOverviewMovementTrendsParams {
  date_from?: string;
  date_to?: string;
  warehouse_id?: string;
  interval?: InventoryOverviewInterval;
}

export interface InventoryOverviewFilters {
  warehouse_id: string;
  date_from: string;
  date_to: string;
  interval: InventoryOverviewInterval;
  low_stock_limit: number;
}

export type InventoryStockStatusCounts = Record<InventoryStockStatus, number>;

export type InventoryAlertCountsByType = Record<InventoryAlertType, number>;

export type InventoryMovementCountsByType = Record<InventoryMovementType, number>;

export interface InventoryQuantityBucket {
  count: number;
  quantity: number;
}

export interface InventoryBatchesExpiringSummary {
  within_7_days: InventoryQuantityBucket;
  within_14_days: InventoryQuantityBucket;
  within_30_days: InventoryQuantityBucket;
}

export interface InventoryTopLowStockProduct {
  product_id: string;
  sku: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity_on_hand: number;
  status: InventoryStockStatus;
  min_stock_level: number | null;
  reorder_qty: number | null;
}

export interface InventoryProductWithoutReorderPolicy {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  unit_of_measure: string | null;
}

export interface InventoryProductsWithoutActiveReorderPolicy {
  count: number;
  products: InventoryProductWithoutReorderPolicy[];
}

export interface InventoryOverviewSummary {
  as_of_date: string;
  warehouse_id: string | null;
  total_active_products: number;
  total_warehouses: number;
  stock_status_counts: InventoryStockStatusCounts;
  open_alert_counts_by_type: InventoryAlertCountsByType;
  batches_expiring: InventoryBatchesExpiringSummary;
  expired_batches_with_quantity: InventoryQuantityBucket;
  stock_movement_counts_by_type: InventoryMovementCountsByType;
  top_low_stock_products: InventoryTopLowStockProduct[];
  products_without_active_reorder_policy: InventoryProductsWithoutActiveReorderPolicy;
}

export interface InventoryMovementTrendPoint {
  period: string;
  count: number;
  total_quantity: number;
}

export interface InventoryOverviewMovementTrends {
  date_from: string | null;
  date_to: string | null;
  warehouse_id: string | null;
  interval: InventoryOverviewInterval;
  inbound: InventoryMovementTrendPoint[];
  outbound: InventoryMovementTrendPoint[];
  adjustments: InventoryMovementTrendPoint[];
  returns: InventoryMovementTrendPoint[];
}
