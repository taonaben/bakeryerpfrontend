import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import type {
  InventoryOverviewMovementTrends,
  InventoryOverviewSummary,
} from '../../types/inventoryOverview';
import {
  compactQuantity,
  formatPeriodLabel,
  INVENTORY_CHART_COLORS,
  quantityFormat,
} from './inventoryOverviewUtils';

interface InventoryMovementAnalyticsProps {
  trends: InventoryOverviewMovementTrends | null;
  summary: InventoryOverviewSummary | null;
  isLoading: boolean;
  isLoadingSummary: boolean;
}

interface MovementFlowPoint {
  period: string;
  inbound: number;
  outbound: number;
}

interface ExceptionMovementPoint {
  period: string;
  adjustments: number;
  returns: number;
}

const InventoryMovementAnalytics: React.FC<InventoryMovementAnalyticsProps> = ({
  trends,
  summary,
  isLoading,
  isLoadingSummary,
}) => {
  const navigate = useNavigate();

  const flowData = useMemo<MovementFlowPoint[]>(() => {
    const byPeriod = new Map<string, MovementFlowPoint>();

    trends?.inbound.forEach((point) => {
      byPeriod.set(point.period, {
        period: point.period,
        inbound: point.total_quantity,
        outbound: byPeriod.get(point.period)?.outbound || 0,
      });
    });

    trends?.outbound.forEach((point) => {
      byPeriod.set(point.period, {
        period: point.period,
        inbound: byPeriod.get(point.period)?.inbound || 0,
        outbound: point.total_quantity,
      });
    });

    return Array.from(byPeriod.values()).sort((a, b) => a.period.localeCompare(b.period));
  }, [trends]);

  const exceptionData = useMemo<ExceptionMovementPoint[]>(() => {
    const byPeriod = new Map<string, ExceptionMovementPoint>();

    trends?.adjustments.forEach((point) => {
      byPeriod.set(point.period, {
        period: point.period,
        adjustments: point.total_quantity,
        returns: byPeriod.get(point.period)?.returns || 0,
      });
    });

    trends?.returns.forEach((point) => {
      byPeriod.set(point.period, {
        period: point.period,
        adjustments: byPeriod.get(point.period)?.adjustments || 0,
        returns: point.total_quantity,
      });
    });

    return Array.from(byPeriod.values()).sort((a, b) => a.period.localeCompare(b.period));
  }, [trends]);

  return (
    <section className="inventory-overview-section">
      <div className="inventory-overview-section__head">
        <div>
          <h2>Movement Analytics</h2>
          <p>Stock flow is secondary context after low-stock, expiry, and alert work.</p>
        </div>
      </div>

      <div className="inventory-overview-trends-grid">
        <ChartPanel title="Inbound vs Outbound Quantity" size="large" isLoading={isLoading}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={flowData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickFormatter={formatPeriodLabel} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compactQuantity} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={46} />
              <Tooltip content={<GroupedQuantityTooltip />} />
              <Line
                type="monotone"
                dataKey="inbound"
                name="Inbound"
                stroke={INVENTORY_CHART_COLORS.green}
                strokeWidth={2.5}
                dot={{ r: 3, fill: INVENTORY_CHART_COLORS.green, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="outbound"
                name="Outbound"
                stroke={INVENTORY_CHART_COLORS.red}
                strokeWidth={2.5}
                dot={{ r: 3, fill: INVENTORY_CHART_COLORS.red, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {!isLoading && (
            <div className="inventory-overview-legend">
              <span><i style={{ background: INVENTORY_CHART_COLORS.green }} />Inbound</span>
              <span><i style={{ background: INVENTORY_CHART_COLORS.red }} />Outbound</span>
            </div>
          )}
        </ChartPanel>
      </div>

      <div className="inventory-overview-analytics-pair">
        <ChartPanel title="Adjustments and Returns" isLoading={isLoading}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={exceptionData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }} barGap={5}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickFormatter={formatPeriodLabel} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compactQuantity} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={46} />
              <Tooltip content={<GroupedQuantityTooltip />} />
              <Bar dataKey="adjustments" name="Adjustments" fill={INVENTORY_CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
              <Bar dataKey="returns" name="Returns" fill={INVENTORY_CHART_COLORS.blueMuted} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {!isLoading && (
            <div className="inventory-overview-legend">
              <span><i style={{ background: INVENTORY_CHART_COLORS.amber }} />Adjustments</span>
              <span><i style={{ background: INVENTORY_CHART_COLORS.blueMuted }} />Returns</span>
            </div>
          )}
        </ChartPanel>

        <article className="inventory-overview-panel inventory-overview-table-card inventory-overview-table-card--setup">
          <div className="inventory-overview-card-title">
            <h3>Products Missing Reorder Policy</h3>
            <span>{summary?.products_without_active_reorder_policy.count || 0}</span>
          </div>
          <div className="inventory-overview-table-wrap inventory-overview-table-wrap--compact">
            <table className="inventory-overview-table inventory-overview-table--compact">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingSummary ? (
                  <SkeletonRows columns={4} rows={5} />
                ) : summary?.products_without_active_reorder_policy.products.length ? (
                  summary.products_without_active_reorder_policy.products.map((product) => (
                    <tr
                      key={product.id}
                      className="inventory-overview-clickable-row"
                      onClick={() => navigate(`/inventory/products/${product.id}`)}
                    >
                      <td data-label="Product" title={product.name}>
                        <Link
                          to={`/inventory/products/${product.id}`}
                          className="inventory-overview-link"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td data-label="SKU" title={product.sku || '-'}>
                        {product.sku || '-'}
                      </td>
                      <td data-label="Category" title={product.category || '-'}>
                        {product.category || '-'}
                      </td>
                      <td data-label="Unit" title={product.unit_of_measure || '-'}>
                        {product.unit_of_measure || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="inventory-overview-empty-cell">
                      All active products have reorder policies.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
};

const ChartPanel: React.FC<{
  title: string;
  children: React.ReactNode;
  size?: 'normal' | 'large';
  isLoading: boolean;
}> = ({ title, children, size = 'normal', isLoading }) => (
  <article className={`inventory-overview-panel inventory-overview-chart inventory-overview-chart--${size}`}>
    <h3>{title}</h3>
    {isLoading ? <ChartSkeleton /> : children}
  </article>
);

const ChartSkeleton: React.FC = () => (
  <div className="inventory-overview-chart-skeleton" aria-label="Loading chart">
    <span className="inventory-skeleton inventory-skeleton--chart-line inventory-skeleton--chart-line-1" />
    <span className="inventory-skeleton inventory-skeleton--chart-line inventory-skeleton--chart-line-2" />
    <span className="inventory-skeleton inventory-skeleton--chart-line inventory-skeleton--chart-line-3" />
    <span className="inventory-skeleton inventory-skeleton--chart-bar inventory-skeleton--chart-bar-1" />
    <span className="inventory-skeleton inventory-skeleton--chart-bar inventory-skeleton--chart-bar-2" />
    <span className="inventory-skeleton inventory-skeleton--chart-bar inventory-skeleton--chart-bar-3" />
    <span className="inventory-skeleton inventory-skeleton--chart-bar inventory-skeleton--chart-bar-4" />
  </div>
);

const SkeletonRows: React.FC<{ columns: number; rows: number }> = ({ columns, rows }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        <td colSpan={columns}>
          <span className="inventory-skeleton inventory-skeleton--row" />
        </td>
      </tr>
    ))}
  </>
);

const GroupedQuantityTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="inventory-overview-tooltip">
      <strong>{formatPeriodLabel(label)}</strong>
      {payload.map((item: any) => (
        <span key={item.dataKey}>{item.name}: {quantityFormat(item.value || 0)}</span>
      ))}
    </div>
  );
};

export default InventoryMovementAnalytics;
