import React, { useState } from 'react';
import { CheckCircle, Copy, Edit3, Scale, Wallet, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SupplierInvoice } from '../../types/supplier_invoices_model';
import useSupplierInvoicesDetailStore from '../../stores/supplierInvoicesDetailStore';
import RejectModal from './RejectModal';
import MarkPaidModal from './MarkPaidModal';

interface SupplierInvoiceSidePanelActionsProps {
  supplierInvoice: SupplierInvoice;
}

const statusColorMap: Record<string, string> = {
  Draft: 'status-draft',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
  Paid: 'status-received',
};

const SupplierInvoiceSidePanelActions: React.FC<SupplierInvoiceSidePanelActionsProps> = ({
  supplierInvoice,
}) => {
  const navigate = useNavigate();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);

  const approveInvoice = useSupplierInvoicesDetailStore((s) => s.approveInvoice);
  const fetchMatch = useSupplierInvoicesDetailStore((s) => s.fetchMatch);
  const isApproving = useSupplierInvoicesDetailStore((s) => s.isApproving);
  const isMatching = useSupplierInvoicesDetailStore((s) => s.isMatching);

  const canApprove = supplierInvoice.status === 'Draft';
  const canReject = supplierInvoice.status === 'Draft' || supplierInvoice.status === 'Approved';
  const canMarkPaid = supplierInvoice.status === 'Approved';
  const canEdit = supplierInvoice.status === 'Draft';
  const shouldShowCreateAnother =
    supplierInvoice.status === 'Approved' || supplierInvoice.status === 'Rejected';

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(supplierInvoice.id);
    } catch {
      // ignore
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this supplier invoice?')) return;
    try {
      await approveInvoice(supplierInvoice.id);
    } catch {
      // store handles message state
    }
  };

  const handleRunMatch = async () => {
    try {
      await fetchMatch(supplierInvoice.id, true);
    } catch {
      // store handles error state
    }
  };

  return (
    <>
      <div className="side-panel__header">
        <h1 className="side-panel__title">{supplierInvoice.invoice_number}</h1>
      </div>

      <div className="side-panel__metadata">
        <div className="metadata-item">
          <label>Invoice Number</label>
          <div className="metadata-value-with-action">
            <code className="batch-id">{supplierInvoice.invoice_number}</code>
            <button onClick={handleCopyId} className="icon-btn" title="Copy ID" aria-label="Copy supplier invoice ID">
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="metadata-item">
          <label>Status</label>
          <div className={`status-badge ${statusColorMap[supplierInvoice.status] || ''}`}>
            {supplierInvoice.status}
          </div>
        </div>

        <div className="metadata-item">
          <label>Supplier</label>
          <div className="metadata-value">{supplierInvoice.supplier_name || '—'}</div>
        </div>

        <div className="metadata-item">
          <label>PO Reference</label>
          <div className="metadata-value">{supplierInvoice.po_number || '—'}</div>
        </div>

        <div className="metadata-item">
          <label>Invoice Date</label>
          <div className="metadata-value text-muted">{formatDate(supplierInvoice.invoice_date)}</div>
        </div>

        <div className="metadata-item">
          <label>Due Date</label>
          <div className="metadata-value text-muted">{formatDate(supplierInvoice.due_date)}</div>
        </div>

        {supplierInvoice.payment_reference && (
          <div className="metadata-item">
            <label>Payment Reference</label>
            <div className="metadata-value">{supplierInvoice.payment_reference}</div>
          </div>
        )}

        {supplierInvoice.rejection_reason && (
          <div className="metadata-item">
            <label>Rejection Reason</label>
            <div className="metadata-value" style={{ color: '#991b1b' }}>{supplierInvoice.rejection_reason}</div>
          </div>
        )}
      </div>

      <div className="side-panel__actions">
        <h3 className="side-panel-title">Actions</h3>

        {canEdit && (
          <button
            onClick={() => navigate(`/procurement/invoices/${supplierInvoice.id}/edit`)}
            className="btn btn-primary btn-block"
          >
            <Edit3 size={16} />
            Edit Invoice
          </button>
        )}

        {shouldShowCreateAnother && (
          <button
            onClick={() =>
              navigate(`/procurement/invoices/new?copyFromInvoiceId=${supplierInvoice.id}`)
            }
            className="btn btn-primary btn-block"
          >
            <Edit3 size={16} />
            Create Another From This
          </button>
        )}

        {canApprove && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="btn btn-secondary btn-block"
          >
            <CheckCircle size={16} />
            {isApproving ? 'Approving...' : 'Approve'}
          </button>
        )}

        {canReject && (
          <button
            onClick={() => setIsRejectModalOpen(true)}
            className="btn btn-danger btn-block"
          >
            <XCircle size={16} />
            Reject
          </button>
        )}

        {canMarkPaid && (
          <button
            onClick={() => setIsMarkPaidModalOpen(true)}
            className="btn btn-secondary btn-block"
          >
            <Wallet size={16} />
            Mark Paid
          </button>
        )}

        <button
          onClick={handleRunMatch}
          disabled={isMatching}
          className="btn btn-outline btn-block"
          type="button"
        >
          <Scale size={16} />
          {isMatching ? 'Matching...' : 'Run 3-Way Match'}
        </button>
      </div>

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        invoiceId={supplierInvoice.id}
        invoiceNumber={supplierInvoice.invoice_number}
      />

      <MarkPaidModal
        isOpen={isMarkPaidModalOpen}
        onClose={() => setIsMarkPaidModalOpen(false)}
        invoiceId={supplierInvoice.id}
        invoiceNumber={supplierInvoice.invoice_number}
      />
    </>
  );
};

export default SupplierInvoiceSidePanelActions;
