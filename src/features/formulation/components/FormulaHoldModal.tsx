import React, { useEffect, useState } from 'react';

interface FormulaHoldModalProps {
  isOpen: boolean;
  formulaName: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

const FormulaHoldModal: React.FC<FormulaHoldModalProps> = ({
  isOpen,
  formulaName,
  isSubmitting = false,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setReason('');
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError('Hold reason is required');
      return;
    }

    try {
      await onConfirm(reason.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to put formula on hold');
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !isSubmitting && onClose()}>
      <div className="modal-content formulation-hold-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Put Formula On Hold</h3>
          <button type="button" className="modal-close" onClick={onClose} disabled={isSubmitting}>
            x
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="formulation-helper-text">
            Add a reason for putting <strong>{formulaName}</strong> on hold.
          </p>
          {error && <div className="error-banner">{error}</div>}
          <div className="form-group">
            <label htmlFor="formula-hold-reason">
              Reason <span className="required">*</span>
            </label>
            <textarea
              id="formula-hold-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this formula is being held..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Confirm Hold'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormulaHoldModal;
