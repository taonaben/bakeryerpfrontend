import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { getExpiryStatus } from '../../utils/getExpiryStatus';
import { useProductStore } from '../../../../core/products/stores/productStore';
import type { BatchRegistry } from '../../types/models';

interface BatchesRegistryTableProps {
  batches?: BatchRegistry[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const BatchesRegistryTable: React.FC<BatchesRegistryTableProps> = ({
  batches = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const rowIds = useMemo(
    () => batches.map((batch, index) => batch.id || batch.batch_number || String(index)),
    [batches],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const productMap = useProductStore((state) => state.productMap);
  const fetchProduct = useProductStore((state) => state.fetchProduct);

  const missingProductIds = useMemo(() => {
    const productIds = Array.from(
      new Set(batches.map((batch) => batch.product).filter(Boolean)),
    );
    return productIds.filter((id) => !productMap[id]);
  }, [batches, productMap]);

  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));

  useEffect(() => {
    if (missingProductIds.length === 0) return;
    void Promise.all(missingProductIds.map((id) => fetchProduct(id).catch(() => null)));
  }, [fetchProduct, missingProductIds]);

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

  if (batches.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Layers size={48} />
          </div>
          <h3 className="empty-state__title">No batch records found</h3>
          <p className="empty-state__description">
            Batches received into the active warehouse will appear here.
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
          <span>Loading batches...</span>
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
                aria-label="Select all batches"
              />
            </th>
            <th>Batch Number</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Manufactured</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch, index) => {
            const rowId = batch.id || batch.batch_number || String(index);
            const product = productMap[batch.product];
            const expiryStatus = getExpiryStatus(batch.expiry_date);

            return (
              <tr
                key={rowId}
                className="inventory-table__clickable-row"
                onClick={() => {
                  if (batch.id) navigate(`/inventory/batch/${batch.id}`);
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowId)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => toggleRow(rowId)}
                    aria-label={`Select batch ${batch.batch_number || rowId}`}
                  />
                </td>
                <td>
                  <code className="batch-tag">{batch.batch_number || '-'}</code>
                </td>
                <td className="name-cell">{product?.name || batch.product || '-'}</td>
                <td className="quantity-cell">{formatQuantity(batch.quantity)}</td>
                <td>
                  <span className="unit-cell">{product?.unit_of_measure_display || product?.unit_of_measure || '-'}</span>
                </td>
                <td>{formatDate(batch.manufacture_date)}</td>
                <td>
                  <span className={`inventory-status-badge inventory-status-badge--${expiryStatus}`}>
                    {formatDate(batch.expiry_date)}
                    {expiryStatus === 'expired' ? ' Expired' : ''}
                  </span>
                </td>
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

export default BatchesRegistryTable;
