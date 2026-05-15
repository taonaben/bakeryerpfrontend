import type { ProcurementStatusCounts } from '../../types/procurement_overview_models';

export const PROCUREMENT_CHART_COLORS = {
  blue: '#566d7e',
  blueLight: '#7aa6b2',
  green: '#059669',
  amber: '#f59e0b',
  orange: '#f97316',
  red: '#dc2626',
  slate: '#64748b',
  pale: '#eef3f7',
};

export const money = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export const compactMoney = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (Math.abs(safeValue) >= 1000000) return `$${(safeValue / 1000000).toFixed(1)}m`;
  if (Math.abs(safeValue) >= 1000) return `$${(safeValue / 1000).toFixed(1)}k`;
  return `$${safeValue.toFixed(0)}`;
};

export const pct = (value: number | null): string =>
  value === null || !Number.isFinite(value) ? '-' : `${value.toFixed(1)}%`;

export const countTotal = (counts: ProcurementStatusCounts): number =>
  Object.values(counts).reduce((total, value) => total + value, 0);

export const statusClassName = (status: string): string =>
  status.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const formatPeriodLabel = (period: string): string => {
  if (!period) return '-';
  const date = new Date(`${period}T00:00:00`);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const defaultDateFrom = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);
};

export const todayIso = (): string => new Date().toISOString().slice(0, 10);
