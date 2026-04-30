/**
 * Movement Side Panel Actions
 * Sticky sidebar showing movement metadata and action buttons
 * 
 * Read-only display with Delete action available
 */

import React, { useState } from 'react';
import { Copy, Trash2, AlertCircle } from 'lucide-react';
import { StockMovementDetailResponse } from '../../types/stockMovementDetail';
import useStockMovementDetailStore from '../../stores/stockMovementDetailStore';
import { useNavigate } from 'react-router-dom';
import { RoleGuard } from '../../../../shared/components/RoleGuard';

interface MovementSidePanelActionsProps {
  movement: StockMovementDetailResponse;
}

const MovementSidePanelActions: React.FC<MovementSidePanelActionsProps> = ({ movement }) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMovement = useStockMovementDetailStore((state) => state.deleteMovement);
  const deleteError = useStockMovementDetailStore((state) => state.deleteError);

  const getMovementTypeColor = (type: string): string => {
    switch (type) {
      case 'IN':
        return 'movement-type-in';
      case 'OUT':
        return 'movement-type-out';
      case 'ADJUSTMENT':
        return 'movement-type-adjustment';
      default:
        return 'movement-type-neutral';
    }
  };

  const getMovementTypeLabel = (type: string): string => {
    switch (type) {
      case 'IN':
        return 'Stock In';
      case 'OUT':
        return 'Stock Out';
      case 'ADJUSTMENT':
        return 'Adjustment';
      default:
        return type;
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(movement.id);
    // TODO: Show toast notification
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMovement(movement.id);
      navigate('/inventory');
    } catch (error) {
      // Error handled by store
      console.error('Delete failed:', error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="side-panel__header">
        <h1 className="side-panel__title">
          <span className={`movement-badge ${getMovementTypeColor(movement.movement_type)}`}>
            {getMovementTypeLabel(movement.movement_type)}
          </span>
        </h1>
      </div>

      {/* Metadata */}
      <div className="side-panel__metadata">
        <div className="metadata-item">
          <label>Movement ID</label>
          <div className="metadata-value-with-action">
            <code className="batch-id">{movement.id.slice(0, 8)}...</code>
            <button
              onClick={handleCopyId}
              className="icon-btn"
              title="Copy full ID"
              aria-label="Copy movement ID"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="metadata-item">
          <label>Type</label>
          <div className={`metadata-value badge ${getMovementTypeColor(movement.movement_type)}`}>
            {getMovementTypeLabel(movement.movement_type)}
          </div>
        </div>

        <div className="metadata-item">
          <label>Reference</label>
          <div className="metadata-value">
            <code>{movement.reference_number || '---'}</code>
          </div>
        </div>

        <div className="metadata-item">
          <label>Total Quantity</label>
          <div
            className="metadata-value"
            style={{ fontWeight: '700', color: movement.total_quantity < 0 ? '#ef4444' : '#10b981' }}
          >
            {typeof movement.total_quantity === 'string'
              ? parseFloat(movement.total_quantity).toLocaleString()
              : movement.total_quantity.toLocaleString()}
          </div>
        </div>

        <div className="metadata-item">
          <label>Created</label>
          <div className="metadata-value text-muted">
            {new Date(movement.created_at).toLocaleDateString()} at{' '}
            {new Date(movement.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {movement.updated_at && (
          <div className="metadata-item">
            <label>Last Updated</label>
            <div className="metadata-value text-muted">
              {new Date(movement.updated_at).toLocaleDateString()} at{' '}
              {new Date(movement.updated_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="side-panel__actions">
        <RoleGuard requiredPermission="inventory.delete_movement">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="btn btn-danger btn-block"
            title="Delete this stock movement"
          >
            <Trash2 size={16} />
            Delete Movement
          </button>
        </RoleGuard>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => !isDeleting && setShowDeleteConfirm(false)}>
          <div className="modal-content modal-danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <AlertCircle size={24} className="modal-icon-danger" />
              <h2>Delete Stock Movement?</h2>
            </div>

            <div className="modal-body">
              <p>
                This action will permanently delete the stock movement <code>{movement.reference_number}</code>.
              </p>
              <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '12px' }}>
                This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="modal-error" role="alert">
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovementSidePanelActions;
