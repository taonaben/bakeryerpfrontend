import type {
  ProductionOverviewStatus,
  ProductionOverviewStatusCounts,
} from '../../types/productionOverviewModels';

export const PRODUCTION_OVERVIEW_COLORS = {
  scheduled: '#f59e0b',
  inProgress: '#2563eb',
  completed: '#059669',
  cancelled: '#64748b',
  danger: '#dc2626',
  slate: '#566d7e',
  teal: '#0f766e',
  violet: '#7c3aed',
};

export const productionStatuses: ProductionOverviewStatus[] = [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
];

export const todayIso = (): string => new Date().toISOString().slice(0, 10);

export const defaultDateFrom = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 4);
  date.setDate(1);
  return date.toISOString().slice(0, 10);
};

export const formatNumber = (value: number | null | undefined): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value ?? 0);

export const formatQuantity = (value: number | null | undefined): string =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value ?? 0);

export const formatPercent = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? 'N/A'
    : `${new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }).format(value)}%`;

export const compactQuantity = (value: number | null | undefined): string =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value ?? 0);

export const statusLabel = (status: string): string =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const statusClassName = (status: string): string =>
  status.toLowerCase().replace(/_/g, '-');

export const statusColor = (status: ProductionOverviewStatus): string => {
  if (status === 'scheduled') return PRODUCTION_OVERVIEW_COLORS.scheduled;
  if (status === 'in_progress') return PRODUCTION_OVERVIEW_COLORS.inProgress;
  if (status === 'completed') return PRODUCTION_OVERVIEW_COLORS.completed;
  return PRODUCTION_OVERVIEW_COLORS.cancelled;
};

export const statusTotal = (counts?: ProductionOverviewStatusCounts | null): number =>
  productionStatuses.reduce((sum, status) => sum + (counts?.[status] ?? 0), 0);

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatPeriodLabel = (value: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
  }).format(date);
};

export const minutesLabel = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  if (Math.abs(value) >= 60) {
    const hours = value / 60;
    return `${new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1,
    }).format(hours)}h`;
  }
  return `${formatNumber(value)}m`;
};
