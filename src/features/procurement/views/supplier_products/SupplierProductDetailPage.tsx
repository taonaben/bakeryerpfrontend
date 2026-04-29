/**
 * Supplier Product Detail Page
 * Route: /procurement/supplier-products/:productId
 *
 * Shows all suppliers that carry a specific product, with price, lead time,
 * preferred status, and inline actions (edit, set preferred, deactivate).
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Star, Plus, Edit2, XCircle, Package } from 'lucide-react';
import Breadcrumb from '@/shared/components/Breadcrumb';
import type { BreadcrumbItem } from '@/shared/components/Breadcrumb';
import { useSupplierProducts } from '../../hooks/useSupplierProducts';
import { useSupplierProductsStore } from '../../stores/supplierProductsStore';
import { useProductStore } from '@/core/products/stores/productStore';
import type { SupplierProduct } from '../../types/models';
import AddSupplierModal from '../../components/supplier-products/AddSupplierModal';
import EditSupplierProductModal from '../../components/supplier-products/EditSupplierProductModal';
import '../../styles/procurement.css';
import '../../../inventory/styles/batch-detail.css';

const formatPrice = (price: string | number) => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return price;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const SupplierProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  

  const { items, isLoading, error } = useSupplierProducts(
    productId ? { product_id: productId } : {},
  );
  const updateSupplierProduct = useSupplierProductsStore((s) => s.updateSupplierProduct);
  const deactivateSupplierProduct = useSupplierProductsStore((s) => s.deactivateSupplierProduct);

  const productMap = useProductStore((s) => s.productMap);
  const fetchProduct = useProductStore((s) => s.fetchProduct);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SupplierProduct | null>(null);
  // Track whether the first fetch has completed so we don't flash empty state
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  // Mark as fetched once loading transitions from true → false
  useEffect(() => {
    if (!isLoading && !hasFetched) {
      setHasFetched(true);
    }
  }, [isLoading]);

  const product = productId ? productMap[productId] : null;

  const handleSetPreferred = async (item: SupplierProduct) => {
    if (item.is_preferred) return;
    try {
      await updateSupplierProduct(item.id, { is_preferred: true });
    } catch (err) {
      console.error('Failed to set preferred:', err);
    }
  };

  const handleDeactivate = async (item: SupplierProduct) => {
    if (!confirm(`Deactivate ${item.supplier_name} for this product?`)) return;
    try {
      await deactivateSupplierProduct(item.id);
    } catch (err) {
      console.error('Failed to deactivate:', err);
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Supplier Products', href: '/procurement/supplier-products' },
    ...(product ? [{ label: product.name, isActive: true } as BreadcrumbItem] : []),
  ];

  // ── Loading ──
  if (isLoading || !hasFetched) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button
            onClick={() => navigate('/procurement/supplier-products')}
            className="back-button"
            aria-label="Go back"
          >
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="loading-skeleton">
          <div className="skeleton-content" />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button
            onClick={() => navigate('/procurement/supplier-products')}
            className="back-button"
            aria-label="Go back"
          >
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button
          onClick={() => navigate('/procurement/supplier-products')}
          className="back-button"
          aria-label="Go back"
        >
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Content */}
      <div className="detail-container" style={{ display: 'block', maxWidth: '1200px' }}>
        <main className="main-content" style={{ padding: 0 }}>
          {/* Product Header */}
          <section className="detail-section">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                  {product?.name || 'Product'}
                </h1>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  SKU: {product?.sku || '—'} • Category: {product?.category || '—'}
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setIsAddModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} />
                Add Supplier
              </button>
            </div>
          </section>

          {/* Suppliers Table */}
          <section className="detail-section">
            <h2 className="section-title">Suppliers</h2>

            {items.length === 0 ? (
              <div
                style={{
                  padding: '48px 16px',
                  textAlign: 'center',
                  color: '#6b7280',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px dashed #d1d5db',
                }}
              >
                <Package size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  No suppliers linked to this product yet.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="line-items-table">
                  <thead>
                    <tr>
                      <th>Supplier</th>
                      <th>Price</th>
                      <th>Lead Time</th>
                      <th>Preferred</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="supplier-name-cell">
                            <span>{item.supplier_name}</span>
                            <div className="supplier-subtitle">ID: {item.supplier}</div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                          {formatPrice(item.price)}
                        </td>
                        <td>
                          {item.lead_time_days > 0
                            ? `${item.lead_time_days} day${item.lead_time_days !== 1 ? 's' : ''}`
                            : <span style={{ color: '#9ca3af' }}>—</span>}
                        </td>
                        <td>
                          {item.is_preferred ? (
                            <span
                              title="Preferred supplier"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Star size={16} fill="#f59e0b" color="#f59e0b" />
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400e' }}>
                                Preferred
                              </span>
                            </span>
                          ) : (
                            <button
                              className="btn btn-ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetPreferred(item);
                              }}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Set as preferred"
                            >
                              <Star size={14} />
                              Set Preferred
                            </button>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${item.is_active ? 'active' : 'inactive'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(item);
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Edit price/lead time"
                            >
                              <Edit2 size={13} />
                              Edit
                            </button>
                            {item.is_active && (
                              <button
                                className="btn btn-ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeactivate(item);
                                }}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#ef4444',
                                }}
                                title="Deactivate"
                              >
                                <XCircle size={13} />
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Modals */}
      {productId && (
        <>
          <AddSupplierModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            productId={productId}
          />
          {editingItem && (
            <EditSupplierProductModal
              isOpen={!!editingItem}
              onClose={() => setEditingItem(null)}
              item={editingItem}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SupplierProductDetailPage;
