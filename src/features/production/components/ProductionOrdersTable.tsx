import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Factory } from 'lucide-react';
import type { ProductionOrder } from '../types/productionModels';

interface ProductionOrdersTableProps {
  orders: ProductionOrder[];
  isLoading?: boolean;
}

const formatDateTime = (value: string | null) => {
  if (!value) return 'Not scheduled';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatStatusLabel = (status: string) =>
  status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusClassName = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === 'completed') return 'completed';
  if (normalized === 'in_progress') return 'in-progress';
  if (normalized === 'scheduled') return 'scheduled';
  if (normalized === 'cancelled') return 'cancelled';
  return 'default';
};

const ProductionOrdersTable: React.FC<ProductionOrdersTableProps> = ({
  orders,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const safeOrders = Array.isArray(orders) ? orders : [];
  const rowIds = useMemo(() => safeOrders.map((order, index) => order.id || String(index)), [safeOrders]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(rowIds));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading production orders...</span>
        </div>
      </div>
    );
  }

  if (safeOrders.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <ClipboardList size={48} />
          </div>
          <h3 className="empty-state__title">No production orders found</h3>
          <p className="empty-state__description">
            There are no production orders matching the current warehouse and status filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="inventory-table production-orders-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all production orders"
              />
            </th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Scheduled Start</th>
            <th>Scheduled End</th>
            <th>Warehouse</th>
            <th>Formula</th>
            <th>Planning Link</th>
          </tr>
        </thead>
        <tbody>
          {safeOrders.map((order, index) => {
            const rowId = order.id || String(index);

            return (
            <tr
              key={rowId}
              onClick={(event) => {
                if ((event.target as HTMLElement).tagName !== 'INPUT') {
                  navigate(`/production/orders/${order.id}`);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(rowId)}
                  onChange={() => toggleRow(rowId)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Select production order ${order.id.slice(0, 8)}`}
                />
              </td>
              <td>
                <div className="production-order-product">
                  <span className="production-order-product__name">{order.product_name}</span>
                  <span className="production-order-product__meta">
                    ID: {order.id.slice(0, 8)}
                  </span>
                </div>
              </td>
              <td>{order.quantity}</td>
              <td>
                <span
                  className={`badge production-status-badge ${getStatusClassName(order.status)}`}
                >
                  {formatStatusLabel(order.status)}
                </span>
              </td>
              <td>{formatDateTime(order.scheduled_start)}</td>
              <td>{formatDateTime(order.scheduled_end)}</td>
              <td>{order.warehouse_name}</td>
              <td>
                {order.formula ? (
                  <span className="production-pill">Attached</span>
                ) : (
                  <span className="production-pill production-pill--muted">Missing</span>
                )}
              </td>
              <td>
                {order.planned_order ? (
                  <div className="production-order-plan-link">
                    <Factory size={14} />
                    <span>{order.planned_order_status || 'Linked'}</span>
                  </div>
                ) : (
                  <span className="production-pill production-pill--muted">None</span>
                )}
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionOrdersTable;
