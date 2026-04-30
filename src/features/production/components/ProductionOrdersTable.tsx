import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import type { ProductionOrder } from '../types/productionModels';

interface ProductionOrdersTableProps {
  orders: ProductionOrder[];
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

const ProductionOrdersTable: React.FC<ProductionOrdersTableProps> = ({
  orders = [],
  isLoading = false,
}) => {
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
            <ClipboardList size={48} />
          </div>
          <h3 className="empty-state__title">No production orders found</h3>
          <p className="empty-state__description">
            There are no production orders matching your filters. Try adjusting your search or create a new production order.
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
          <span>Loading production orders...</span>
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
            <th>Order</th>
            <th>Product</th>
            <th className="quantity-cell">Qty</th>
            <th>Status</th>
            <th>Warehouse</th>
            <th>Scheduled Start</th>
            <th>Scheduled End</th>
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
                    aria-label={`Select production order ${order.id}`}
                  />
                </td>
                <td>{order.id}</td>
                <td>
                  <div className="production-order-product">
                    <span className="production-order-product__name">{order.product_name || '—'}</span>
                    <span className="production-order-product__meta">Product ID: {order.product}</span>
                  </div>
                </td>
                <td className="quantity-cell">{formatQuantity(order.quantity)}</td>
                <td>
                  <span className={`production-status-badge ${toBadgeClass(order.status)}`}>
                    {order.status?.replace(/_/g, ' ') || '—'}
                  </span>
                </td>
                <td>{order.warehouse_name || '—'}</td>
                <td className="text-muted">{formatDateTime(order.scheduled_start)}</td>
                <td className="text-muted">{formatDateTime(order.scheduled_end)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionOrdersTable;
