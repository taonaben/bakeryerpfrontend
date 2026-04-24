import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw } from 'lucide-react';
import type { ReworkOrder } from '../types/productionModels';

interface ReworkOrdersTableProps {
  orders: ReworkOrder[];
  isLoading?: boolean;
}

const toBadgeClass = (status: string) => {
  const normalized = status?.toLowerCase().replace(/_/g, '-');
  if (!normalized) return 'default';
  if (normalized === 'in-progress') return 'in-progress';
  return normalized;
};

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatQuantity = (value: number | string) => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(num);
};

const ReworkOrdersTable: React.FC<ReworkOrdersTableProps> = ({ orders = [], isLoading = false }) => {
  const navigate = useNavigate();

  const rowIds = useMemo(() => orders.map((o, i) => o.id || String(i)), [orders]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(rowIds));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (orders.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <RefreshCcw size={48} />
          </div>
          <h3 className="empty-state__title">No rework orders found</h3>
          <p className="empty-state__description">
            There are no rework orders matching your filters. Create a rework order to start tracking inputs and recovered output.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading rework orders...</span>
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
                aria-label="Select all rework orders"
              />
            </th>
            <th>Order</th>
            <th>Target Product</th>
            <th className="quantity-cell">Qty Requested</th>
            <th>Status</th>
            <th>Warehouse</th>
            <th>Created</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            const rowId = order.id || String(index);
            return (
              <tr
                key={rowId}
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'INPUT') {
                    navigate(`/production/rework/${order.id}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowId)}
                    onChange={() => toggleRow(rowId)}
                    aria-label={`Select rework order ${order.id}`}
                  />
                </td>
                <td>{order.id}</td>
                <td>
                  <div className="production-order-product">
                    <span className="production-order-product__name">{order.target_product_name || '—'}</span>
                    <span className="production-order-product__meta">Product ID: {order.target_product}</span>
                  </div>
                </td>
                <td className="quantity-cell">{formatQuantity(order.quantity_requested)}</td>
                <td>
                  <span className={`production-status-badge ${toBadgeClass(order.status)}`}>
                    {order.status?.replace(/_/g, ' ') || '—'}
                  </span>
                </td>
                <td>{order.warehouse_name || '—'}</td>
                <td className="text-muted">{formatDateTime(order.created_at)}</td>
                <td className="text-muted">{formatDateTime(order.completed_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReworkOrdersTable;
