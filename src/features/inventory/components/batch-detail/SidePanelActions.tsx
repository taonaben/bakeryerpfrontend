/**
 * Side Panel Actions
 * Sticky sidebar showing batch metadata and action buttons
 */

import React, { useState } from 'react';
import { Copy, Trash2, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { BatchDetailResponse } from '../../types/batchDetail';
import { getExpiryStatus } from '../../utils/getExpiryStatus';
import { RoleGuard } from '../../../../shared/components/RoleGuard';
import useBatchDetailStore from '../../stores/batchDetailStore';
import { useNavigate } from 'react-router-dom';
import BatchEditModal from './BatchEditModal';

interface SidePanelActionsProps {
  batch: BatchDetailResponse;
}

const SidePanelActions: React.FC<SidePanelActionsProps> = ({ batch }) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteBatch = useBatchDetailStore((state) => state.deleteBatch);

  const expiryStatus = getExpiryStatus(batch.expiry_date);
  const statusColor =
    expiryStatus === 'expired' ? 'status-critical' :
    expiryStatus === 'near' ? 'status-warning' :
    'status-good';

  const handleCopyId = () => {
    navigator.clipboard.writeText(batch.id);
    // TODO: Show toast notification
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBatch(batch.id);
      navigate('/inventory');
    } catch (error) {
      // Error handled by store
      console.error('Delete failed:', error);
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement PDF/CSV export
    console.log('Export batch:', batch.id);
  };

  return (
    <>
      <div className="side-panel__header">
        <h1 className="side-panel__title">{batch.batch_number}</h1>
      </div>

      {/* Metadata */}
      <div className="side-panel__metadata">
        <div className="metadata-item">
          <label>Batch ID</label>
          <div className="metadata-value-with-action">
            <code className="batch-id">{batch.id.slice(0, 8)}...</code>
            <button
              onClick={handleCopyId}
              className="icon-btn"
              title="Copy full ID"
              aria-label="Copy batch ID"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="metadata-item">
          <label>Product</label>
          <div className="metadata-value">{batch.product_name || batch.product}</div>
        </div>

        <div className="metadata-item">
          <label>Warehouse</label>
          <div className="metadata-value">{batch.warehouse_name || batch.warehouse}</div>
        </div>

        <div className="metadata-item">
          <label>Status</label>
          <div className={`status-badge ${statusColor}`}>
            {expiryStatus === 'expired' && <AlertCircle size={14} />}
            {expiryStatus === 'expired' ? 'EXPIRED' :
             expiryStatus === 'near' ? 'NEAR EXPIRY' :
             batch.rework_consumed ? 'REWORKED' :
             'ACTIVE'}
          </div>
        </div>

        <div className="metadata-item">
          <label>Created</label>
          <div className="metadata-value text-muted">
            {new Date(batch.created_at).toLocaleDateString()} at{' '}
            {new Date(batch.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {batch.updated_at && (
          <div className="metadata-item">
            <label>Last Updated</label>
            <div className="metadata-value text-muted">
              {new Date(batch.updated_at).toLocaleDateString()} at{' '}
              {new Date(batch.updated_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="side-panel__actions">
        <RoleGuard
          allowedRoles={['manager', 'admin', 'warehouse_supervisor']}
          fallback={null}
        >
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-primary btn-block"
            aria-label="Edit batch details"
          >
            Edit Details
          </button>
        </RoleGuard>

        {/* Rework Button - Disabled for now (no endpoint) */}
        <button
          onClick={() => console.log('Rework not yet implemented')}
          className="btn btn-secondary btn-block"
          disabled
          title="Rework endpoint not yet implemented"
          aria-label="Rework batch (disabled)"
        >
          <RefreshCw size={16} />
          Rework
        </button>

        <button
          onClick={handleExport}
          className="btn btn-secondary btn-block"
          aria-label="Export batch details"
        >
          <Download size={16} />
          Export
        </button>

        <RoleGuard
          allowedRoles={['manager', 'admin']}
          fallback={null}
        >
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-danger btn-block"
            aria-label="Delete batch"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </RoleGuard>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog__overlay" onClick={() => setShowDeleteConfirm(false)} />
          <div className="confirmation-dialog__content">
            <h3>Delete Batch?</h3>
            <p>
              Are you sure you want to delete batch <strong>{batch.batch_number}</strong>?
            </p>
            <p className="text-muted">This action cannot be undone.</p>
            <div className="confirmation-dialog__actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <BatchEditModal
        batch={batch}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};

export default SidePanelActions;
