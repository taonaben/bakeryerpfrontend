import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ban,
  CheckCircle,
  Clock,
  Copy,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import type { PurchaseOrder } from '../../types/purchase_orders_models';
import usePurchaseOrderDetailStore from '../../stores/purchaseOrderDetailStore';
import { useUserStore } from '../../../auth/stores/userStore';
import EditPurchaseOrderModal from './EditPurchaseOrderModal';
import RejectModal from './RejectModal';

interface PurchaseOrderSidePanelActionsProps {
  purchaseOrder: PurchaseOrder;
}

const statusColorMap: Record<string, string> = {
  Draft: 'status-draft',
  Submitted: 'status-submitted',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
  'Partially Received': 'status-partially-received',
  Received: 'status-received',
  Cancelled: 'status-cancelled',
};

const PurchaseOrderSidePanelActions: React.FC<PurchaseOrderSidePanelActionsProps> = ({
  purchaseOrder,
}) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSubmitting = usePurchaseOrderDetailStore((s) => s.isSubmitting);
  const isApproving = usePurchaseOrderDetailStore((s) => s.isApproving);
  const isDeleting = usePurchaseOrderDetailStore((s) => s.isDeleting);
  const isCancelling = usePurchaseOrderDetailStore((s) => s.isCancelling);
  const submitOrder = usePurchaseOrderDetailStore((s) => s.submitOrder);
  const approveOrder = usePurchaseOrderDetailStore((s) => s.approveOrder);
  const cancelOrder = usePurchaseOrderDetailStore((s) => s.cancelOrder);
  const deleteOrder = usePurchaseOrderDetailStore((s) => s.deleteOrder);

  const isDraft = purchaseOrder.status === 'Draft';
  const isSubmitted = purchaseOrder.status === 'Submitted';
  const isApproved = purchaseOrder.status === 'Approved';
  const canReceiveGoods =
    purchaseOrder.status === 'Approved' || purchaseOrder.status === 'Partially Received';

  const storeUser = useUserStore((s) => s.user);
  const currentUserId = (() => {
    if (storeUser?.id) return storeUser.id;
    try {
      const saved = localStorage.getItem('erp_user');
      if (saved) return JSON.parse(saved)?.id ?? null;
    } catch {
      return null;
    }
    return null;
  })();

  const isCreator = currentUserId === purchaseOrder.created_by;

  const formatDateTime = (value: string | null) => {
    if (!value) return null;

    return `${new Date(value).toLocaleDateString()} at ${new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (Number.isNaN(parsed)) return '—';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: purchaseOrder.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(parsed);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(purchaseOrder.id);
  };

  const handleSubmit = async () => {
    if (!purchaseOrder.line_items?.length) {
      alert('Cannot submit: at least one line item is required.');
      return;
    }

    const invalidLine = purchaseOrder.line_items.find(
      (item) => Number(item.quantity) <= 0 || Number(item.unit_price) <= 0,
    );

    if (invalidLine) {
      alert('Cannot submit: all line items must have quantity and unit price greater than 0.');
      return;
    }

    try {
      await submitOrder(purchaseOrder.id);
    } catch {
      // Error is handled in store state.
    }
  };

  const handleApprove = async () => {
    try {
      await approveOrder(purchaseOrder.id);
    } catch {
      // Error is handled in store state.
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(purchaseOrder.id);
    } catch {
      // Error is handled in store state.
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(purchaseOrder.id);
      navigate('/procurement/purchase-orders');
    } catch {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="side-panel__header">
        <h1 className="side-panel__title">{purchaseOrder.po_number}</h1>
      </div>

      <div className="side-panel__metadata">
        <div className="metadata-item">
          <label>PO Number</label>
          <div className="metadata-value-with-action">
            <code className="batch-id">{purchaseOrder.po_number}</code>
            <button onClick={handleCopyId} className="icon-btn" title="Copy ID" aria-label="Copy purchase order ID">
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="metadata-item">
          <label>Status</label>
          <div className={`status-badge ${statusColorMap[purchaseOrder.status] || ''}`}>
            {purchaseOrder.status}
          </div>
        </div>

        <div className="metadata-item">
          <label>Supplier</label>
          <div className="metadata-value">{purchaseOrder.supplier_name || '—'}</div>
        </div>

        <div className="metadata-item">
          <label>Warehouse</label>
          <div className="metadata-value">{purchaseOrder.warehouse_name || '—'}</div>
        </div>

        <div className="metadata-item">
          <label>Order Date</label>
          <div className="metadata-value text-muted">{formatDate(purchaseOrder.order_date)}</div>
        </div>

        <div className="metadata-item">
          <label>Expected Delivery</label>
          <div className="metadata-value text-muted">{formatDate(purchaseOrder.expected_delivery_date)}</div>
        </div>

        <div className="metadata-item">
          <label>Currency</label>
          <div className="metadata-value">{purchaseOrder.currency || '—'}</div>
        </div>

        <div className="metadata-item">
          <label>Total Amount</label>
          <div className="metadata-value po-detail-value">{formatCurrency(purchaseOrder.total_amount)}</div>
        </div>

        <div className="metadata-item">
          <label>Item Count</label>
          <div className="metadata-value">{purchaseOrder.item_count || purchaseOrder.line_items?.length || 0}</div>
        </div>

        {purchaseOrder.purchase_requisition && purchaseOrder.pr_number && (
          <div className="metadata-item">
            <label>Originating Requisition</label>
            <div className="metadata-value">
              <button
                type="button"
                className="po-detail-link"
                onClick={() => navigate(`/procurement/requisitions/${purchaseOrder.purchase_requisition}`)}
              >
                {purchaseOrder.pr_number}
              </button>
            </div>
          </div>
        )}

        <div className="metadata-item">
          <label>Created</label>
          <div className="metadata-value text-muted">{formatDateTime(purchaseOrder.created_at)}</div>
        </div>

        {purchaseOrder.submitted_at && (
          <div className="metadata-item">
            <label>Submitted</label>
            <div className="metadata-value text-muted">{formatDateTime(purchaseOrder.submitted_at)}</div>
          </div>
        )}

        {purchaseOrder.approved_at && (
          <div className="metadata-item">
            <label>Approved</label>
            <div className="metadata-value text-muted">{formatDateTime(purchaseOrder.approved_at)}</div>
          </div>
        )}

        {purchaseOrder.rejected_at && (
          <div className="metadata-item">
            <label>Rejected</label>
            <div className="metadata-value text-muted">{formatDateTime(purchaseOrder.rejected_at)}</div>
          </div>
        )}

        {purchaseOrder.cancelled_at && (
          <div className="metadata-item">
            <label>Cancelled</label>
            <div className="metadata-value text-muted">{formatDateTime(purchaseOrder.cancelled_at)}</div>
          </div>
        )}

        {purchaseOrder.rejection_reason && (
          <div className="metadata-item">
            <label>Rejection Reason</label>
            <div className="metadata-value" style={{ color: '#991b1b' }}>{purchaseOrder.rejection_reason}</div>
          </div>
        )}
      </div>

      <div className="side-panel__actions">
        {isDraft && (
          <>
            <button onClick={() => setIsEditModalOpen(true)} className="btn btn-primary btn-block">
              Edit Details
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-secondary btn-block">
              <Send size={16} />
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger btn-block">
              <Trash2 size={16} />
              Delete
            </button>
          </>
        )}

        {isSubmitted && isCreator && (
          <div className="waiting-approval-notice">
            <Clock size={18} />
            <div>
              <strong>Waiting for Approval</strong>
              <p>Another user must approve this purchase order.</p>
            </div>
          </div>
        )}

        {isSubmitted && !isCreator && (
          <>
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="btn btn-primary btn-block"
              style={{ background: '#059669', borderColor: '#059669' }}
            >
              <CheckCircle size={16} />
              {isApproving ? 'Approving...' : 'Approve'}
            </button>
            <button onClick={() => setIsRejectModalOpen(true)} className="btn btn-danger btn-block">
              <XCircle size={16} />
              Reject
            </button>
          </>
        )}

        {isApproved && (
          <>
            <button
              onClick={() => navigate(`/procurement/goods-receipts/new?poId=${purchaseOrder.id}`)}
              className="btn btn-primary btn-block"
            >
              Receive Goods
            </button>
            <button onClick={handleCancel} disabled={isCancelling} className="btn btn-secondary btn-block">
              <Ban size={16} />
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </>
        )}

        {canReceiveGoods && !isApproved && (
          <button
            onClick={() => navigate(`/procurement/goods-receipts/new?poId=${purchaseOrder.id}`)}
            className="btn btn-primary btn-block"
          >
            Receive Goods
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog__overlay" onClick={() => setShowDeleteConfirm(false)} />
          <div className="confirmation-dialog__content">
            <h3>Delete Purchase Order?</h3>
            <p>
              Are you sure you want to delete <strong>{purchaseOrder.po_number}</strong>?
            </p>
            <p className="text-muted">This action cannot be undone.</p>
            <div className="confirmation-dialog__actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        orderId={purchaseOrder.id}
        poNumber={purchaseOrder.po_number}
      />

      <EditPurchaseOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        purchaseOrder={purchaseOrder}
      />
    </>
  );
};

export default PurchaseOrderSidePanelActions;
