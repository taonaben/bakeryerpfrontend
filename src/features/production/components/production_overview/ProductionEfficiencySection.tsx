import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Gauge } from 'lucide-react';
import type {
  ProductionOverviewSummary,
  ProductionOverviewYieldTrends,
} from '../../types/productionOverviewModels';
import {
  compactQuantity,
  formatPeriodLabel,
  formatPercent,
  formatQuantity,
  PRODUCTION_OVERVIEW_COLORS,
} from './productionOverviewUtils';

interface ProductionEfficiencySectionProps {
  summary: ProductionOverviewSummary | null;
  trends: ProductionOverviewYieldTrends | null;
  isLoading: boolean;
  isLoadingSummary: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}

const ChartTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="production-overview-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <span key={`${item.name}-${item.value}`} style={{ color: item.color }}>
          {item.name}: {formatQuantity(item.value)}
        </span>
      ))}
    </div>
  );
};

const ProductionEfficiencySection: React.FC<ProductionEfficiencySectionProps> = ({
  summary,
  trends,
  isLoading,
  isLoadingSummary,
}) => {
  const outputData =
    trends?.output.map((point) => ({
      period: formatPeriodLabel(point.period),
      expected: point.expected_output,
      actual: point.actual_output,
      variance: point.variance,
      completed: point.completed_orders,
    })) ?? [];

  const wasteData =
    trends?.waste.map((point) => ({
      period: formatPeriodLabel(point.period),
      quantity: point.quantity,
      lines: point.line_count,
    })) ?? [];

  const varianceRows = useMemo(
    () =>
      [...(trends?.variance_by_product ?? [])].sort(
        (a, b) => Math.abs(b.variance) - Math.abs(a.variance),
      ),
    [trends?.variance_by_product],
  );

  return (
    <section className="production-overview-section">
      <div className="production-overview-section__head">
        <div>
          <h2>Efficiency</h2>
          <p>Expected output, actual output, waste, and variance over time.</p>
        </div>
      </div>

      <div className="production-overview-efficiency-grid">
        <article className="production-overview-panel production-overview-chart production-overview-chart--large">
          <div className="production-overview-card-title">
            <h3>Expected vs Actual Trend</h3>
            <span>{outputData.length} periods</span>
          </div>
          {isLoading ? (
            <div className="production-overview-chart-skeleton" />
          ) : outputData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={outputData} margin={{ top: 16, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fill: '#526987', fontSize: 12 }} />
                <YAxis tick={{ fill: '#526987', fontSize: 12 }} tickFormatter={compactQuantity} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="expected"
                  name="Expected"
                  stroke={PRODUCTION_OVERVIEW_COLORS.slate}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual"
                  stroke={PRODUCTION_OVERVIEW_COLORS.completed}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="production-overview-empty">No output trend data found.</div>
          )}
        </article>

        <div className="production-overview-metric-pair">
          <article className="production-overview-panel production-overview-attention-card">
            <div className="production-overview-attention-card__head">
              <Gauge size={18} />
              <h3>Waste</h3>
            </div>
            {isLoadingSummary ? (
              <div className="production-overview-attention-skeleton" />
            ) : (
              <>
                <strong>{formatPercent(summary?.waste.waste_rate)}</strong>
                <span>{formatQuantity(summary?.waste.quantity)} units wasted</span>
              </>
            )}
          </article>
          <article className="production-overview-panel production-overview-attention-card production-overview-attention-card--warning">
            <div className="production-overview-attention-card__head">
              <AlertTriangle size={18} />
              <h3>Variance</h3>
            </div>
            {isLoadingSummary ? (
              <div className="production-overview-attention-skeleton" />
            ) : (
              <>
                <strong>{formatPercent(summary?.variance.variance_rate)}</strong>
                <span>{formatQuantity(summary?.variance.quantity)} units variance</span>
              </>
            )}
          </article>
        </div>

        <article className="production-overview-panel production-overview-chart">
          <div className="production-overview-card-title">
            <h3>Waste by Period</h3>
            <span>{wasteData.length} periods</span>
          </div>
          {isLoading ? (
            <div className="production-overview-chart-skeleton" />
          ) : wasteData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={wasteData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fill: '#526987', fontSize: 12 }} />
                <YAxis tick={{ fill: '#526987', fontSize: 12 }} tickFormatter={compactQuantity} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar
                  dataKey="quantity"
                  name="Waste"
                  fill={PRODUCTION_OVERVIEW_COLORS.danger}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="production-overview-empty">No waste trend data found.</div>
          )}
        </article>

        <article className="production-overview-panel production-overview-table-card">
          <div className="production-overview-card-title">
            <h3>Variance by Product</h3>
            <span>{varianceRows.length}</span>
          </div>
          <div className="production-overview-table-wrap">
            <table className="production-overview-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Expected</th>
                  <th>Actual</th>
                  <th>Variance</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5}>
                      <span className="production-overview-skeleton production-overview-skeleton--row" />
                    </td>
                  </tr>
                ) : varianceRows.length ? (
                  varianceRows.slice(0, 8).map((row) => (
                    <tr key={row.product_id}>
                      <td>
                        <strong>{row.product_name}</strong>
                      </td>
                      <td>{formatQuantity(row.expected_output)}</td>
                      <td>{formatQuantity(row.actual_output)}</td>
                      <td>{formatQuantity(row.variance)}</td>
                      <td>{row.completed_orders}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="production-overview-empty-cell" colSpan={5}>
                      No product variance found.
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

export default ProductionEfficiencySection;
