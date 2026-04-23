/**
 * Reject Modal — Requisition Detail
 * Modal with textarea for rejection reason (required)
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import useRequisitionDetailStore from '../../stores/requisitionDetailStore';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisitionId: string;
  prNumber: string;
}

const RejectModal: React.FC<RejectModalProps> = ({ isOpen, onClose, requisitionId, prNumber }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const isRejecting = useRequisitionDetailStore((s) => s.isRejecting);
  const rejectRequisition = useRequisitionDetailStore((s) => s.rejectRequisition);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    try {
      await rejectRequisition(requisitionId, reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject requisition');
    }
  };

  const handleClose = () => {
    if (!isRejecting) {
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Reject Requisition</h2>
          <button className="modal-close-btn" onClick={handleClose} type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <p className="modal-description">
            Rejecting <strong>{prNumber}</strong>. Please provide a reason for the rejection.
          </p>

          {error && (
            <div className="modal-error" role="alert">{error}</div>
          )}

          <div className="form-group">
            <label>
              Reason <span className="required">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason…"
              rows={4}
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={isRejecting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={isRejecting || !reason.trim()}>
              {isRejecting ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RejectModal;
