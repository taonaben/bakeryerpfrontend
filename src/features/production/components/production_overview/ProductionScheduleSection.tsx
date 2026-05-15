import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Clock, TimerReset } from 'lucide-react';
import type { ProductionOverviewScheduleAdherence } from '../../types/productionOverviewModels';
import {
  compactQuantity,
  formatDateTime,
  formatPercent,
  minutesLabel,
  PRODUCTION_OVERVIEW_COLORS,
} from './productionOverviewUtils';

interface ProductionScheduleSectionProps {
  schedule: ProductionOverviewScheduleAdherence | null;
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
          {item.name}: {minutesLabel(item.value)}
        </span>
      ))}
    </div>
  );
};

const ProductionScheduleSection: React.FC<ProductionScheduleSectionProps> = ({
  schedule,
  isLoading,
}) => {
  const navigate = useNavigate();
  const rows = schedule?.orders ?? [];
  const delayData = rows.slice(0, 8).map((order) => ({
    product: order.product_name,
    startDelay: order.start_delay_minutes ?? 0,
    finishDelay: order.finish_delay_minutes ?? 0,
  }));

  return (
    <section className="production-overview-section">
      <div className="production-overview-section__head">
        <div>
          <h2>Schedule Adherence</h2>
          <p>Start and finish timing against the production schedule.</p>
        </div>
      </div>

      <div className="production-overview-schedule-grid">
        <article className="production-overview-panel production-overview-rate-card">
          <div className="production-overview-attention-card__head">
            <Clock size={18} />
            <h3>On-time start</h3>
          </div>
          {isLoading ? (
            <div className="production-overview-attention-skeleton" />
          ) : (
            <>
              <strong>{formatPercent(schedule?.on_time_start_rate)}</strong>
              <span>Orders started on schedule</span>
            </>
          )}
        </article>

        <article className="production-overview-panel production-overview-rate-card">
          <div className="production-overview-attention-card__head">
            <TimerReset size={18} />
            <h3>On-time finish</h3>
          </div>
          {isLoading ? (
            <div className="production-overview-attention-skeleton" />
          ) : (
            <>
              <strong>{formatPercent(schedule?.on_time_finish_rate)}</strong>
              <span>Orders finished on schedule</span>
            </>
          )}
        </article>

        <article className="production-overview-panel production-overview-chart production-overview-chart--delay">
          <div className="production-overview-card-title">
            <h3>Delay Minutes by Order</h3>
            <span>{delayData.length}</span>
          </div>
          {isLoading ? (
            <div className="production-overview-chart-skeleton" />
          ) : delayData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={delayData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="product" tick={{ fill: '#526987', fontSize: 12 }} />
                <YAxis tick={{ fill: '#526987', fontSize: 12 }} tickFormatter={compactQuantity} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar
                  dataKey="startDelay"
                  name="Start delay"
                  fill={PRODUCTION_OVERVIEW_COLORS.scheduled}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="finishDelay"
                  name="Finish delay"
                  fill={PRODUCTION_OVERVIEW_COLORS.danger}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="production-overview-empty">No schedule delay data found.</div>
          )}
        </article>

        <article className="production-overview-panel production-overview-table-card production-overview-table-card--wide">
          <div className="production-overview-card-title">
            <h3>Start / Finish Timing</h3>
            <span>{rows.length}</span>
          </div>
          <div className="production-overview-table-wrap">
            <table className="production-overview-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Scheduled</th>
                  <th>Actual</th>
                  <th>Start delay</th>
                  <th>Finish delay</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <span className="production-overview-skeleton production-overview-skeleton--row" />
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((order) => (
                    <tr
                      key={order.order_id}
                      onClick={() => navigate(`/production/orders/${order.order_id}`)}
                    >
                      <td>
                        <strong>{order.product_name}</strong>
                        <small>{order.order_id}</small>
                      </td>
                      <td>{order.warehouse_name}</td>
                      <td>
                        <span>{formatDateTime(order.scheduled_start)}</span>
                        <small>{formatDateTime(order.scheduled_end)}</small>
                      </td>
                      <td>
                        <span>{formatDateTime(order.first_batch_started_at)}</span>
                        <small>{formatDateTime(order.last_batch_completed_at)}</small>
                      </td>
                      <td>{minutesLabel(order.start_delay_minutes)}</td>
                      <td>{minutesLabel(order.finish_delay_minutes)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="production-overview-empty-cell" colSpan={6}>
                      No schedule adherence records found.
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

export default ProductionScheduleSection;
