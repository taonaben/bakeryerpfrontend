import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { GoodsReceipt } from '../types/grn_models';

interface GoodsReceiptsTableProps {
  receipts: GoodsReceipt[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const GoodsReceiptsTable: React.FC<GoodsReceiptsTableProps> = ({
  receipts = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const rowIds = useMemo(
    () => receipts.map((r, i) => r.id || String(i)),
    [receipts],
  );

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusClass = (status: string) => status.toLowerCase().replace(/\s+/g, '-');

  if (receipts.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Inbox size={48} />
          </div>
          <h3 className="empty-state__title">No goods receipts found</h3>
          <p className="empty-state__description">
            There are no goods receipts matching your filters. Try adjusting your search or receive goods.
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
                aria-label="Select all goods receipts"
              />
            </th>
            <th>GR Number</th>
            <th>PO Reference</th>
            <th>Supplier</th>
            <th>Warehouse</th>
            <th>Received By</th>
            <th>Received Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt, index) => {
            const rowId = receipt.id || String(index);
            const supplierName = (receipt as any).supplier_name || '—';

            return (
              <tr
                key={rowId}
                onClick={() => navigate(`/procurement/goods-receipts/${receipt.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowId)}
                    onChange={() => toggleRow(rowId)}
                    aria-label={`Select goods receipt ${receipt.gr_number}`}
                  />
                </td>
                <td className="gr-number-cell">{receipt.gr_number || '—'}</td>
                <td className="po-ref-cell">{receipt.purchase_order_number || '—'}</td>
                <td className="gr-supplier-cell">{receipt.supplier_name || '—'}</td>
                <td>
                  <span className="po-warehouse-badge">{receipt.warehouse_name || '—'}</span>
                </td>
                <td className="gr-received-by-cell">{receipt.received_by_name || '—'}</td>
                <td className="text-muted">{formatDate(receipt.received_date)}</td>
                <td>
                  <span className={`badge ${statusClass(receipt.status)}`}>
                    {receipt.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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

export default GoodsReceiptsTable;
