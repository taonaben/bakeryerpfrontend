import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { Formula } from '../types/models';

interface FormulasTableProps {
  formulas: Formula[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const statusLabel = (status: string) => status.replace(/_/g, ' ');

const FormulasTable: React.FC<FormulasTableProps> = ({
  formulas,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const rowIds = useMemo(() => formulas.map((formula) => formula.id), [formulas]);
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

  if (formulas.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Inbox size={48} />
          </div>
          <h3 className="empty-state__title">No formulas found</h3>
          <p className="empty-state__description">
            There are no formulation records matching your current filters. Create a formula to get started.
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
                aria-label="Select all formulas"
              />
            </th>
            <th>Name</th>
            <th>Revision</th>
            <th>Batch Size</th>
            <th>Yield %</th>
            <th>Lines</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {formulas.map((formula) => (
            <tr
              key={formula.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                  navigate(`/formulation/${formula.id}`);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(formula.id)}
                  onChange={() => toggleRow(formula.id)}
                  aria-label={`Select formula ${formula.name}`}
                />
              </td>
              <td>
                <div className="formula-name-cell">
                  <span>{formula.name}</span>
                  <div className="formula-subtitle">ID: {formula.id.slice(0, 8)}</div>
                </div>
              </td>
              <td>{formula.revision}</td>
              <td>{formula.batch_size.toLocaleString()}</td>
              <td>{formula.yield_percentage}%</td>
              <td>{formula.lines.length}</td>
              <td>
                <span className={`badge formula-status ${formula.status.replace(/_/g, '-')}`}>
                  {statusLabel(formula.status)}
                </span>
              </td>
              <td>
                {new Date(formula.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages >= 1 && (
        <footer className="pagination-footer" aria-label="Formulas pagination">
          <div className="pagination-container">
            <button
              type="button"
              className="pagination-btn pagination-btn--prev"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            <div className="pagination-info">
              <span className="page-number">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
            </div>

            <button
              type="button"
              className="pagination-btn pagination-btn--next"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
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

export default FormulasTable;
