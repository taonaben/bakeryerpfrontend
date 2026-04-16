import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { PurchaseRequisition } from '../../types/models';

interface RequisitionsTableProps {
  requisitions: PurchaseRequisition[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const RequisitionsTable: React.FC<RequisitionsTableProps> = ({
  requisitions = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const rowIds = useMemo(
    () => requisitions.map((r, i) => r.id || String(i)),
    [requisitions],
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

  if (requisitions.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Inbox size={48} />
          </div>
          <h3 className="empty-state__title">No requisitions found</h3>
          <p className="empty-state__description">
            There are no purchase requisitions matching your filters. Try adjusting your search or create a new requisition.
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
                aria-label="Select all requisitions"
              />
            </th>
            <th>PR Number</th>
            <th>Title</th>
            <th>Requested By</th>
            <th>Created</th>
            <th>Items</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requisitions.map((r, index) => {
            const rowId = r.id || String(index);
            const itemCount = r.line_items?.length ?? 0;

            return (
              <tr
                key={rowId}
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'INPUT') {
                    navigate(`/procurement/requisitions/${r.id}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowId)}
                    onChange={() => toggleRow(rowId)}
                    aria-label={`Select requisition ${r.pr_number}`}
                  />
                </td>
                <td className="pr-number-cell">{r.pr_number}</td>
                <td>
                  <div className="pr-title-cell">
                    <span>{r.title}</span>
                    {r.description && (
                      <div className="pr-subtitle">{r.description}</div>
                    )}
                  </div>
                </td>
                <td>{r.requested_by_name || '—'}</td>
                <td className="text-muted">
                  {new Date(r.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td>
                  <span className="items-count">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${r.status?.toLowerCase()}`}>
                    {r.status}
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

export default RequisitionsTable;
