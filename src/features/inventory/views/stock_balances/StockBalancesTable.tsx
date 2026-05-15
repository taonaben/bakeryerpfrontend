import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { useProductStore } from '../../../../core/products/stores/productStore';
import type { StockBalance } from '../../types/models';

interface StockBalancesTableProps {
  balances?: StockBalance[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const StockBalancesTable: React.FC<StockBalancesTableProps> = ({
  balances = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const rowIds = useMemo(
    () => balances.map((balance, index) => balance.id || balance.product || String(index)),
    [balances],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const productMap = useProductStore((state) => state.productMap);
  const fetchProduct = useProductStore((state) => state.fetchProduct);

  const missingProductIds = useMemo(() => {
    const productIds = Array.from(
      new Set(balances.map((balance) => balance.product).filter(Boolean)),
    );
    return productIds.filter((id) => !productMap[id]);
  }, [balances, productMap]);

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

  if (balances.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Database size={48} />
          </div>
          <h3 className="empty-state__title">No stock balances found</h3>
          <p className="empty-state__description">
            Product balances for the active warehouse will appear here.
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
          <span>Loading stock balances...</span>
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
                aria-label="Select all stock balances"
              />
            </th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((balance, index) => {
            const rowId = balance.id || balance.product || String(index);
            const product = productMap[balance.product];

            return (
              <tr key={rowId}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowId)}
                    onChange={() => toggleRow(rowId)}
                    aria-label={`Select balance ${product?.name || balance.product || rowId}`}
                  />
                </td>
                <td className="name-cell">{product?.name || balance.product || '-'}</td>
                <td className="quantity-cell">{formatQuantity(balance.quantity_on_hand)}</td>
                <td>
                  <span className="unit-cell">{product?.unit_of_measure_display || product?.unit_of_measure || '-'}</span>
                </td>
                <td>
                  <span className={`inventory-status-badge inventory-status-badge--${statusClassName(balance.status)}`}>
                    {formatStatus(balance.status)}
                  </span>
                </td>
                <td className="text-muted">{formatDate(balance.last_updated)}</td>
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

const formatStatus = (status?: string): string =>
  (status || '-').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const statusClassName = (status?: string): string =>
  (status || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default StockBalancesTable;
