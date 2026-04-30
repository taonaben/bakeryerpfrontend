import React, { useState } from 'react';
import { X } from 'lucide-react';
import useSupplierInvoicesDetailStore from '../../stores/supplierInvoicesDetailStore';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
}

const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const isRejecting = useSupplierInvoicesDetailStore((s) => s.isRejecting);
  const rejectInvoice = useSupplierInvoicesDetailStore((s) => s.rejectInvoice);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    try {
      await rejectInvoice(invoiceId, reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject supplier invoice');
    }
  };

  const handleClose = () => {
    if (isRejecting) return;
    setReason('');
    setError('');
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Reject Supplier Invoice</h2>
          <button className="modal-close-btn" onClick={handleClose} type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <p className="modal-description">
            Rejecting <strong>{invoiceNumber}</strong>. Please provide a reason for the rejection.
          </p>

          {error && <div className="modal-error" role="alert">{error}</div>}

          <div className="form-group">
            <label>
              Reason <span className="required">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={isRejecting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={isRejecting || !reason.trim()}>
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RejectModal;
