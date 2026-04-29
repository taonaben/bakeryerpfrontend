/**
 * EditSupplierProductModal
 * Updates price, lead time, preferred flag, or active flag via
 * PATCH /purchasing/supplier-products/<id>/
 */

import React, { useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import { useSupplierProductsStore } from '../../stores/supplierProductsStore';
import type { SupplierProduct } from '../../types/models';

interface EditSupplierProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SupplierProduct;
}

const EditSupplierProductModal: React.FC<EditSupplierProductModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [price, setPrice] = useState(item.price);
  const [leadTimeDays, setLeadTimeDays] = useState(String(item.lead_time_days ?? ''));
  const [isPreferred, setIsPreferred] = useState(item.is_preferred);
  const [isActive, setIsActive] = useState(item.is_active);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSaving = useSupplierProductsStore((s) => s.isSaving);
  const updateSupplierProduct = useSupplierProductsStore((s) => s.updateSupplierProduct);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
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
      await updateSupplierProduct(item.id, {
        price: price.trim(),
        lead_time_days: leadTimeDays ? Number(leadTimeDays) : undefined,
        is_preferred: isPreferred,
        is_active: isActive,
      });
      onClose();
    } catch {
      setSubmitError('Failed to update. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-sp-title">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit2 size={18} style={{ color: '#566d7e' }} />
            <h2 id="edit-sp-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Edit Supplier Pricing
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {submitError && <div className="modal-error">{submitError}</div>}

          {/* Supplier info (read-only) */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.88rem',
            }}
          >
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.supplier_name}</div>
            <div style={{ color: '#64748b', marginTop: '2px' }}>
              Product: {item.product_name}
            </div>
          </div>

          <div className="form-row">
            {/* Price */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="edit-price">
                Unit Price <span className="required">*</span>
              </label>
              <input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              {errors.price && <div className="field-error">{errors.price}</div>}
            </div>

            {/* Lead time */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="edit-lead-time">Lead Time (days)</label>
              <input
                id="edit-lead-time"
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
              Preferred supplier for this product
            </label>
          </div>

          {/* Active */}
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
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: 'auto' }}
              />
              Active
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSupplierProductModal;
