import type {
  InventoryAlertCountsByType,
  InventoryMovementCountsByType,
  InventoryStockStatus,
  InventoryStockStatusCounts,
} from '../../types/inventoryOverview';

export const INVENTORY_CHART_COLORS = {
  red: '#dc2626',
  amber: '#f59e0b',
  green: '#059669',
  blue: '#2563eb',
  blueMuted: '#566d7e',
  slate: '#64748b',
  pale: '#eef3f7',
  orange: '#f97316',
  teal: '#0f766e',
};

export const STOCK_STATUS_LABELS: Record<InventoryStockStatus, string> = {
  EMPTY: 'Empty',
  ALMOST_OUT: 'Almost out',
  GOOD: 'Good',
  FULL: 'Full',
};

export const STOCK_STATUS_COLORS: Record<InventoryStockStatus, string> = {
  EMPTY: INVENTORY_CHART_COLORS.red,
  ALMOST_OUT: INVENTORY_CHART_COLORS.amber,
  GOOD: INVENTORY_CHART_COLORS.green,
  FULL: INVENTORY_CHART_COLORS.blue,
};

export const numberFormat = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const quantityFormat = (value: number | null | undefined): string => {
  const safeValue = Number.isFinite(value || 0) ? Number(value || 0) : 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: safeValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
};

export const compactQuantity = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (Math.abs(safeValue) >= 1000000) return `${(safeValue / 1000000).toFixed(1)}m`;
  if (Math.abs(safeValue) >= 1000) return `${(safeValue / 1000).toFixed(1)}k`;
  return `${safeValue.toFixed(0)}`;
};

export const countTotal = (
  counts: InventoryStockStatusCounts | InventoryAlertCountsByType | InventoryMovementCountsByType,
): number => Object.values(counts).reduce((total, value) => total + value, 0);

export const statusClassName = (status: string): string =>
  status.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const formatPeriodLabel = (period: string): string => {
  if (!period) return '-';
  const date = new Date(period);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const defaultDateFrom = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);
};

export const todayIso = (): string => new Date().toISOString().slice(0, 10);
