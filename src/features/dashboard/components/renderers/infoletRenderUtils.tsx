import React from 'react';
import { ResponsiveContainer } from 'recharts';
import type { DashboardWidgetWidth } from '../../types/dashboardTypes';

export type InfoletTone = 'good' | 'warning' | 'danger' | 'neutral' | 'info';

export interface DashboardChartPoint {
  [key: string]: string | number;
}

export const STATUS_COLORS: Record<string, string> = {
  scheduled: '#2563eb',
  in_progress: '#0f766e',
  completed: '#16a34a',
  cancelled: '#dc2626',
  EMPTY: '#dc2626',
  ALMOST_OUT: '#f59e0b',
  GOOD: '#16a34a',
  FULL: '#2563eb',
  LOW_STOCK: '#f59e0b',
  OUT_OF_STOCK: '#dc2626',
  EXPIRY: '#7c3aed',
  IN: '#16a34a',
  OUT: '#dc2626',
  ADJUSTMENT: '#2563eb',
  RETURN: '#7c3aed',
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export const optionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
};

export const formatNumber = (value: unknown, maximumFractionDigits = 2): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(toNumber(value));

export const formatPercent = (value: unknown): string => {
  const parsed = optionalNumber(value);
  if (parsed === null) return 'N/A';
  const normalized = Math.abs(parsed) <= 1 ? parsed * 100 : parsed;
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(normalized)}%`;
};

export const formatLabel = (value: string): string =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const readString = (
  row: Record<string, unknown>,
  keys: string[],
  fallback = 'Unknown',
): string => {
  const value = keys
    .map((key) => row[key])
    .find((entry) => entry !== undefined && entry !== null && entry !== '');
  return value === undefined ? fallback : String(value);
};

export const getRowLimit = (width: DashboardWidgetWidth, compact = 4): number =>
  width === 'full' ? compact + 3 : compact;

export const EmptyInfolet = ({ message = 'No records to show.' }: { message?: string }) => (
  <div className="dashboard-infolet-empty dashboard-infolet-empty--compact">{message}</div>
);

export const MetricHero: React.FC<{
  value: string;
  label: string;
  tone?: InfoletTone;
  icon?: React.ReactNode;
  secondary?: string;
}> = ({ value, label, tone = 'neutral', icon, secondary }) => (
  <div className={`dashboard-module-renderer dashboard-module-renderer--metric dashboard-metric--${tone}`}>
    <div className="dashboard-metric-hero">
      <span className="dashboard-metric-hero__icon">{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
    {secondary && <p className="dashboard-metric-hero__secondary">{secondary}</p>}
  </div>
);

export const StatTiles: React.FC<{
  items: Array<{ label: string; value: string; tone?: InfoletTone; icon?: React.ReactNode }>;
}> = ({ items }) => (
  <div className="dashboard-infolet-stat-grid">
    {items.map((item) => (
      <div
        key={item.label}
        className={`dashboard-infolet-stat dashboard-infolet-stat--${item.tone || 'neutral'}`}
      >
        <span>{item.icon}</span>
        <strong>{item.value}</strong>
        <small>{item.label}</small>
      </div>
    ))}
  </div>
);

export const StatusBars: React.FC<{
  data: Record<string, unknown>;
  order?: string[];
}> = ({ data, order }) => {
  const keys = order?.filter((key) => key in data) || Object.keys(data);
  const rows = keys.map((key) => ({
    key,
    label: formatLabel(key),
    value: toNumber(data[key]),
    color: STATUS_COLORS[key] || '#566d7e',
  }));
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  if (rows.length === 0 || total <= 0) return <EmptyInfolet />;

  return (
    <div className="dashboard-status-bars">
      {rows.map((row) => (
        <div key={row.key} className="dashboard-status-row">
          <div className="dashboard-status-row__label">
            <span style={{ background: row.color }} />
            <strong>{row.label}</strong>
            <em>{formatNumber(row.value, 0)}</em>
          </div>
          <div className="dashboard-status-row__track">
            <i
              style={{
                width: `${Math.max(4, (row.value / total) * 100)}%`,
                background: row.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SimpleTable: React.FC<{
  rows: Record<string, unknown>[];
  width: DashboardWidgetWidth;
  columns: Array<{
    key: string;
    label: string;
    render: (row: Record<string, unknown>) => React.ReactNode;
    align?: 'left' | 'right';
  }>;
  emptyMessage?: string;
}> = ({ rows, width, columns, emptyMessage }) => {
  const visibleRows = rows.slice(0, getRowLimit(width, 4));

  if (visibleRows.length === 0) return <EmptyInfolet message={emptyMessage} />;

  return (
    <div className="dashboard-infolet-table-wrap dashboard-infolet-table-wrap--fixed">
      <table className="dashboard-infolet-table dashboard-infolet-table--compact">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.align === 'right' ? 'is-right' : undefined}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, rowIndex) => (
            <tr key={String(row.id ?? row.product_id ?? row.order_id ?? row.period ?? rowIndex)}>
              {columns.map((column) => (
                <td key={column.key} className={column.align === 'right' ? 'is-right' : undefined}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > visibleRows.length && (
        <div className="dashboard-infolet-more">Showing {visibleRows.length} of {rows.length}</div>
      )}
    </div>
  );
};

export const ProgressMetric: React.FC<{
  value: number | null;
  label: string;
  tone?: InfoletTone;
}> = ({ value, label, tone = 'info' }) => {
  const percent = value === null
    ? 0
    : Math.max(0, Math.min(100, Math.abs(value) <= 1 ? value * 100 : value));
  return (
    <div className={`dashboard-progress-metric dashboard-progress-metric--${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value === null ? 'N/A' : formatPercent(value)}</strong>
      </div>
      <div className="dashboard-progress-metric__track">
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export const ChartFrame: React.FC<{
  children: React.ReactNode;
  size?: 'small' | 'medium';
}> = ({ children, size = 'medium' }) => (
  <div className={`dashboard-infolet-chart dashboard-infolet-chart--${size}`}>
    <ResponsiveContainer width="100%" height="100%">
      {children as React.ReactElement}
    </ResponsiveContainer>
  </div>
);
