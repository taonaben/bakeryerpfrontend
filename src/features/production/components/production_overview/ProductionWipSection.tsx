import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Ban, CalendarClock, Factory, PackageOpen } from 'lucide-react';
import type {
  ProductionBlockedWipOrder,
  ProductionOverviewWip,
  ProductionWipBatch,
  ProductionWipOrder,
} from '../../types/productionOverviewModels';
import { formatDateTime, formatQuantity, statusClassName, statusLabel } from './productionOverviewUtils';

interface ProductionWipSectionProps {
  wip: ProductionOverviewWip | null;
  isLoading: boolean;
}

type OrderTableVariant = 'default' | 'warning' | 'danger';

const EmptyRow: React.FC<{ colSpan: number; message: string }> = ({ colSpan, message }) => (
  <tr>
    <td className="production-overview-empty-cell" colSpan={colSpan}>
      {message}
    </td>
  </tr>
);

const LoadingRows: React.FC<{ colSpan: number; rows?: number }> = ({ colSpan, rows = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <tr key={index}>
        <td colSpan={colSpan}>
          <span className="production-overview-skeleton production-overview-skeleton--row" />
        </td>
      </tr>
    ))}
  </>
);

const FormulaLink: React.FC<{ id?: string; name?: string | null }> = ({ id, name }) => {
  if (!id) return <span className="production-overview-muted">No formula</span>;
  return (
    <Link
      to={`/formulation/${id}`}
      className="production-overview-link"
      onClick={(event) => event.stopPropagation()}
    >
      {name || 'Formula'}
    </Link>
  );
};

const OrderTable: React.FC<{
  title: string;
  icon: React.ReactNode;
  rows: ProductionWipOrder[] | ProductionBlockedWipOrder[];
  isLoading: boolean;
  emptyMessage: string;
  variant?: OrderTableVariant;
  showReasons?: boolean;
}> = ({ title, icon, rows, isLoading, emptyMessage, variant = 'default', showReasons }) => {
  const navigate = useNavigate();

  return (
    <article
      className={`production-overview-panel production-overview-table-card production-overview-table-card--${variant}`}
    >
      <div className="production-overview-card-title">
        <h3>
          {icon}
          {title}
        </h3>
        <span>{rows.length}</span>
      </div>
      <div className="production-overview-table-wrap">
        <table className="production-overview-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Schedule</th>
              <th>Formula</th>
              {showReasons && <th>Blocking reasons</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingRows colSpan={showReasons ? 7 : 6} />
            ) : rows.length ? (
              rows.map((order) => (
                <tr
                  key={order.order_id}
                  className={variant !== 'default' ? 'is-attention' : undefined}
                  onClick={() => navigate(`/production/orders/${order.order_id}`)}
                >
                  <td>
                    <strong>{order.product_name}</strong>
                    <small>{order.order_id}</small>
                  </td>
                  <td>{order.warehouse_name}</td>
                  <td>{formatQuantity(order.quantity)}</td>
                  <td>
                    <span
                      className={`production-overview-status-badge production-overview-status-badge--${statusClassName(
                        order.status,
                      )}`}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <span>{formatDateTime(order.scheduled_start)}</span>
                    <small>{formatDateTime(order.scheduled_end)}</small>
                  </td>
                  <td>
                    <FormulaLink id={order.formula_id} name={order.formula_name} />
                  </td>
                  {showReasons && (
                    <td>
                      {'blocking_reasons' in order && order.blocking_reasons.length
                        ? order.blocking_reasons.join(', ')
                        : '-'}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={showReasons ? 7 : 6} message={emptyMessage} />
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
};

const BatchTable: React.FC<{
  rows: ProductionWipBatch[];
  isLoading: boolean;
}> = ({ rows, isLoading }) => {
  const navigate = useNavigate();

  return (
    <article className="production-overview-panel production-overview-table-card">
      <div className="production-overview-card-title">
        <h3>
          <PackageOpen size={18} />
          In-progress batches
        </h3>
        <span>{rows.length}</span>
      </div>
      <div className="production-overview-table-wrap">
        <table className="production-overview-table">
          <thead>
            <tr>
              <th>Batch</th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Qty Produced</th>
              <th>Started</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingRows colSpan={6} />
            ) : rows.length ? (
              rows.map((batch) => (
                <tr
                  key={batch.batch_id}
                  onClick={() => navigate(`/production/orders/${batch.order_id}`)}
                >
                  <td>
                    <strong>{batch.batch_number || batch.batch_id}</strong>
                    <small>{batch.order_id}</small>
                  </td>
                  <td>{batch.product_name}</td>
                  <td>{batch.warehouse_name}</td>
                  <td>{formatQuantity(batch.quantity_produced)}</td>
                  <td>{formatDateTime(batch.started_at)}</td>
                  <td>
                    <span
                      className={`production-overview-status-badge production-overview-status-badge--${statusClassName(
                        batch.status,
                      )}`}
                    >
                      {statusLabel(batch.status)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={6} message="No in-progress batches found." />
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
};

const ProductionWipSection: React.FC<ProductionWipSectionProps> = ({ wip, isLoading }) => (
  <section className="production-overview-section">
    <div className="production-overview-section__head">
      <div>
        <h2>Operational WIP</h2>
        <p>Running, due, late, and blocked production work.</p>
      </div>
    </div>

    <div className="production-overview-wip-grid">
      <OrderTable
        title="Overdue scheduled orders"
        icon={<AlertTriangle size={18} />}
        rows={wip?.scheduled_orders_overdue ?? []}
        isLoading={isLoading}
        emptyMessage="No overdue scheduled orders found."
        variant="danger"
      />
      <OrderTable
        title="Blocked by formula"
        icon={<Ban size={18} />}
        rows={wip?.orders_blocked_by_unavailable_formula ?? []}
        isLoading={isLoading}
        emptyMessage="No formula-blocked orders found."
        variant="warning"
        showReasons
      />
      <OrderTable
        title="In-progress orders"
        icon={<Factory size={18} />}
        rows={wip?.in_progress_orders ?? []}
        isLoading={isLoading}
        emptyMessage="No in-progress orders found."
      />
      <BatchTable rows={wip?.in_progress_batches ?? []} isLoading={isLoading} />
      <OrderTable
        title="Due today"
        icon={<CalendarClock size={18} />}
        rows={wip?.scheduled_orders_due_today ?? []}
        isLoading={isLoading}
        emptyMessage="No scheduled orders due today."
      />
    </div>
  </section>
);

export default ProductionWipSection;
