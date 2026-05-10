import React from 'react';
import { Archive, Pencil, PauseCircle, PlayCircle, PowerOff, Trash2 } from 'lucide-react';
import type { Formula } from '../types/models';

interface FormulaDetailHeaderProps {
  formula: Formula;
  isBusy?: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onArchive: () => void;
  onDeactivate: () => void;
  onPutOnHold: () => void;
  onReleaseHold: () => void;
  onDelete: () => void;
}

const statusLabel = (status: string) => status.replace(/_/g, ' ');

const FormulaDetailHeader: React.FC<FormulaDetailHeaderProps> = ({
  formula,
  isBusy = false,
  onEdit,
  onActivate,
  onArchive,
  onDeactivate,
  onPutOnHold,
  onReleaseHold,
  onDelete,
}) => {
  return (
    <section className="formula-detail-summary">
      <div className="formula-detail-summary__main">
        <div className="formula-detail-summary__meta">
          <span>FRM-{formula.id.slice(0, 4).toUpperCase()}</span>
          <span>.</span>
          <span>Rev {formula.revision}</span>
        </div>
        <div className="formula-detail-summary__title-row">
          <h1>{formula.name}</h1>
          <span className={`badge formula-status ${formula.status.replace(/_/g, '-')}`}>
            {statusLabel(formula.status)}
          </span>
        </div>
        <div className="formula-detail-summary__stats">
          <div>
            <span className="formula-detail-summary__label">Batch size</span>
            <strong>{formula.batch_size.toLocaleString()}</strong>
          </div>
          <div>
            <span className="formula-detail-summary__label">Yield</span>
            <strong>{formula.yield_percentage}%</strong>
          </div>
          <div>
            <span className="formula-detail-summary__label">Status</span>
            <strong>{statusLabel(formula.status)}</strong>
          </div>
        </div>
      </div>

      <div className="formula-detail-summary__actions">
        <button type="button" className="btn btn-primary" onClick={onEdit} disabled={isBusy}>
          <Pencil size={16} />
          Edit
        </button>
        {formula.status !== 'active' && (
          <button type="button" className="btn btn-outline" onClick={onActivate} disabled={isBusy}>
            <PlayCircle size={16} />
            Activate
          </button>
        )}
        {formula.status !== 'on_hold' ? (
          <button type="button" className="btn btn-outline" onClick={onPutOnHold} disabled={isBusy}>
            <PauseCircle size={16} />
            Hold
          </button>
        ) : (
          <button type="button" className="btn btn-outline" onClick={onReleaseHold} disabled={isBusy}>
            <PlayCircle size={16} />
            Release Hold
          </button>
        )}
        {formula.status !== 'archived' && (
          <button type="button" className="btn btn-outline" onClick={onArchive} disabled={isBusy}>
            <Archive size={16} />
            Archive
          </button>
        )}
        {formula.status !== 'deactivated' && formula.status !== 'inactive' && (
          <button type="button" className="btn btn-outline" onClick={onDeactivate} disabled={isBusy}>
            <PowerOff size={16} />
            Deactivate
          </button>
        )}
        <button type="button" className="btn btn-outline formula-danger-btn" onClick={onDelete} disabled={isBusy}>
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </section>
  );
};

export default FormulaDetailHeader;
