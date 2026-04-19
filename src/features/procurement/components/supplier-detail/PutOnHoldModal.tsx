import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useSupplierDetailStore } from '../../stores/supplierDetailStore';

interface PutOnHoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
  supplierName: string;
}

const PutOnHoldModal: React.FC<PutOnHoldModalProps> = ({
  isOpen,
  onClose,
  supplierId,
  supplierName,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isPuttingOnHold = useSupplierDetailStore((s) => s.isPuttingOnHold);
  const putOnHold = useSupplierDetailStore((s) => s.putOnHold);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('A reason is required to put a supplier on hold.');
      return;
    }
    try {
      setError(null);
      await putOnHold(supplierId, reason.trim());
      setReason('');
      onClose();
    } catch {
      setError('Failed to put supplier on hold. Please try again.');
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="put-on-hold-title">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: '#d97706' }} />
            <h2 id="put-on-hold-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Put Supplier On Hold
            </h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="modal-description">
            Placing <strong>{supplierName}</strong> on hold will block new Purchase Orders from being raised
            against them. Existing open POs can still be received against.
          </p>

          {error && <div className="modal-error">{error}</div>}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="hold-reason">
              Reason <span className="required">*</span>
            </label>
            <textarea
              id="hold-reason"
              rows={4}
              placeholder="e.g. Expired tax clearance certificate — awaiting renewal submission"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose} disabled={isPuttingOnHold}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isPuttingOnHold}
            style={{ background: '#d97706', borderColor: '#d97706' }}
          >
            {isPuttingOnHold ? 'Placing On Hold…' : 'Put On Hold'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PutOnHoldModal;
