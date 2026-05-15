import React from 'react';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { InventoryOverviewSummary, InventoryStockStatus } from '../../types/inventoryOverview';
import {
  countTotal,
  INVENTORY_CHART_COLORS,
  numberFormat,
  quantityFormat,
  STOCK_STATUS_COLORS,
  STOCK_STATUS_LABELS,
  statusClassName,
} from './inventoryOverviewUtils';

interface InventoryHealthSectionProps {
  summary: InventoryOverviewSummary | null;
  isLoading: boolean;
}

const statusOrder: InventoryStockStatus[] = ['EMPTY', 'ALMOST_OUT', 'GOOD', 'FULL'];

const InventoryHealthSection: React.FC<InventoryHealthSectionProps> = ({
  summary,
  isLoading,
}) => {
  const statusCounts = summary?.stock_status_counts || {
    EMPTY: 0,
    ALMOST_OUT: 0,
    GOOD: 0,
    FULL: 0,
  };
  const statusTotal = countTotal(statusCounts);
  const statusData = statusOrder.map((status) => ({
    status,
    label: STOCK_STATUS_LABELS[status],
    value: statusCounts[status],
    color: STOCK_STATUS_COLORS[status],
  }));

  const alertData = [
    {
      type: 'LOW_STOCK',
      label: 'Low stock',
      value: summary?.open_alert_counts_by_type.LOW_STOCK || 0,
      color: INVENTORY_CHART_COLORS.amber,
    },
    {
      type: 'OUT_OF_STOCK',
      label: 'Out of stock',
      value: summary?.open_alert_counts_by_type.OUT_OF_STOCK || 0,
      color: INVENTORY_CHART_COLORS.red,
    },
    {
      type: 'EXPIRY',
      label: 'Expiry',
      value: summary?.open_alert_counts_by_type.EXPIRY || 0,
      color: INVENTORY_CHART_COLORS.orange,
    },
  ];

  return (
    <section className="inventory-overview-section">
      <div className="inventory-overview-section__head">
        <div>
          <h2>Inventory Health</h2>
          <p>Stock position, open alerts, and expiry risk by urgency.</p>
        </div>
      </div>

      <div className="inventory-overview-health-grid">
        <article className="inventory-overview-panel inventory-overview-status-card">
          <div className="inventory-overview-card-title">
            <h3>Stock Status</h3>
            <span>{numberFormat(statusTotal)}</span>
          </div>

          {isLoading ? (
            <StatusSkeleton />
          ) : (
            <>
              <div className="inventory-overview-segmented" aria-label="Stock status split">
                {statusTotal === 0 ? (
                  <span className="inventory-overview-segment inventory-overview-segment--none" />
                ) : (
                  statusData
                    .filter((item) => item.value > 0)
                    .map((item) => (
                      <span
                        key={item.status}
                        className={`inventory-overview-segment inventory-overview-segment--${statusClassName(item.status)}`}
                        style={{ width: `${Math.max((item.value / statusTotal) * 100, 4)}%` }}
                        title={`${item.label}: ${item.value}`}
                      />
                    ))
                )}
              </div>

              <div className="inventory-overview-status-list">
                {statusData.map((item) => (
                  <div key={item.status} className="inventory-overview-status-item">
                    <span
                      className={`inventory-overview-status-dot inventory-overview-status-dot--${statusClassName(item.status)}`}
                    />
                    <span>{item.label}</span>
                    <strong>{numberFormat(item.value)}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>

        <article className="inventory-overview-panel inventory-overview-chart">
          <h3>Open Alerts</h3>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={alertData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CountTooltip labelPrefix="Alerts" />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {alertData.map((item) => (
                    <Cell key={item.type} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        <article className="inventory-overview-panel inventory-overview-expiry-card inventory-overview-expiry-card--expired">
          <div className="inventory-overview-attention-card__head">
            <AlertTriangle size={18} />
            <h3>Expired Stock</h3>
          </div>
          {isLoading ? (
            <MetricSkeleton />
          ) : (
            <>
              <strong>{numberFormat(summary?.expired_batches_with_quantity.count || 0)}</strong>
              <span>{quantityFormat(summary?.expired_batches_with_quantity.quantity || 0)} units expired</span>
            </>
          )}
        </article>

        <article className="inventory-overview-panel inventory-overview-expiry-card">
          <div className="inventory-overview-attention-card__head">
            <Clock size={18} />
            <h3>Expiry Buckets</h3>
          </div>
          {isLoading ? (
            <ListSkeleton />
          ) : (
            <dl>
              <Metric label="Within 7 days" value={summary?.batches_expiring.within_7_days.count || 0} helper={`${quantityFormat(summary?.batches_expiring.within_7_days.quantity || 0)} units`} />
              <Metric label="Within 14 days" value={summary?.batches_expiring.within_14_days.count || 0} helper={`${quantityFormat(summary?.batches_expiring.within_14_days.quantity || 0)} units`} />
              <Metric label="Within 30 days" value={summary?.batches_expiring.within_30_days.count || 0} helper={`${quantityFormat(summary?.batches_expiring.within_30_days.quantity || 0)} units`} />
            </dl>
          )}
        </article>

        <article className="inventory-overview-panel inventory-overview-expiry-card">
          <div className="inventory-overview-attention-card__head">
            <ShieldAlert size={18} />
            <h3>Alert Severity</h3>
          </div>
          {isLoading ? (
            <ListSkeleton />
          ) : (
            <dl>
              <Metric label="Out of stock" value={summary?.open_alert_counts_by_type.OUT_OF_STOCK || 0} />
              <Metric label="Expiry" value={summary?.open_alert_counts_by_type.EXPIRY || 0} />
              <Metric label="Low stock" value={summary?.open_alert_counts_by_type.LOW_STOCK || 0} />
            </dl>
          )}
        </article>
      </div>
    </section>
  );
};

const Metric: React.FC<{ label: string; value: number; helper?: string }> = ({
  label,
  value,
  helper,
}) => (
  <div>
    <dt>
      {label}
      {helper && <small>{helper}</small>}
    </dt>
    <dd>{numberFormat(value)}</dd>
  </div>
);

const CountTooltip: React.FC<any> = ({ active, payload, label, labelPrefix }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="inventory-overview-tooltip">
      <strong>{label}</strong>
      <span>{labelPrefix}: {payload[0].value || 0}</span>
    </div>
  );
};

const StatusSkeleton: React.FC = () => (
  <div className="inventory-overview-status-skeleton" aria-label="Loading status breakdown">
    <span className="inventory-skeleton inventory-skeleton--bar" />
    <span className="inventory-skeleton inventory-skeleton--line" />
    <span className="inventory-skeleton inventory-skeleton--line inventory-skeleton--short" />
    <span className="inventory-skeleton inventory-skeleton--line" />
  </div>
);

const MetricSkeleton: React.FC = () => (
  <div className="inventory-overview-attention-skeleton" aria-label="Loading">
    <span className="inventory-skeleton inventory-skeleton--value" />
    <span className="inventory-skeleton inventory-skeleton--text" />
  </div>
);

const ListSkeleton: React.FC = () => (
  <div className="inventory-overview-attention-skeleton" aria-label="Loading">
    <span className="inventory-skeleton inventory-skeleton--line" />
    <span className="inventory-skeleton inventory-skeleton--line inventory-skeleton--short" />
    <span className="inventory-skeleton inventory-skeleton--line" />
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="inventory-overview-chart-skeleton" aria-label="Loading chart">
    <span className="inventory-skeleton inventory-skeleton--chart-bar inventory-skeleton--chart-bar-1" />
    <span className="inventory-skeleton inventory-skeleton--chart-bar inventory-skeleton--chart-bar-2" />
    <span className="inventory-skeleton inventory-skeleton--chart-bar inventory-skeleton--chart-bar-3" />
    <span className="inventory-skeleton inventory-skeleton--chart-bar inventory-skeleton--chart-bar-4" />
  </div>
);

export default InventoryHealthSection;
