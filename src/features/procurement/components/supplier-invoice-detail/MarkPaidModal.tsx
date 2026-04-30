import React, { useState } from 'react';
import { X } from 'lucide-react';
import useSupplierInvoicesDetailStore from '../../stores/supplierInvoicesDetailStore';

interface MarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
}

const MarkPaidModal: React.FC<MarkPaidModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
}) => {
  const [paymentReference, setPaymentReference] = useState('');
  const [error, setError] = useState('');
  const isMarkingPaid = useSupplierInvoicesDetailStore((s) => s.isMarkingPaid);
  const markInvoicePaid = useSupplierInvoicesDetailStore((s) => s.markInvoicePaid);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!paymentReference.trim()) {
      setError('Payment reference is required');
      return;
    }

    try {
      await markInvoicePaid(invoiceId, paymentReference.trim());
      setPaymentReference('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to mark supplier invoice as paid');
    }
  };

  const handleClose = () => {
    if (isMarkingPaid) return;
    setPaymentReference('');
    setError('');
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Mark Invoice as Paid</h2>
          <button className="modal-close-btn" onClick={handleClose} type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <p className="modal-description">
            Marking <strong>{invoiceNumber}</strong> as paid. Enter the payment reference used for this settlement.
          </p>

          {error && <div className="modal-error" role="alert">{error}</div>}

          <div className="form-group">
            <label>
              Payment Reference <span className="required">*</span>
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(event) => setPaymentReference(event.target.value)}
              placeholder="e.g. EFT-2026-00124"
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={isMarkingPaid}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isMarkingPaid || !paymentReference.trim()}>
              {isMarkingPaid ? 'Saving...' : 'Mark Paid'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default MarkPaidModal;
