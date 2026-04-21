import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { productService } from '../../services/productServices';
import { UNIT_OF_MEASURE, STORAGE_CONDITIONS } from '../../constants/products';
import '../../styles/products.css';

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
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

    setSubmitting(true);
    try {
      await productService.createProduct({
        name: formData.name,
        category: formData.category,
        unit_of_measure: formData.unit_of_measure,
        shelf_life_days: Number(formData.shelf_life_days),
        storage_conditions: formData.storage_conditions,
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
      <div className="products-sticky-stack">
        <div className="products-page-header">
          <div>
            <button
              className="btn-back"
              onClick={() => navigate('/inventory/products')}
              type="button"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <h1>Create New Product</h1>
            <p>Inventory / Products / New</p>
          </div>
        </div>
      </div>

      <div className="products-content">
        <div className="create-product-page">
          {formError && <div className="error-banner">{formError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-card">
              <h3 className="form-card__title">Product Information</h3>

              <div className="form-group">
                <label>
                  Product Name <span className="required">*</span>
                </label>
                <input
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
                <label>
                  Category <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Bakery, Ingredients, Packaging"
                  disabled={submitting}
                />
                {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
              </div>

              <div className="form-group">
                <label>
                  Unit of Measure <span className="required">*</span>
                </label>
                <select
                  name="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="">Select Unit</option>
                  {UNIT_OF_MEASURE.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {fieldErrors.unit_of_measure && (
                  <span className="field-error">{fieldErrors.unit_of_measure}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Shelf Life (days) <span className="required">*</span>
                </label>
                <input
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

              <div className="form-group">
                <label>
                  Storage Conditions <span className="required">*</span>
                </label>
                <select
                  name="storage_conditions"
                  value={formData.storage_conditions}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="">Select Storage Condition</option>
                  {STORAGE_CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </option>
                  ))}
                </select>
                {fieldErrors.storage_conditions && (
                  <span className="field-error">{fieldErrors.storage_conditions}</span>
                )}
              </div>

              <div className="form-group">
                <label>Storage Notes</label>
                <textarea
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
                className="btn-secondary"
                onClick={() => navigate('/inventory/products')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
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
