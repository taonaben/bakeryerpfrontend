/**
 * Side Panel Actions — Requisition Detail
 * Sticky sidebar showing PR metadata + status-dependent action buttons
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Trash2, Send, CheckCircle, XCircle, ArrowRightCircle, Download, Clock } from 'lucide-react';
import type { PurchaseRequisition } from '../../types/models';
import useRequisitionDetailStore from '../../stores/requisitionDetailStore';
import { useUserStore } from '../../../auth/stores/userStore';
import RejectModal from './RejectModal';
import EditRequisitionModal from './EditRequisitionModal';
import PrintPreviewModal from './PrintPreviewModal';

interface SidePanelActionsProps {
  requisition: PurchaseRequisition;
}

const statusColorMap: Record<string, string> = {
  Draft: 'status-draft',
  Submitted: 'status-submitted',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
  Converted: 'status-converted',
};

const SidePanelActions: React.FC<SidePanelActionsProps> = ({ requisition }) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const isSubmitting = useRequisitionDetailStore((s) => s.isSubmitting);
  const isApproving = useRequisitionDetailStore((s) => s.isApproving);
  const isDeleting = useRequisitionDetailStore((s) => s.isDeleting);
  const submitRequisition = useRequisitionDetailStore((s) => s.submitRequisition);
  const approveRequisition = useRequisitionDetailStore((s) => s.approveRequisition);
  const deleteRequisition = useRequisitionDetailStore((s) => s.deleteRequisition);

  const isDraft = requisition.status === 'Draft';
  const isSubmitted = requisition.status === 'Submitted';
  const isApproved = requisition.status === 'Approved';

  // Resolve current user ID (Zustand store or localStorage fallback)
  const storeUser = useUserStore((s) => s.user);
  const currentUserId = (() => {
    if (storeUser?.id) return storeUser.id;
    try {
      const saved = localStorage.getItem('erp_user');
      if (saved) return JSON.parse(saved)?.id ?? null;
    } catch { /* ignore */ }
    return null;
  })();

  // Approver must differ from requester
  const isRequester = currentUserId === requisition.requested_by;

  const handleCopyId = () => {
    navigator.clipboard.writeText(requisition.id);
  };

  const handleSubmit = async () => {
    // Validate before submitting
    if (!requisition.line_items || requisition.line_items.length === 0) {
      alert('Cannot submit: at least one line item is required.');
      return;
    }
    const invalidLine = requisition.line_items.find((li) => Number(li.quantity) <= 0);
    if (invalidLine) {
      alert('Cannot submit: all line items must have quantity greater than 0.');
      return;
    }
    try {
      await submitRequisition(requisition.id);
    } catch {
      // Error is set in the store
    }
  };

  const handleApprove = async () => {
    try {
      await approveRequisition(requisition.id);
    } catch {
      // Error is set in the store
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRequisition(requisition.id);
      navigate('/procurement/requisitions');
    } catch {
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return `${new Date(date).toLocaleDateString()} at ${new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <>
      {/* Header */}
      <div className="side-panel__header">
        <h1 className="side-panel__title">{requisition.pr_number}</h1>
      </div>

      {/* Metadata */}
      <div className="side-panel__metadata">
        <div className="metadata-item">
          <label>PR Number</label>
          <div className="metadata-value-with-action">
            <code className="batch-id">{requisition.pr_number}</code>
            <button onClick={handleCopyId} className="icon-btn" title="Copy ID" aria-label="Copy requisition ID">
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="metadata-item">
          <label>Status</label>
          <div className={`status-badge ${statusColorMap[requisition.status] || ''}`}>
            {requisition.status}
          </div>
        </div>

        <div className="metadata-item">
          <label>Requested By</label>
          <div className="metadata-value">{requisition.requested_by_name || '—'}</div>
        </div>

        <div className="metadata-item">
          <label>Warehouse</label>
          <div className="metadata-value">{requisition.warehouse_name || '—'}</div>
        </div>

        <div className="metadata-item">
          <label>Created</label>
          <div className="metadata-value text-muted">{formatDate(requisition.created_at)}</div>
        </div>

        {requisition.submitted_at && (
          <div className="metadata-item">
            <label>Submitted</label>
            <div className="metadata-value text-muted">{formatDate(requisition.submitted_at)}</div>
          </div>
        )}

        {requisition.approved_at && (
          <div className="metadata-item">
            <label>Approved</label>
            <div className="metadata-value text-muted">{formatDate(requisition.approved_at)}</div>
          </div>
        )}

        {requisition.rejected_at && (
          <div className="metadata-item">
            <label>Rejected</label>
            <div className="metadata-value text-muted">{formatDate(requisition.rejected_at)}</div>
          </div>
        )}

        {requisition.rejection_reason && (
          <div className="metadata-item">
            <label>Rejection Reason</label>
            <div className="metadata-value" style={{ color: '#991b1b' }}>{requisition.rejection_reason}</div>
          </div>
        )}

        {requisition.converted_at && (
          <div className="metadata-item">
            <label>Converted</label>
            <div className="metadata-value text-muted">{formatDate(requisition.converted_at)}</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="side-panel__actions">
        {/* Draft actions */}
        {isDraft && (
          <>
            <button onClick={() => setIsEditModalOpen(true)} className="btn btn-primary btn-block">
              Edit Details
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-secondary btn-block">
              <Send size={16} />
              {isSubmitting ? 'Submitting…' : 'Submit for Approval'}
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger btn-block">
              <Trash2 size={16} />
              Delete
            </button>
          </>
        )}

        {/* Submitted actions */}
        {isSubmitted && isRequester && (
          <div className="waiting-approval-notice">
            <Clock size={18} />
            <div>
              <strong>Waiting for Approval</strong>
              <p>Another user must approve this requisition.</p>
            </div>
          </div>
        )}

        {isSubmitted && !isRequester && (
          <>
            <button onClick={handleApprove} disabled={isApproving} className="btn btn-primary btn-block" style={{ background: '#059669', borderColor: '#059669' }}>
              <CheckCircle size={16} />
              {isApproving ? 'Approving…' : 'Approve'}
            </button>
            <button onClick={() => setIsRejectModalOpen(true)} className="btn btn-danger btn-block">
              <XCircle size={16} />
              Reject
            </button>
          </>
        )}

        {/* Approved actions */}
        {isApproved && (
          <button onClick={() => navigate(`/procurement/requisitions/${requisition.id}/convert`)} className="btn btn-primary btn-block">
            <ArrowRightCircle size={16} />
            Convert to Purchase Order
          </button>
        )}

        {/* Always available: Export PDF */}
        <button onClick={() => setIsPrintPreviewOpen(true)} className="btn btn-secondary btn-block">
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog__overlay" onClick={() => setShowDeleteConfirm(false)} />
          <div className="confirmation-dialog__content">
            <h3>Delete Requisition?</h3>
            <p>
              Are you sure you want to delete <strong>{requisition.pr_number}</strong>?
            </p>
            <p className="text-muted">This action cannot be undone.</p>
            <div className="confirmation-dialog__actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        requisitionId={requisition.id}
        prNumber={requisition.pr_number}
      />

      {/* Edit Modal */}
      <EditRequisitionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        requisition={requisition}
      />

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        requisition={requisition}
      />
    </>
  );
};

export default SidePanelActions;
