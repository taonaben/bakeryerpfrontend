import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NoWarehouseSelected from '@/features/inventory/components/NoWarehouseSelected';
import { productService } from '@/features/inventory/services/productServices';
import { formulationService } from '@/features/formulation/services/formulationService';
import { useProductionOrderDetailStore } from '../../../stores';
import type { Product } from '@/features/inventory/types/productModel';
import type { Formula } from '@/features/formulation/types/models';
import '../../../styles/production.css';

interface CreateProductionOrderPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

interface ProductionOrderFormState {
  product: string;
  quantity: string;
  formula: string;
  scheduled_start: string;
  scheduled_end: string;
}

const INITIAL_FORM_STATE: ProductionOrderFormState = {
  product: '',
  quantity: '',
  formula: '',
  scheduled_start: '',
  scheduled_end: '',
};

const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoDateTime = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
};

const CreateProductionOrderPage: React.FC<CreateProductionOrderPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const createOrder = useProductionOrderDetailStore((state) => state.createOrder);
  const isSaving = useProductionOrderDetailStore((state) => state.isSaving);
  const storeError = useProductionOrderDetailStore((state) => state.error);

  const [products, setProducts] = useState<Product[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [formData, setFormData] = useState<ProductionOrderFormState>(() => {
    const start = new Date();
    const end = new Date(start.getTime() + 8 * 60 * 60 * 1000);

    return {
      ...INITIAL_FORM_STATE,
      scheduled_start: formatDateTimeLocal(start),
      scheduled_end: formatDateTimeLocal(end),
    };
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadReferences = async () => {
      setReferenceLoading(true);
      try {
        const [productResult, formulaResult] = await Promise.all([
          productService.fetchProducts({ page: 1, page_size: 100 }),
          formulationService.fetchFormulas({ status: 'active', page: 1, page_size: 100 }),
        ]);

        setProducts(productResult.data);
        setFormulas(formulaResult.data);
      } catch (error: any) {
        setFormError(error.message || 'Failed to load reference data');
      } finally {
        setReferenceLoading(false);
      }
    };

    loadReferences();
  }, []);

  const availableFormulas = useMemo(() => {
    if (!formData.product) return formulas;
    return formulas.filter((formula) => formula.product === formData.product);
  }, [formData.product, formulas]);

  useEffect(() => {
    if (!formData.formula) return;

    const formulaStillAvailable = availableFormulas.some((formula) => formula.id === formData.formula);
    if (!formulaStillAvailable) {
      setFormData((prev) => ({ ...prev, formula: '' }));
    }
  }, [availableFormulas, formData.formula]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.product) errors.product = 'Product is required';
    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (Number(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.formula) errors.formula = 'Formula is required';
    if (!formData.scheduled_start) errors.scheduled_start = 'Scheduled start is required';
    if (!formData.scheduled_end) {
      errors.scheduled_end = 'Scheduled end is required';
    } else if (
      formData.scheduled_start &&
      new Date(formData.scheduled_end).getTime() <= new Date(formData.scheduled_start).getTime()
    ) {
      errors.scheduled_end = 'Scheduled end must be after scheduled start';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!activeWarehouse?.id) {
      setFormError('A warehouse must be selected before creating a production order');
      return;
    }

    if (!validateForm()) return;

    try {
      await createOrder({
        product: formData.product,
        quantity: Number(formData.quantity),
        formula: formData.formula,
        warehouse: activeWarehouse.id,
        scheduled_start: toIsoDateTime(formData.scheduled_start),
        scheduled_end: toIsoDateTime(formData.scheduled_end),
      });

      navigate('/production/orders');
    } catch (error: any) {
      setFormError(error.message || 'Failed to create production order');
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
                onClick={() => navigate('/production/orders')}
                type="button"
              >
                <ArrowLeft size={16} />
                Back to Production Orders
              </button>
              <h1>Create Production Order</h1>
              <p className="production-page-header__breadcrumb">
                Production / Orders / New
              </p>
            </div>
          </div>

          {(formError || storeError) && (
            <div className="error-banner">{formError || storeError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-card">
              <h2 className="form-card__title">Order Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="production-product">
                    Product <span className="required">*</span>
                  </label>
                  <select
                    id="production-product"
                    name="product"
                    value={formData.product}
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
                  {fieldErrors.product && <span className="field-error">{fieldErrors.product}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="production-quantity">
                    Quantity <span className="required">*</span>
                  </label>
                  <input
                    id="production-quantity"
                    type="number"
                    min="0"
                    step="any"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    disabled={isSaving}
                  />
                  {fieldErrors.quantity && <span className="field-error">{fieldErrors.quantity}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="production-formula">
                    Formula <span className="required">*</span>
                  </label>
                  <select
                    id="production-formula"
                    name="formula"
                    value={formData.formula}
                    onChange={handleChange}
                    disabled={referenceLoading || isSaving}
                  >
                    <option value="">
                      {referenceLoading ? 'Loading formulas...' : 'Select formula'}
                    </option>
                    {availableFormulas.map((formula) => (
                      <option key={formula.id} value={formula.id}>
                        {formula.name} (Rev {formula.revision})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.formula && <span className="field-error">{fieldErrors.formula}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="production-warehouse">Warehouse</label>
                  <input
                    id="production-warehouse"
                    type="text"
                    value={activeWarehouse.name}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="production-start">
                    Scheduled Start <span className="required">*</span>
                  </label>
                  <input
                    id="production-start"
                    type="datetime-local"
                    name="scheduled_start"
                    value={formData.scheduled_start}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                  {fieldErrors.scheduled_start && (
                    <span className="field-error">{fieldErrors.scheduled_start}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="production-end">
                    Scheduled End <span className="required">*</span>
                  </label>
                  <input
                    id="production-end"
                    type="datetime-local"
                    name="scheduled_end"
                    value={formData.scheduled_end}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                  {fieldErrors.scheduled_end && (
                    <span className="field-error">{fieldErrors.scheduled_end}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/production/orders')}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || referenceLoading}
              >
                {isSaving ? 'Creating...' : 'Create Production Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductionOrderPage;
