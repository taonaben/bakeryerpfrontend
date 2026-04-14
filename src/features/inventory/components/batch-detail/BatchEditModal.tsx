/**
 * Batch Edit Modal
 * Form for editing batch quantity, manufacture date, expiry date
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { BatchDetailResponse } from '../../types/batchDetail';
import useBatchDetailStore from '../../stores/batchDetailStore';

interface BatchEditModalProps {
  batch: BatchDetailResponse;
  isOpen: boolean;
  onClose: () => void;
}

const BatchEditModal: React.FC<BatchEditModalProps> = ({ batch, isOpen, onClose }) => {
  const updateBatch = useBatchDetailStore((state) => state.updateBatch);
  const isUpdating = useBatchDetailStore((state) => state.isUpdating);
  const updateError = useBatchDetailStore((state) => state.updateError);

  const [formData, setFormData] = useState({
    quantity: batch.quantity,
    manufacture_date: batch.manufacture_date,
    expiry_date: batch.expiry_date,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      quantity: batch.quantity,
      manufacture_date: batch.manufacture_date,
      expiry_date: batch.expiry_date,
    });
    setErrors({});
  }, [batch, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const qty = parseFloat(formData.quantity as any);
    if (isNaN(qty) || qty < 0) {
      newErrors.quantity = 'Quantity must be a non-negative number';
    }

    const mfgDate = new Date(formData.manufacture_date);
    if (isNaN(mfgDate.getTime())) {
      newErrors.manufacture_date = 'Invalid manufacture date';
    }

    const expDate = new Date(formData.expiry_date);
    if (isNaN(expDate.getTime())) {
      newErrors.expiry_date = 'Invalid expiry date';
    }

    if (mfgDate >= expDate) {
      newErrors.expiry_date = 'Expiry date must be after manufacture date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await updateBatch(batch.id, {
        quantity: parseFloat(formData.quantity as any),
        manufacture_date: formData.manufacture_date,
        expiry_date: formData.expiry_date,
      });
      onClose();
      // TODO: Show success toast
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Batch Details</h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close edit modal"
          >
            <X size={20} />
          </button>
        </div>

        {updateError && (
          <div className="error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{updateError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              disabled={isUpdating}
              aria-invalid={!!errors.quantity}
              className={errors.quantity ? 'input-error' : ''}
            />
            {errors.quantity && <span className="error-text">{errors.quantity}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="manufacture_date">Manufacture Date</label>
            <input
              id="manufacture_date"
              type="date"
              value={formData.manufacture_date}
              onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
              disabled={isUpdating}
              aria-invalid={!!errors.manufacture_date}
              className={errors.manufacture_date ? 'input-error' : ''}
            />
            {errors.manufacture_date && <span className="error-text">{errors.manufacture_date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expiry_date">Expiry Date</label>
            <input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              disabled={isUpdating}
              aria-invalid={!!errors.expiry_date}
              className={errors.expiry_date ? 'input-error' : ''}
            />
            {errors.expiry_date && <span className="error-text">{errors.expiry_date}</span>}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default BatchEditModal;
