import React, { useState, useEffect } from 'react';
import { Package, X } from 'lucide-react';
import { useSupplierDetailStore } from '../../stores/supplierDetailStore';
import { useProductStore } from '../../../../core/products/stores/productStore';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, supplierId }) => {
  const [productId, setProductId] = useState<string>('');
  const [price, setPrice] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('');
  const [isPreferred, setIsPreferred] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isAddingProduct = useSupplierDetailStore((s) => s.isAddingProduct);
  const addProduct = useSupplierDetailStore((s) => s.addProduct);

  const products = useProductStore((s) => s.products);
  const productsLoading = useProductStore((s) => s.loading);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    if (isOpen) fetchProducts();
  }, [isOpen, fetchProducts]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!productId) errs.productId = 'Please select a product.';
    if (!price.trim()) errs.price = 'Price is required.';
    else if (isNaN(Number(price)) || Number(price) < 0) errs.price = 'Enter a valid price.';
    if (leadTimeDays && (isNaN(Number(leadTimeDays)) || Number(leadTimeDays) < 0)) {
      errs.leadTimeDays = 'Enter a valid number of days.';
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      setSubmitError(null);
      await addProduct(supplierId, {
        product_id: productId,
        price: price.trim(),
        ...(leadTimeDays ? { lead_time_days: Number(leadTimeDays) } : {}),
        is_preferred: isPreferred,
      });
      handleClose();
    } catch {
      setSubmitError('Failed to add product. Please try again.');
    }
  };

  const handleClose = () => {
    setProductId('');
    setPrice('');
    setLeadTimeDays('');
    setIsPreferred(false);
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-product-title">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} style={{ color: '#566d7e' }} />
            <h2 id="add-product-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Add Product to Supplier
            </h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {submitError && <div className="modal-error">{submitError}</div>}

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="product-id">
                Product <span className="required">*</span>
              </label>
              <select
                id="product-id"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={productsLoading}
              >
                <option value="">
                  {productsLoading ? 'Loading products…' : '— Select a product —'}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              {errors.productId && <div className="field-error">{errors.productId}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="product-price">
                Unit Price <span className="required">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
              {errors.price && <div className="field-error">{errors.price}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="lead-time">Lead Time (days)</label>
              <input
                id="lead-time"
                type="number"
                min="0"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                placeholder="e.g. 7"
              />
              {errors.leadTimeDays && <div className="field-error">{errors.leadTimeDays}</div>}
            </div>

            <div
              className="form-group"
              style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: 400,
                }}
              >
                <input
                  type="checkbox"
                  checked={isPreferred}
                  onChange={(e) => setIsPreferred(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                Mark as preferred supplier for this product
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose} disabled={isAddingProduct}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isAddingProduct}>
            {isAddingProduct ? 'Adding…' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
