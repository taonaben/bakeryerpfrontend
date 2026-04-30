/**
 * AddSupplierModal
 * Adds a supplier to a product's catalogue via
 * POST /purchasing/supplier-products/?product_id=<uuid>
 */

import React, { useEffect, useState } from 'react';
import { X, Package } from 'lucide-react';
import { useSupplierProductsStore } from '../../stores/supplierProductsStore';
import { supplierService } from '../../services/suppliers_services';
import type { Supplier } from '../../types/models';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, productId }) => {
  const [supplierId, setSupplierId] = useState('');
  const [price, setPrice] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('');
  const [isPreferred, setIsPreferred] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  const isSaving = useSupplierProductsStore((s) => s.isSaving);
  const createSupplierProduct = useSupplierProductsStore((s) => s.createSupplierProduct);

  useEffect(() => {
    if (!isOpen) return;
    setSuppliersLoading(true);
    supplierService
      .fetchSuppliers({ is_active: 'true' })
      .then((res) => setSuppliers(res.data))
      .catch(() => setSuppliers([]))
      .finally(() => setSuppliersLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!supplierId) errs.supplierId = 'Please select a supplier.';
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
      await createSupplierProduct(productId, {
        supplier_id: supplierId,
        price: price.trim(),
        ...(leadTimeDays ? { lead_time_days: Number(leadTimeDays) } : {}),
        is_preferred: isPreferred,
      });
      handleClose();
    } catch {
      setSubmitError('Failed to add supplier. Please try again.');
    }
  };

  const handleClose = () => {
    setSupplierId('');
    setPrice('');
    setLeadTimeDays('');
    setIsPreferred(false);
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-supplier-title">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} style={{ color: '#566d7e' }} />
            <h2 id="add-supplier-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Add Supplier to Product
            </h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {submitError && <div className="modal-error">{submitError}</div>}

          {/* Supplier select */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="supplier-select">
              Supplier <span className="required">*</span>
            </label>
            <select
              id="supplier-select"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={suppliersLoading}
            >
              <option value="">
                {suppliersLoading ? 'Loading suppliers…' : '— Select a supplier —'}
              </option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.supplierId && <div className="field-error">{errors.supplierId}</div>}
          </div>

          <div className="form-row">
            {/* Price */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="sp-price">
                Unit Price <span className="required">*</span>
              </label>
              <input
                id="sp-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
              {errors.price && <div className="field-error">{errors.price}</div>}
            </div>

            {/* Lead time */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="sp-lead-time">Lead Time (days)</label>
              <input
                id="sp-lead-time"
                type="number"
                min="0"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                placeholder="e.g. 3"
              />
              {errors.leadTimeDays && <div className="field-error">{errors.leadTimeDays}</div>}
            </div>
          </div>

          {/* Preferred */}
          <div className="form-group" style={{ marginBottom: 0 }}>
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
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Any existing preferred supplier will be automatically demoted.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose} disabled={isSaving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Adding…' : 'Add Supplier'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierModal;
