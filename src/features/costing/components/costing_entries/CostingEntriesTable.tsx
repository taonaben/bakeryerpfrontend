import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { CostingEntry } from '../../types/costing_entries_models';

interface Props {
  entries: CostingEntry[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatCurrency = (value: string | number, currency = 'USD') => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(n);
};

// Costing entries are always "Costed" once they exist.
// The API doesn't return a status field, so we derive it.
const deriveStatus = (_entry: CostingEntry) => 'Costed';

const CostingEntriesTable: React.FC<Props> = ({
  entries,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  if (entries.length === 0 && !isLoading) {
    return (
      <div className="costing-table-container">
        <div className="costing-empty">
          <div className="costing-empty__icon">
            <Inbox size={48} />
          </div>
          <h3 className="costing-empty__title">No costing entries found</h3>
          <p className="costing-empty__desc">
            No entries match your current filters. Costing entries are created automatically when a production batch is completed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="costing-table-container">
        <table className="costing-table">
          <thead>
            <tr>
              <th>Batch</th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Date Completed</th>
              <th>Cost / Unit</th>
              <th style={{ textAlign: 'right' }}>Total Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const status = deriveStatus(entry);
              return (
                <tr
                  key={entry.id}
                  onClick={() => navigate(`/costing/entries/${entry.id}`)}
                >
                  <td>
                    <span className="costing-batch-cell">{entry.batch_number}</span>
                  </td>
                  <td>
                    <div className="costing-product-cell">{entry.product_name}</div>
                  </td>
                  <td>
                    <span className="costing-warehouse-badge">{entry.warehouse_name}</span>
                  </td>
                  <td className="costing-date-cell">{formatDate(entry.computed_at)}</td>
                  <td>
                    <span className="costing-cpu-cell">
                      {formatCurrency(entry.cost_per_unit, entry.currency)}
                    </span>
                  </td>
                  <td className="costing-total-cell">
                    {formatCurrency(entry.total_cost, entry.currency)}
                  </td>
                  <td>
                    <span className={`badge ${status.toLowerCase()}`}>{status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <footer className="pagination-footer" aria-label="Table pagination">
          <div className="pagination-container">
            <button
              className="pagination-btn pagination-btn--prev"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              type="button"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>
            <div className="pagination-info" aria-live="polite">
              <span className="page-number">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
            </div>
            <button
              className="pagination-btn pagination-btn--next"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              type="button"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      )}
    </>
  );
};

export default CostingEntriesTable;
