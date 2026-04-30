import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useUserStore } from '@/features/auth/stores/userStore';

import { productService } from '../../services/productServices';
import { UNIT_OF_MEASURE, STORAGE_CONDITIONS, PRODUCT_CATEGORIES } from '../../constants/products';
import type { ProductUnitOfMeasure, ProductStorageCondition } from '../../types/productModel';
import '../../styles/products.css';

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit_of_measure: '',
    shelf_life_days: '',
    storage_conditions: '',
    storage_notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.unit_of_measure) errors.unit_of_measure = 'Unit of measure is required';
    if (!formData.shelf_life_days) errors.shelf_life_days = 'Shelf life is required';
    if (Number(formData.shelf_life_days) < 0) errors.shelf_life_days = 'Shelf life must be positive';
    if (!formData.storage_conditions) errors.storage_conditions = 'Storage conditions are required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    const companyId = user?.company;
    if (!companyId) {
      setFormError('Company not found in user session');
      return;
    }

    setSubmitting(true);
    try {
      await productService.createProduct({
        name: formData.name,
        company: companyId,
        category: formData.category,
        unit_of_measure: formData.unit_of_measure as ProductUnitOfMeasure,
        shelf_life_days: Number(formData.shelf_life_days),
        storage_conditions: formData.storage_conditions as ProductStorageCondition,
        storage_notes: formData.storage_notes || undefined,
      });
      navigate('/inventory/products');
    } catch (error: any) {
      setFormError(error.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="products-page">
      <div className="products-content">
        <div className="products-form-layout">
          <div className="products-page-header products-page-header--stacked">
            <div className="products-page-header__left">
              <button
                className="btn btn-ghost products-back-link"
                onClick={() => navigate('/inventory/products')}
                type="button"
              >
                <ArrowLeft size={16} /> Back to Products
              </button>
              <h1>Create Product</h1>
              <p className="products-page-header__breadcrumb">
                Inventory / Products / New
              </p>
            </div>
          </div>

          {formError && <div className="error-banner">{formError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-card">
              <h2 className="form-card__title">Product Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product-name">
                    Product Name <span className="required">*</span>
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    disabled={submitting}
                  />
                  {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="product-category">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="product-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">Select Category</option>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product-unit">
                    Unit of Measure <span className="required">*</span>
                  </label>
                  <select
                    id="product-unit"
                    name="unit_of_measure"
                    value={formData.unit_of_measure}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">Select Unit</option>
                    {UNIT_OF_MEASURE.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.unit_of_measure && (
                    <span className="field-error">{fieldErrors.unit_of_measure}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="product-shelf-life">
                    Shelf Life (days) <span className="required">*</span>
                  </label>
                  <input
                    id="product-shelf-life"
                    type="number"
                    name="shelf_life_days"
                    value={formData.shelf_life_days}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    disabled={submitting}
                  />
                  {fieldErrors.shelf_life_days && (
                    <span className="field-error">{fieldErrors.shelf_life_days}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="product-storage-condition">
                  Storage Conditions <span className="required">*</span>
                </label>
                <select
                  id="product-storage-condition"
                  name="storage_conditions"
                  value={formData.storage_conditions}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="">Select Storage Condition</option>
                  {STORAGE_CONDITIONS.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.storage_conditions && (
                  <span className="field-error">{fieldErrors.storage_conditions}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="product-storage-notes">Storage Notes</label>
                <textarea
                  id="product-storage-notes"
                  name="storage_notes"
                  value={formData.storage_notes}
                  onChange={handleChange}
                  placeholder="e.g., Keep away from moisture, avoid direct sunlight..."
                  rows={4}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/inventory/products')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;
