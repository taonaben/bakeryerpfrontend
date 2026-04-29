import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { StandardCost } from '../types/standard_costs_models';

interface Props {
  items: StandardCost[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const fmtCurrency = (v: string | number, currency = 'USD') => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(n);
};

// The most recent record per product is "Active"; older ones are "Superseded".
// We mark the first occurrence of each product as active (list is ordered -computed_at).
const tagActive = (items: StandardCost[]): Set<string> => {
  const seen = new Set<string>();
  const active = new Set<string>();
  for (const item of items) {
    if (!seen.has(item.product)) {
      seen.add(item.product);
      active.add(item.id);
    }
  }
  return active;
};

const StandardCostsTable: React.FC<Props> = ({
  items,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const activeIds = tagActive(items);

  if (items.length === 0 && !isLoading) {
    return (
      <div className="costing-table-container">
        <div className="costing-empty">
          <div className="costing-empty__icon">
            <Inbox size={48} />
          </div>
          <h3 className="costing-empty__title">No standard costs found</h3>
          <p className="costing-empty__desc">
            Standard costs are computed from a formula. Use the "Compute" action to generate one.
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
              <th>Product</th>
              <th>Formula Rev.</th>
              <th>Effective Date</th>
              <th>Material / Unit</th>
              <th>Overhead / Unit</th>
              <th style={{ textAlign: 'right' }}>Std Cost / Unit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isActive = activeIds.has(item.id);
              return (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/costing/standard-costs/${item.id}`)}
                  className={isActive ? 'sc-row--active' : ''}
                >
                  <td>
                    <div className="costing-product-cell">{item.product_name}</div>
                  </td>
                  <td>
                    <span className="sc-revision-badge">Rev. {item.formula_revision}</span>
                  </td>
                  <td className="costing-date-cell">{fmtDate(item.computed_at)}</td>
                  <td className="costing-date-cell">
                    {fmtCurrency(item.material_cost_per_unit, item.currency)}
                  </td>
                  <td className="costing-date-cell">
                    {fmtCurrency(item.overhead_cost_per_unit, item.currency)}
                  </td>
                  <td>
                    <span className="costing-cpu-cell" style={{ display: 'block', textAlign: 'right' }}>
                      {fmtCurrency(item.total_standard_cost_per_unit, item.currency)}
                    </span>
                  </td>
                  <td>
                    {isActive ? (
                      <span className="badge sc-active">Active</span>
                    ) : (
                      <span className="badge sc-superseded">Superseded</span>
                    )}
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
            >
              <ChevronLeft size={18} /><span>Previous</span>
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
            >
              <span>Next</span><ChevronRight size={18} />
            </button>
          </div>
        </footer>
      )}
    </>
  );
};

export default StandardCostsTable;
