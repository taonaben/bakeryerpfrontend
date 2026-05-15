import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import type { StockMovement } from '../../types/models';

interface MovementLedgerTableProps {
  movements?: StockMovement[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

type MovementWithFallbacks = StockMovement & {
  batch?: string;
  batch_id?: string;
  product_name?: string;
  product?: { name?: string; product_name?: string; title?: string };
};

const MovementLedgerTable: React.FC<MovementLedgerTableProps> = ({
  movements = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const rowIds = useMemo(
    () => movements.map((movement, index) => movement?.id || movement?.reference_number || String(index)),
    [movements],
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

  if (movements.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <History size={48} />
          </div>
          <h3 className="empty-state__title">No stock movements found</h3>
          <p className="empty-state__description">
            Inventory movements for the active warehouse will appear here.
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
          <span>Loading stock movements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="inventory-table inventory-registry-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all movements"
              />
            </th>
            <th>Batches Used</th>
            <th>Product</th>
            <th>Reference</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement, index) => {
            const item = movement as MovementWithFallbacks;
            const rowId = item?.id || item?.reference_number || String(index);

            return (
              <tr
                key={rowId}
                className="inventory-table__clickable-row"
                onClick={() => {
                  if (item?.id) navigate(`/inventory/stock_movements/${item.id}`);
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowId)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => toggleRow(rowId)}
                    aria-label={`Select movement ${item?.reference_number || rowId}`}
                  />
                </td>
                <td>
                  <BatchChips movement={item} rowId={rowId} />
                </td>
                <td className="name-cell">{getProductName(item)}</td>
                <td>
                  <code className="batch-tag">{item.reference_number || '-'}</code>
                </td>
                <td>
                  <span className={`inventory-status-badge inventory-status-badge--${statusClassName(item.movement_type)}`}>
                    {formatMovementType(item.movement_type)}
                  </span>
                </td>
                <td className={`quantity-cell ${Number(item.total_quantity) <= 0 ? 'quantity-cell--negative' : 'quantity-cell--positive'}`}>
                  {formatQuantity(item.total_quantity)}
                </td>
                <td>{formatDate(item.created_at)}</td>
                <td className="text-muted notes-cell">{item.notes || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <PaginationFooter
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </div>
  );
};

const BatchChips: React.FC<{ movement: MovementWithFallbacks; rowId: string }> = ({
  movement,
  rowId,
}) => {
  if (Array.isArray(movement?.batches_detail) && movement.batches_detail.length > 0) {
    return (
      <div className="batch-chips" title="Batches used">
        {movement.batches_detail.map((detail, chipIndex) => {
          const batchId = detail?.batch?.id;
          const batchNumber = detail?.batch?.batch_number;
          if (!batchId || !batchNumber) return null;

          return (
            <Link
              key={`${rowId}-batch-${chipIndex}`}
              to={`/inventory/batch/${batchId}`}
              className={`batch-chip ${getChipColorClass(batchNumber)}`}
              title={`View details for batch ${batchNumber}`}
              onClick={(event) => event.stopPropagation()}
            >
              {batchNumber}
            </Link>
          );
        })}
      </div>
    );
  }

  return <span className="text-muted">-</span>;
};

interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange?: (page: number) => void;
}

const PaginationFooter: React.FC<PaginationFooterProps> = ({
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <footer className="pagination-footer" aria-label="Table pagination">
      <div className="pagination-container">
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="pagination-btn pagination-btn--prev"
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
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="pagination-btn pagination-btn--next"
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </footer>
  );
};

const getProductName = (movement: MovementWithFallbacks): string => {
  if (Array.isArray(movement?.batches_detail) && movement.batches_detail.length > 0) {
    const firstBatch = movement.batches_detail[0]?.batch;
    const name =
      firstBatch?.product_name ||
      firstBatch?.product?.name ||
      firstBatch?.product?.product_name;
    if (name) return name;
  }

  return (
    movement?.product_name ||
    movement?.product?.name ||
    movement?.product?.product_name ||
    movement?.product?.title ||
    '-'
  );
};

const getChipColorClass = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 7;
  }
  const palette = [
    'batch-chip--blue',
    'batch-chip--green',
    'batch-chip--amber',
    'batch-chip--purple',
    'batch-chip--teal',
    'batch-chip--slate',
  ];
  return palette[hash] || 'batch-chip--neutral';
};

const formatQuantity = (value: number | string): string => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : '-';
};

const formatDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

const formatMovementType = (type?: string): string =>
  (type || '-').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const statusClassName = (status?: string): string =>
  (status || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default MovementLedgerTable;
