import React from 'react';
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
import type {
  ProductionOverviewStatusCounts,
  ProductionOverviewSummary,
} from '../../types/productionOverviewModels';
import {
  compactQuantity,
  formatQuantity,
  PRODUCTION_OVERVIEW_COLORS,
  productionStatuses,
  statusClassName,
  statusColor,
  statusLabel,
  statusTotal,
} from './productionOverviewUtils';

interface ProductionStatusSectionProps {
  summary: ProductionOverviewSummary | null;
  isLoading: boolean;
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

const StatusBreakdown: React.FC<{
  title: string;
  counts?: ProductionOverviewStatusCounts | null;
  isLoading: boolean;
}> = ({ title, counts, isLoading }) => {
  const total = statusTotal(counts);

  return (
    <article className="production-overview-panel production-overview-status-card">
      <div className="production-overview-card-title">
        <h3>{title}</h3>
        <span>{total}</span>
      </div>
      {isLoading ? (
        <div className="production-overview-status-skeleton" />
      ) : (
        <>
          <div className="production-overview-segmented" aria-label={title}>
            {productionStatuses.map((status) => {
              const count = counts?.[status] ?? 0;
              const width = total > 0 ? (count / total) * 100 : 0;
              return (
                <span
                  key={status}
                  className={`production-overview-segment production-overview-segment--${statusClassName(
                    status,
                  )} ${count === 0 ? 'production-overview-segment--empty' : ''}`}
                  style={{ width: `${Math.max(width, count > 0 ? 3 : 0)}%` }}
                  title={`${statusLabel(status)}: ${count}`}
                />
              );
            })}
          </div>
          <div className="production-overview-status-list">
            {productionStatuses.map((status) => (
              <div key={status} className="production-overview-status-item">
                <span
                  className={`production-overview-status-dot production-overview-status-dot--${statusClassName(
                    status,
                  )}`}
                />
                <span>{statusLabel(status)}</span>
                <strong>{counts?.[status] ?? 0}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </article>
  );
};

const ProductionStatusSection: React.FC<ProductionStatusSectionProps> = ({
  summary,
  isLoading,
}) => {
  const outputData = [
    {
      label: 'Output',
      expected: summary?.expected_vs_actual_output.expected_output ?? 0,
      actual: summary?.expected_vs_actual_output.actual_output ?? 0,
    },
  ];

  const productData =
    summary?.top_products_produced.map((product) => ({
      name: product.product_name,
      quantity: product.total_quantity,
      batches: product.batch_count,
    })) ?? [];

  return (
    <section className="production-overview-section">
      <div className="production-overview-section__head">
        <div>
          <h2>Production Status</h2>
          <p>Order state, output comparison, and top finished products.</p>
        </div>
      </div>

      <div className="production-overview-status-grid">
        <StatusBreakdown
          title="Production Orders"
          counts={summary?.production_order_counts_by_status}
          isLoading={isLoading}
        />
        <StatusBreakdown
          title="Rework Orders"
          counts={summary?.rework_order_counts_by_status}
          isLoading={isLoading}
        />
        <article className="production-overview-panel production-overview-chart production-overview-chart--output">
          <div className="production-overview-card-title">
            <h3>Expected vs Actual Output</h3>
            <span>{compactQuantity(summary?.expected_vs_actual_output.actual_output)}</span>
          </div>
          {isLoading ? (
            <div className="production-overview-chart-skeleton" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={outputData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fill: '#526987', fontSize: 12 }} />
                <YAxis tick={{ fill: '#526987', fontSize: 12 }} tickFormatter={compactQuantity} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="expected" name="Expected" fill={PRODUCTION_OVERVIEW_COLORS.slate} radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill={PRODUCTION_OVERVIEW_COLORS.completed} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>
        <article className="production-overview-panel production-overview-chart production-overview-chart--top-products">
          <div className="production-overview-card-title">
            <h3>Top Products Produced</h3>
            <span>{productData.length}</span>
          </div>
          {isLoading ? (
            <div className="production-overview-chart-skeleton" />
          ) : productData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                layout="vertical"
                data={productData.slice(0, 6)}
                margin={{ top: 8, right: 12, left: 16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: '#526987', fontSize: 12 }} tickFormatter={compactQuantity} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fill: '#334155', fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="quantity" name="Quantity" radius={[0, 6, 6, 0]}>
                  {productData.slice(0, 6).map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={
                        index === 0
                          ? PRODUCTION_OVERVIEW_COLORS.teal
                          : statusColor(productionStatuses[index % productionStatuses.length])
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="production-overview-empty">No produced products found.</div>
          )}
        </article>
      </div>
    </section>
  );
};

export default ProductionStatusSection;
