import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { PurchaseOrder } from '../../types/purchase_orders_models';

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  orders = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const rowIds = useMemo(
    () => orders.map((o, i) => o.id || String(i)),
    [orders],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string, currency: string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const statusClass = (status: string) => {
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  if (orders.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Inbox size={48} />
          </div>
          <h3 className="empty-state__title">No purchase orders found</h3>
          <p className="empty-state__description">
            There are no purchase orders matching your filters. Try adjusting your search or create a new purchase order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all purchase orders"
              />
            </th>
            <th>PO Number</th>
            <th>Supplier</th>
            <th>Warehouse</th>
            <th>Order Date</th>
            <th>Expected</th>
            <th>Total</th>
            <th>Status</th>
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
                    navigate(`/procurement/purchase-orders/${order.id}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowId)}
                    onChange={() => toggleRow(rowId)}
                    aria-label={`Select purchase order ${order.po_number}`}
                  />
                </td>
                <td className="po-number-cell">{order.po_number}</td>
                <td>
                  <div className="po-supplier-cell">
                    <span className="po-supplier-name">{order.supplier_name || '—'}</span>
                  </div>
                </td>
                <td>
                  <span className="po-warehouse-badge">{order.warehouse_name || '—'}</span>
                </td>
                <td className="text-muted">{formatDate(order.order_date)}</td>
                <td className="text-muted">{formatDate(order.expected_delivery_date)}</td>
                <td className="po-amount-cell">
                  {formatCurrency(order.total_amount, order.currency)}
                </td>
                <td>
                  <span className={`badge ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages >= 1 && (
        <footer
          className="pagination-footer"
          aria-label="Table pagination"
          role="contentinfo"
        >
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
                Page <strong>{currentPage}</strong> of{' '}
                <strong>{totalPages}</strong>
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

export default PurchaseOrdersTable;
