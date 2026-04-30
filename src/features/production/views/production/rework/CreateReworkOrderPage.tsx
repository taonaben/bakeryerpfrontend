import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NoWarehouseSelected from '@/features/inventory/components/NoWarehouseSelected';
import { productService } from '@/features/inventory/services/productServices';
import type { Product } from '@/features/inventory/types/productModel';
import { useReworkOrderDetailStore } from '../../../stores';
import '../../../styles/production.css';

interface CreateReworkOrderPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

interface ReworkOrderFormState {
  target_product: string;
  quantity_requested: string;
  reason: string;
}

const INITIAL_STATE: ReworkOrderFormState = {
  target_product: '',
  quantity_requested: '',
  reason: '',
};

const CreateReworkOrderPage: React.FC<CreateReworkOrderPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const createOrder = useReworkOrderDetailStore((state) => state.createOrder);
  const isSaving = useReworkOrderDetailStore((state) => state.isSaving);
  const storeError = useReworkOrderDetailStore((state) => state.error);

  const [products, setProducts] = useState<Product[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [formData, setFormData] = useState<ReworkOrderFormState>(INITIAL_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadProducts = async () => {
      setReferenceLoading(true);
      try {
        const result = await productService.fetchProducts({ page: 1, page_size: 250 });
        setProducts(result.data);
      } catch (error: any) {
        setFormError(error.message || 'Failed to load products');
      } finally {
        setReferenceLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.target_product) errors.target_product = 'Target product is required';

    if (!formData.quantity_requested) {
      errors.quantity_requested = 'Quantity is required';
    } else if (Number(formData.quantity_requested) <= 0) {
      errors.quantity_requested = 'Quantity must be greater than 0';
    }

    if (!formData.reason.trim()) errors.reason = 'Reason is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!activeWarehouse?.id) {
      setFormError('A warehouse must be selected before creating a rework order');
      return;
    }

    if (!validateForm()) return;

    try {
      const created = await createOrder({
        target_product: formData.target_product,
        quantity_requested: Number(formData.quantity_requested),
        warehouse: activeWarehouse.id,
        reason: formData.reason.trim(),
      });

      // Next step is selecting input batches/quantities.
      navigate(`/production/rework/${created.id}`);
    } catch (error: any) {
      setFormError(error.message || 'Failed to create rework order');
    }
  };

  if (!activeWarehouse?.id) {
    return <NoWarehouseSelected onBack={() => navigate('/dashboard')} />;
  }

  return (
    <div className="production-page">
      <div className="production-content">
        <div className="production-form-layout">
          <div className="production-page-header production-page-header--stacked">
            <div className="production-page-header__left">
              <button
                className="btn btn-ghost production-back-link"
                onClick={() => navigate(-1)}
                type="button"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <h1>Create Rework Order</h1>
              <p className="production-page-header__breadcrumb">Production / Rework / New</p>
            </div>
          </div>

          {(formError || storeError) && <div className="error-banner">{formError || storeError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-card">
              <h2 className="form-card__title">Rework Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rework-product">
                    Target Product <span className="required">*</span>
                  </label>
                  <select
                    id="rework-product"
                    name="target_product"
                    value={formData.target_product}
                    onChange={handleChange}
                    disabled={referenceLoading || isSaving}
                  >
                    <option value="">
                      {referenceLoading ? 'Loading products...' : 'Select product'}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.target_product && (
                    <span className="field-error">{fieldErrors.target_product}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rework-quantity">
                    Quantity Requested <span className="required">*</span>
                  </label>
                  <input
                    id="rework-quantity"
                    type="number"
                    min="0"
                    step="any"
                    name="quantity_requested"
                    value={formData.quantity_requested}
                    onChange={handleChange}
                    placeholder="0"
                    disabled={isSaving}
                  />
                  {fieldErrors.quantity_requested && (
                    <span className="field-error">{fieldErrors.quantity_requested}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rework-warehouse">Warehouse</label>
                  <input id="rework-warehouse" type="text" value={activeWarehouse.name} readOnly disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rework-reason">
                    Reason <span className="required">*</span>
                  </label>
                  <textarea
                    id="rework-reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g. Incorrect packaging, off-spec weight, returns, damaged batch..."
                    disabled={isSaving}
                    rows={4}
                  />
                  {fieldErrors.reason && <span className="field-error">{fieldErrors.reason}</span>}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/production/rework')}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || referenceLoading}
              >
                {isSaving ? 'Creating...' : 'Create Rework Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReworkOrderPage;
