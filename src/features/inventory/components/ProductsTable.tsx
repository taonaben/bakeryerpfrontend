import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import type { Product } from '../../types/productModel';

interface ProductsTableProps {
  products: Product[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  onRowClick?: (productId: string) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  onRowClick,
}) => {
  const rowIds = useMemo(() => products.map((p, i) => p.id || String(i)), [products]);
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

  if (products.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Package size={48} />
          </div>
          <h3 className="empty-state__title">No products found</h3>
          <p className="empty-state__description">
            There are no products matching your filters. Try adjusting your search or create a new product.
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
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="products-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all products"
              />
            </th>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Shelf Life</th>
            <th>Storage</th>
            <th>Reorder</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const rowId = product.id || String(index);
            return (
              <tr
                key={rowId}
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'INPUT' && product.id) {
                    onRowClick?.(product.id);
                  }
                }}
                style={{ cursor: product.id ? 'pointer' : 'default' }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowId)}
                    onChange={() => toggleRow(rowId)}
                    aria-label={`Select product ${product.sku}`}
                  />
                </td>
                <td className="sku-cell">{product.sku}</td>
                <td className="name-cell">
                  {product.name}
                </td>
                <td>{product.category}</td>
                <td>{product.unit_of_measure_display || product.unit_of_measure}</td>
                <td>{product.shelf_life_days ?? 0} days</td>
                <td>
                  <span className="storage-badge">{product.storage_conditions || 'N/A'}</span>
                </td>
                <td>
                  <span
                    className={`reorder-badge${product.has_reorder_policy ? ' active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.id) {
                        onRowClick?.(product.id);
                      }
                    }}
                    title="Open product detail"
                  >
                    {product.has_reorder_policy ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="btn-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.id) {
                        onRowClick?.(product.id);
                      }
                    }}
                    title="Edit product"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <footer className="pagination-footer">
          <div className="pagination-container">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="pagination-btn"
              type="button"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            <div className="pagination-info">
              <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
            </div>

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="pagination-btn"
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

export default ProductsTable;
