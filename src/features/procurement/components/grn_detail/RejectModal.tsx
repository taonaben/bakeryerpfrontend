import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RejectModalProps {
  onClose: () => void;
  onReject: (reason: string) => void;
  isRejecting: boolean;
}

const RejectModal: React.FC<RejectModalProps> = ({ onClose, onReject, isRejecting }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    onReject(reason);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reject Goods Receipt</h2>
          <button onClick={onClose} className="modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="rejection-reason">
                Rejection Reason <span className="required">*</span>
              </label>
              <textarea
                id="rejection-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for rejecting this goods receipt..."
                rows={4}
                required
                disabled={isRejecting}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isRejecting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isRejecting || !reason.trim()}
            >
              {isRejecting ? 'Rejecting...' : 'Reject Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
