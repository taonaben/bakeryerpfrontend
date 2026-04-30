/**
 * Supplier Products Page
 * Route: /procurement/supplier-products
 *
 * Lists all products in the catalogue. Clicking a product navigates to
 * the detail view which shows every supplier that carries that product.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, ChevronRight } from 'lucide-react';
import { useProductStore } from '@/core/products/stores/productStore';
import '../../styles/procurement.css';

const SupplierProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, search]);

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        {/* Header */}
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <h1>Supplier Products</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Master Data / Supplier Products
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="procurement-toolbar">
          <div className="procurement-toolbar__left">
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="procurement-toolbar__right">
            <div className="search-bar">
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="procurement-content">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => fetchProducts(true)} type="button">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading products…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="table-container">
            <div className="empty-state">
              <div className="empty-state__icon">
                <Package size={48} />
              </div>
              <h3 className="empty-state__title">No products found</h3>
              <p className="empty-state__description">
                {search
                  ? 'No products match your search. Try a different term.'
                  : 'No products exist in the catalogue yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() =>
                      navigate(`/procurement/supplier-products/${product.id}`)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="supplier-name-cell">
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="pr-number-cell">{product.sku}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#475569',
                        }}
                      >
                        {product.category || '—'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {product.unit_of_measure_display || product.unit_of_measure || '—'}
                    </td>
                    <td>
                      <ChevronRight size={16} color="#94a3b8" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierProductsPage;
