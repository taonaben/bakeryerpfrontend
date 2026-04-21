import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UNIT_OF_MEASURE, STORAGE_CONDITIONS } from '../../constants/products';
import { useProductDetailStore, useReorderPolicyStore } from '../../stores';
import type { RetrievalMethod } from '../../types/reorderPolicyModel';
import '../../styles/products.css';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const {
    product,
    isLoading,
    isSaving,
    isDeleting,
    error,
    fetchProduct,
    updateProduct,
    deleteProduct,
    clearProduct,
  } = useProductDetailStore();
  const {
    activePolicy,
    isLoading: isPolicyLoading,
    isSaving: isPolicySaving,
    isDeleting: isPolicyDeleting,
    error: policyError,
    fetchPoliciesByProduct,
    createPolicy,
    updatePolicy,
    deletePolicy,
    clearPolicies,
  } = useReorderPolicyStore();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit_of_measure: '',
    shelf_life_days: '',
    storage_conditions: '',
    storage_notes: '',
  });
  const [policyForm, setPolicyForm] = useState({
    warehouse: '',
    min_stock_level: '',
    reorder_qty: '',
    lead_time_days: '0',
    retrieval_method: 'FIFO' as RetrievalMethod,
    safety_stock_qty: '',
    is_active: true,
  });
  const [policyFieldErrors, setPolicyFieldErrors] = useState<Record<string, string>>({});
  const [policyNotice, setPolicyNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      navigate('/inventory/products');
      return;
    }
    fetchProduct(productId);
    fetchPoliciesByProduct(productId);
    return () => {
      clearProduct();
      clearPolicies();
    };
  }, [productId, navigate, fetchProduct, clearProduct, fetchPoliciesByProduct, clearPolicies]);

  useEffect(() => {
    if (!product) return;
    setFormData({
      name: product.name || '',
      category: product.category || '',
      unit_of_measure: product.unit_of_measure || '',
      shelf_life_days: String(product.shelf_life_days ?? ''),
      storage_conditions: product.storage_conditions || '',
      storage_notes: product.storage_notes || '',
    });
  }, [product]);

  useEffect(() => {
    const savedWarehouse = localStorage.getItem('active_warehouse');
    if (savedWarehouse) {
      try {
        const parsed = JSON.parse(savedWarehouse);
        setPolicyForm((prev) => ({
          ...prev,
          warehouse: parsed?.id || '',
        }));
      } catch {
        // no-op
      }
    }
  }, []);

  useEffect(() => {
    if (!activePolicy) return;
    setPolicyForm({
      warehouse: activePolicy.warehouse || '',
      min_stock_level: activePolicy.min_stock_level || '',
      reorder_qty: activePolicy.reorder_qty || '',
      lead_time_days: String(activePolicy.lead_time_days ?? 0),
      retrieval_method: activePolicy.retrieval_method || 'FIFO',
      safety_stock_qty: activePolicy.safety_stock_qty || '',
      is_active: activePolicy.is_active,
    });
  }, [activePolicy]);

  const lastUpdated = useMemo(() => {
    if (!product?.updated_at) return 'N/A';
    return new Date(product.updated_at).toLocaleString();
  }, [product?.updated_at]);

  const createdAt = useMemo(() => {
    if (!product?.created_at) return 'N/A';
    return new Date(product.created_at).toLocaleString();
  }, [product?.created_at]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePolicyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const nextValue =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value;
    setPolicyForm((prev) => ({ ...prev, [name]: nextValue }));
    if (policyFieldErrors[name]) {
      setPolicyFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validatePolicyForm = () => {
    const errors: Record<string, string> = {};

    const minStock = Number(policyForm.min_stock_level);
    const reorderQty = Number(policyForm.reorder_qty);
    const safetyStock = Number(policyForm.safety_stock_qty);
    const leadTime = Number(policyForm.lead_time_days);

    if (!policyForm.warehouse) errors.warehouse = 'Warehouse is required';
    if (Number.isNaN(minStock) || minStock < 0) {
      errors.min_stock_level = 'Minimum stock must be a non-negative number';
    }
    if (Number.isNaN(reorderQty) || reorderQty <= 0) {
      errors.reorder_qty = 'Reorder qty must be greater than 0';
    }
    if (Number.isNaN(safetyStock) || safetyStock < 0) {
      errors.safety_stock_qty = 'Safety stock must be a non-negative number';
    }
    if (Number.isNaN(leadTime) || leadTime < 0 || leadTime > 36500) {
      errors.lead_time_days = 'Lead time must be between 0 and 36500 days';
    }

    setPolicyFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    await updateProduct(productId, {
      name: formData.name,
      category: formData.category,
      unit_of_measure: formData.unit_of_measure,
      shelf_life_days: Number(formData.shelf_life_days || 0),
      storage_conditions: formData.storage_conditions,
      storage_notes: formData.storage_notes || undefined,
    });
  };

  const handleDelete = async () => {
    if (!productId) return;
    const confirmed = window.confirm('Delete this product? This action cannot be undone.');
    if (!confirmed) return;
    await deleteProduct(productId);
    navigate('/inventory/products');
  };

  const handlePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPolicyNotice(null);
    if (!productId) return;
    if (!validatePolicyForm()) return;

    const payload = {
      product: productId,
      warehouse: policyForm.warehouse,
      min_stock_level: String(policyForm.min_stock_level),
      reorder_qty: String(policyForm.reorder_qty),
      lead_time_days: Number(policyForm.lead_time_days),
      retrieval_method: policyForm.retrieval_method,
      safety_stock_qty: String(policyForm.safety_stock_qty),
      is_active: policyForm.is_active,
    };

    if (activePolicy?.id) {
      await updatePolicy(activePolicy.id, payload);
      setPolicyNotice('Reorder policy updated.');
      return;
    }

    await createPolicy(payload);
    setPolicyNotice('Reorder policy created.');
  };

  const handleDeletePolicy = async () => {
    if (!activePolicy?.id) return;
    const confirmed = window.confirm(
      'Delete this reorder policy? This action cannot be undone.',
    );
    if (!confirmed) return;

    await deletePolicy(activePolicy.id);
    setPolicyNotice('Reorder policy deleted.');
    setPolicyForm((prev) => ({
      ...prev,
      min_stock_level: '',
      reorder_qty: '',
      lead_time_days: '0',
      retrieval_method: 'FIFO',
      safety_stock_qty: '',
      is_active: true,
    }));
  };

  if (isLoading && !product) {
    return (
      <div className="products-page">
        <div className="products-content">
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading product...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-sticky-stack">
        <div className="products-page-header">
          <div>
            <button className="btn-back" type="button" onClick={() => navigate('/inventory/products')}>
              <ArrowLeft size={18} /> Back
            </button>
            <h1>Edit Product</h1>
            <p>Inventory / Products / {product?.sku || 'Detail'}</p>
          </div>

          <div className="detail-actions">
            <button className="btn-danger" type="button" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="products-content">
        <div className="create-product-page">
          {error && <div className="error-banner">{error}</div>}

          <div className="form-card">
            <h3 className="form-card__title">Product Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>SKU</label>
                <p>{product?.sku || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Reorder Policy</label>
                <p>{product?.has_reorder_policy ? 'Configured' : 'Not configured'}</p>
              </div>
              <div className="info-item">
                <label>Created</label>
                <p>{createdAt}</p>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <p>{lastUpdated}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-card">
              <h3 className="form-card__title">Edit Fields</h3>
              <div className="form-group">
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input name="category" value={formData.category} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange}>
                  <option value="">Select Unit</option>
                  {UNIT_OF_MEASURE.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Shelf Life Days</label>
                <input
                  type="number"
                  min="0"
                  name="shelf_life_days"
                  value={formData.shelf_life_days}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Storage Conditions</label>
                <select
                  name="storage_conditions"
                  value={formData.storage_conditions}
                  onChange={handleChange}
                >
                  <option value="">Select Storage Condition</option>
                  {STORAGE_CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Storage Notes</label>
                <textarea
                  rows={4}
                  name="storage_notes"
                  value={formData.storage_notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/inventory/products')}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <form onSubmit={handlePolicySubmit}>
            <div className="form-card" id="reorder-policy-section">
              <h3 className="form-card__title">Reorder Policy</h3>
              {policyError && <div className="error-banner">{policyError}</div>}
              {policyNotice && <div className="success-banner">{policyNotice}</div>}
              {isPolicyLoading && (
                <div className="loading-container">
                  <div className="spinner" />
                  <span>Loading reorder policy...</span>
                </div>
              )}

              <div className="form-group">
                <label>
                  Warehouse <span className="required">*</span>
                </label>
                <input
                  name="warehouse"
                  value={policyForm.warehouse}
                  onChange={handlePolicyChange}
                  placeholder="Warehouse ID"
                />
                {policyFieldErrors.warehouse && (
                  <span className="field-error">{policyFieldErrors.warehouse}</span>
                )}
              </div>

              <div className="policy-grid">
                <div className="form-group">
                  <label>
                    Min Stock Level <span className="required">*</span>
                  </label>
                  <input
                    name="min_stock_level"
                    value={policyForm.min_stock_level}
                    onChange={handlePolicyChange}
                  />
                  {policyFieldErrors.min_stock_level && (
                    <span className="field-error">{policyFieldErrors.min_stock_level}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Reorder Qty <span className="required">*</span>
                  </label>
                  <input
                    name="reorder_qty"
                    value={policyForm.reorder_qty}
                    onChange={handlePolicyChange}
                  />
                  {policyFieldErrors.reorder_qty && (
                    <span className="field-error">{policyFieldErrors.reorder_qty}</span>
                  )}
                </div>
              </div>

              <div className="policy-grid">
                <div className="form-group">
                  <label>
                    Lead Time Days <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="36500"
                    name="lead_time_days"
                    value={policyForm.lead_time_days}
                    onChange={handlePolicyChange}
                  />
                  {policyFieldErrors.lead_time_days && (
                    <span className="field-error">{policyFieldErrors.lead_time_days}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Retrieval Method</label>
                  <select
                    name="retrieval_method"
                    value={policyForm.retrieval_method}
                    onChange={handlePolicyChange}
                  >
                    <option value="FIFO">FIFO</option>
                    <option value="LIFO">LIFO</option>
                    <option value="FEFO">FEFO</option>
                  </select>
                </div>
              </div>

              <div className="policy-grid">
                <div className="form-group">
                  <label>
                    Safety Stock Qty <span className="required">*</span>
                  </label>
                  <input
                    name="safety_stock_qty"
                    value={policyForm.safety_stock_qty}
                    onChange={handlePolicyChange}
                  />
                  {policyFieldErrors.safety_stock_qty && (
                    <span className="field-error">{policyFieldErrors.safety_stock_qty}</span>
                  )}
                </div>
                <div className="form-group policy-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={policyForm.is_active}
                      onChange={handlePolicyChange}
                    />
                    Policy is active
                  </label>
                </div>
              </div>

              <div className="form-actions">
                {activePolicy?.id && (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={handleDeletePolicy}
                    disabled={isPolicyDeleting}
                  >
                    {isPolicyDeleting ? 'Deleting...' : 'Delete Policy'}
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={isPolicySaving}>
                  {isPolicySaving
                    ? 'Saving...'
                    : activePolicy?.id
                      ? 'Update Policy'
                      : 'Create Policy'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
