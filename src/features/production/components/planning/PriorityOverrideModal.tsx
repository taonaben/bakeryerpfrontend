import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { PlannedOrderPriority } from '../../types/plannedOrderModel';

interface PriorityOverrideModalProps {
  isOpen: boolean;
  orderId: string;
  currentPriority: PlannedOrderPriority;
  productName: string;
  onRequestOverride: (priority: PlannedOrderPriority, note: string) => Promise<void>;
  onApproveOverride: () => Promise<void>;
  onRejectOverride: (reason: string) => Promise<void>;
  onClose: () => void;
  isRequesting?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
  canApprove?: boolean;
  hasOverrideRequested?: boolean;
  overrideNote?: string | null;
}

const PriorityOverrideModal: React.FC<PriorityOverrideModalProps> = ({
  isOpen,
  orderId,
  currentPriority,
  productName,
  onRequestOverride,
  onApproveOverride,
  onRejectOverride,
  onClose,
  isRequesting = false,
  isApproving = false,
  isRejecting = false,
  canApprove = false,
  hasOverrideRequested = false,
  overrideNote = null,
}) => {
  const [selectedPriority, setSelectedPriority] = useState<PlannedOrderPriority>(currentPriority);
  const [note, setNote] = useState(overrideNote || '');
  const [rejectReason, setRejectReason] = useState('');
  const [mode, setMode] = useState<'request' | 'approve' | 'reject'>('request');

  if (!isOpen) return null;

  const priorities: PlannedOrderPriority[] = ['low', 'medium', 'high'];
  const availablePriorities = priorities.filter((p) => p !== currentPriority);

  const handleRequest = async () => {
    try {
      await onRequestOverride(selectedPriority, note);
      onClose();
    } catch (error) {
      console.error('Failed to request override for order', orderId, error);
    }
  };

  const handleApprove = async () => {
    try {
      await onApproveOverride();
      onClose();
    } catch (error) {
      console.error('Failed to approve override for order', orderId, error);
    }
  };

  const handleReject = async () => {
    try {
      await onRejectOverride(rejectReason);
      onClose();
    } catch (error) {
      console.error('Failed to reject override for order', orderId, error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content priority-override-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Priority Override</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="order-info">
            <p className="order-info__label">Product</p>
            <p className="order-info__value">{productName}</p>
            <p className="order-info__label">Current Priority</p>
            <p className="order-info__value">
              <span className={`badge priority-${currentPriority}`}>{currentPriority}</span>
            </p>
          </div>

          {hasOverrideRequested && canApprove ? (
            <div className="modal-section">
              <h3 className="modal-section__title">Override Request Details</h3>
              {overrideNote && (
                <div className="override-note">
                  <p className="override-note__label">Request Note</p>
                  <p className="override-note__text">{overrideNote}</p>
                </div>
              )}

              <div className="button-group">
                <button
                  className="btn btn-success"
                  onClick={handleApprove}
                  disabled={isApproving}
                  type="button"
                >
                  {isApproving ? 'Approving...' : 'Approve Override'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => setMode('reject')}
                  disabled={isRejecting}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : hasOverrideRequested && !canApprove ? (
            <div className="modal-section">
              <div className="pending-notice">
                <p className="pending-notice__text">Priority override request is pending approval.</p>
                {overrideNote && (
                  <div className="override-note">
                    <p className="override-note__label">Your Request Note</p>
                    <p className="override-note__text">{overrideNote}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="modal-section">
              <h3 className="modal-section__title">Request Priority Change</h3>

              <div className="form-group">
                <label htmlFor="priority-select" className="form-label">
                  New Priority
                </label>
                <select
                  id="priority-select"
                  className="form-select"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as PlannedOrderPriority)}
                >
                  {availablePriorities.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="note-input" className="form-label">
                  Reason for Change (Optional)
                </label>
                <textarea
                  id="note-input"
                  className="form-textarea"
                  placeholder="Explain why this priority change is needed..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleRequest}
                disabled={isRequesting}
                type="button"
              >
                {isRequesting ? 'Requesting...' : 'Request Override'}
              </button>
            </div>
          )}

          {mode === 'reject' && canApprove && (
            <div className="modal-section">
              <h3 className="modal-section__title">Reject Override Request</h3>

              <div className="form-group">
                <label htmlFor="reject-reason" className="form-label">
                  Rejection Reason
                </label>
                <textarea
                  id="reject-reason"
                  className="form-textarea"
                  placeholder="Explain why this override request is being rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="button-group">
                <button
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isRejecting}
                  type="button"
                >
                  {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button className="btn btn-outline" onClick={() => setMode('request')} type="button">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriorityOverrideModal;
