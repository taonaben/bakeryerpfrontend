import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { PlannedOrder } from '../../types/plannedOrderModel';
import ReadinessBadge from './ReadinessBadge';

interface PlannedOrdersTableProps {
  orders: PlannedOrder[];
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  onRowClick?: (id: string) => void;
}

const PlannedOrdersTable: React.FC<PlannedOrdersTableProps> = ({
  orders = [],
  selectedIds = new Set(),
  onSelectionChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  onRowClick,
}) => {
  const navigate = useNavigate();
  const rowIds = useMemo(() => orders.map((o, i) => o.id || String(i)), [orders]);
  const [localSelected, setLocalSelected] = useState<Set<string>>(selectedIds);

  useEffect(() => {
    setLocalSelected(new Set(selectedIds));
  }, [selectedIds]);

  const allSelected = rowIds.length > 0 && rowIds.every((id) => localSelected.has(id));

  const handleToggleAll = () => {
    const newSelection: Set<string> = allSelected ? new Set() : new Set(rowIds);
    setLocalSelected(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleToggleRow = (id: string) => {
    const newSelection = new Set(localSelected);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setLocalSelected(newSelection);
    onSelectionChange?.(newSelection);
  };

  if (orders.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Inbox size={48} />
          </div>
          <h3 className="empty-state__title">No planned orders found</h3>
          <p className="empty-state__description">
            There are no planned production orders matching your filters. Try adjusting your
            search or create a new order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="inventory-table production-planning-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                aria-label="Select all planned orders"
              />
            </th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Warehouse</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Need By</th>
            <th>Readiness</th>
            <th>Queue Pos.</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            const rowId = order.id || String(index);
            const isSelected = localSelected.has(rowId);

            return (
              <tr
                key={rowId}
                className={isSelected ? 'row--selected' : ''}
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'INPUT') {
                    onRowClick?.(order.id) || navigate(`/production/planned-orders/${order.id}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleRow(rowId)}
                    aria-label={`Select order ${order.product_name}`}
                  />
                </td>
                <td className="product-cell">
                  <div className="product-info">
                    <span className="product-name">{order.product_name}</span>
                    <span className="product-id text-muted">{order.product}</span>
                  </div>
                </td>
                <td className="quantity-cell">
                  <strong>{Number(order.quantity).toLocaleString()}</strong>
                </td>
                <td className="warehouse-cell">{order.warehouse_name || '-'}</td>
                <td>
                  <span className={`badge priority-${order.priority}`}>{order.priority}</span>
                </td>
                <td>
                  <span className={`badge status-${order.status}`}>{order.status}</span>
                </td>
                <td className="text-muted">
                  {new Date(order.need_by).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td>
                  <ReadinessBadge needBy={order.need_by} status={order.status} />
                </td>
                <td className="queue-pos-cell text-muted">{order.queue_position}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages >= 1 && (
        <footer className="pagination-footer" aria-label="Table pagination" role="contentinfo">
          <div className="pagination-container">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="pagination-btn pagination-btn--prev"
              aria-label={`Go to previous page (page ${currentPage - 1})`}
              title="Previous page"
              type="button"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            <div className="pagination-info" aria-live="polite" aria-atomic="true">
              <span className="page-number">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
            </div>

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="pagination-btn pagination-btn--next"
              aria-label={`Go to next page (page ${currentPage + 1})`}
              title="Next page"
              type="button"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PlannedOrdersTable;
