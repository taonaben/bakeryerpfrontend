import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { FiscalPeriod } from '../../types/fiscal_periods_models';

interface ClosePeriodModalProps {
  period: FiscalPeriod | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const ClosePeriodModal: React.FC<ClosePeriodModalProps> = ({
  period,
  isSubmitting,
  onCancel,
  onConfirm,
}) => {
  if (!period) return null;

  return (
    <>
      <div className="finance-drawer-backdrop" onClick={onCancel} />
      <div className="finance-modal close-period-modal" role="dialog" aria-modal="true" aria-labelledby="close-period-title">
        <div className="finance-drawer__header">
          <div>
            <h2 id="close-period-title">Close Fiscal Period</h2>
            <p>{period.name}</p>
          </div>
          <button className="btn-icon" type="button" onClick={onCancel} aria-label="Cancel closing period">
            <X size={17} />
          </button>
        </div>

        <div className="finance-drawer__body">
          <div className="finance-confirmation-warning">
            <AlertTriangle size={24} />
            <div>
              <strong>This cannot be undone.</strong>
              <p>
                Closing this period will prevent any new entries being posted to it.
                This cannot be undone.
              </p>
            </div>
          </div>

          <div className="finance-drawer__footer">
            <button className="btn btn-outline" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-danger" type="button" onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'Closing...' : 'Close Period'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClosePeriodModal;
