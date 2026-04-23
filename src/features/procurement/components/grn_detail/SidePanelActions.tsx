import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import type { GoodsReceipt } from '../../types/grn_models';
import useGoodsReceiptDetailStore from '../../stores/grnDetailStore';
import RejectModal from './RejectModal';

interface GRNSidePanelActionsProps {
  goodsReceipt: GoodsReceipt;
}

const GRNSidePanelActions: React.FC<GRNSidePanelActionsProps> = ({ goodsReceipt }) => {
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);

  const confirmReceipt = useGoodsReceiptDetailStore((s) => s.confirmReceipt);
  const rejectReceipt = useGoodsReceiptDetailStore((s) => s.rejectReceipt);
  const deleteReceipt = useGoodsReceiptDetailStore((s) => s.deleteReceipt);
  const isConfirming = useGoodsReceiptDetailStore((s) => s.isConfirming);
  const isRejecting = useGoodsReceiptDetailStore((s) => s.isRejecting);
  const isDeleting = useGoodsReceiptDetailStore((s) => s.isDeleting);

  const canConfirm = goodsReceipt.status === 'Draft';
  const canReject = goodsReceipt.status === 'Draft' || goodsReceipt.status === 'Confirmed';
  const canDelete = goodsReceipt.status === 'Draft';

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to confirm this goods receipt?')) return;

    try {
      await confirmReceipt(goodsReceipt.id);
      alert('Goods receipt confirmed successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to confirm goods receipt');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectReceipt(goodsReceipt.id, reason);
      setShowRejectModal(false);
      alert('Goods receipt rejected successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to reject goods receipt');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this goods receipt? This action cannot be undone.')) return;

    try {
      await deleteReceipt(goodsReceipt.id);
      alert('Goods receipt deleted successfully');
      navigate('/procurement/goods-receipts');
    } catch (error: any) {
      alert(error.message || 'Failed to delete goods receipt');
    }
  };

  return (
    <>
      {/* Metadata Section */}
      <div className="side-panel__header">
        <h1 className="side-panel__title">{goodsReceipt.gr_number}</h1>
      </div>
      <div className="side-panel__metadata">
        <div className="metadata-item">
          <label>GR Number</label>
          <div className="metadata-value-with-action">
            <code className="batch-id">{goodsReceipt.gr_number}</code>
          </div>
        </div>
        <div className="metadata-item">
          <label>Status</label>
          <div className={`status-badge status-${goodsReceipt.status.toLowerCase().replace(/\s+/g, '-')}`}>{goodsReceipt.status}</div>
        </div>
        <div className="metadata-item">
          <label>Supplier</label>
          <div className="metadata-value">{goodsReceipt.supplier_name || '—'}</div>
        </div>
        <div className="metadata-item">
          <label>Warehouse</label>
          <div className="metadata-value">{goodsReceipt.warehouse_name || '—'}</div>
        </div>
        <div className="metadata-item">
          <label>Received By</label>
          <div className="metadata-value">{goodsReceipt.received_by_name || '—'}</div>
        </div>
        <div className="metadata-item">
          <label>Received Date</label>
          <div className="metadata-value text-muted">{goodsReceipt.received_date ? new Date(goodsReceipt.received_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
        </div>
        {goodsReceipt.rejection_reason && (
          <div className="metadata-item">
            <label>Rejection Reason</label>
            <div className="metadata-value" style={{ color: '#991b1b' }}>{goodsReceipt.rejection_reason}</div>
          </div>
        )}
        {goodsReceipt.description && (
          <div className="metadata-item">
            <label>Description</label>
            <div className="metadata-value">{goodsReceipt.description}</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="side-panel__actions">
        <h3 className="side-panel-title">Actions</h3>

        {canConfirm && (
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="btn btn-primary btn-block"
          >
            <CheckCircle size={18} />
            {isConfirming ? 'Confirming...' : 'Confirm Receipt'}
          </button>
        )}

        {canReject && (
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isRejecting}
            className="btn btn-danger btn-block"
          >
            <XCircle size={18} />
            {isRejecting ? 'Rejecting...' : 'Reject Receipt'}
          </button>
        )}

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-secondary btn-block"
          >
            <Trash2 size={18} />
            {isDeleting ? 'Deleting...' : 'Delete Receipt'}
          </button>
        )}

        {!canConfirm && !canReject && !canDelete && (
          <p className="no-actions-text">No actions available for this receipt</p>
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onReject={handleReject}
          isRejecting={isRejecting}
        />
      )}
    </>
  );
};

export default GRNSidePanelActions;
