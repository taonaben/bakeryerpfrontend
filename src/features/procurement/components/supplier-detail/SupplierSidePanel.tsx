import React, { useState } from 'react';
import { Copy, CheckCircle, AlertTriangle, PowerOff, RotateCcw, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Supplier, PaymentTerms } from '../../types/models';
import { useSupplierDetailStore } from '../../stores/supplierDetailStore';
import PutOnHoldModal from './PutOnHoldModal';
import AddProductModal from './AddProductModal';

const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  NET_30: 'Net 30',
  NET_60: 'Net 60',
  COD: 'Cash on Delivery',
  EOM: 'End of Month',
  PREPAID: 'Prepaid',
  IMMEDIATE: 'Immediate',
};

const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  MANUFACTURER: 'Manufacturer',
  WHOLESALER: 'Wholesaler',
  DISTRIBUTOR: 'Distributor',
  RETAILER: 'Retailer',
  SERVICE_PROVIDER: 'Service Provider',
};

interface SupplierSidePanelProps {
  supplier: Supplier;
}

const SupplierSidePanel: React.FC<SupplierSidePanelProps> = ({ supplier }) => {
  const navigate = useNavigate();
  const [isPutOnHoldOpen, setIsPutOnHoldOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);

  const isReleasingHold = useSupplierDetailStore((s) => s.isReleasingHold);
  const isDeleting = useSupplierDetailStore((s) => s.isDeleting);
  const isReactivating = useSupplierDetailStore((s) => s.isReactivating);
  const releaseHold = useSupplierDetailStore((s) => s.releaseHold);
  const deleteSupplier = useSupplierDetailStore((s) => s.deleteSupplier);
  const reactivate = useSupplierDetailStore((s) => s.reactivate);

  const isActive = supplier.is_active;
  const isOnHold = supplier.on_hold;

  const handleCopyId = () => {
    navigator.clipboard.writeText(supplier.id);
  };

  const handleReleaseHold = async () => {
    try {
      await releaseHold(supplier.id);
      setShowReleaseConfirm(false);
    } catch {
      // error set in store
    }
  };

  const handleDeactivate = async () => {
    try {
      await deleteSupplier(supplier.id);
      setShowDeactivateConfirm(false);
      navigate('/procurement/suppliers');
    } catch {
      setShowDeactivateConfirm(false);
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivate(supplier.id);
      setShowReactivateConfirm(false);
    } catch {
      // error set in store
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderStars = (rating: number | null) => {
    if (!rating) return <span style={{ color: '#94a3b8' }}>—</span>;
    return (
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ color: i < rating ? '#f59e0b' : '#e2e8f0', fontSize: '0.9rem' }}>
            ★
          </span>
        ))}
      </>
    );
  };

  const statusBadge = () => {
    if (!isActive) return <span className="badge inactive">Inactive</span>;
    if (isOnHold) return <span className="badge on-hold">On Hold</span>;
    return <span className="badge active">Active</span>;
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="side-panel__header">
        <h1 className="side-panel__title">{supplier.name}</h1>
      </div>

      {/* ── Metadata ── */}
      <div className="side-panel__metadata">
        <div className="metadata-item">
          <label>Supplier ID</label>
          <div className="metadata-value-with-action">
            <code className="batch-id">{supplier.id.slice(0, 8)}…</code>
            <button
              onClick={handleCopyId}
              className="icon-btn"
              title="Copy full ID"
              aria-label="Copy supplier ID"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="metadata-item">
          <label>Status</label>
          <div>{statusBadge()}</div>
        </div>

        <div className="metadata-item">
          <label>Type</label>
          <div className="metadata-value">
            {SUPPLIER_TYPE_LABELS[supplier.supplier_type] ?? supplier.supplier_type ?? '—'}
          </div>
        </div>

        <div className="metadata-item">
          <label>Payment Terms</label>
          <div className="metadata-value">
            {supplier.payment_terms
              ? (PAYMENT_TERMS_LABELS[supplier.payment_terms] ?? supplier.payment_terms)
              : '—'}
          </div>
        </div>

        <div className="metadata-item">
          <label>Currency</label>
          <div className="metadata-value">{supplier.currency || '—'}</div>
        </div>

        {supplier.credit_limit != null && (
          <div className="metadata-item">
            <label>Credit Limit</label>
            <div className="metadata-value">
              {supplier.currency} {Number(supplier.credit_limit).toLocaleString()}
            </div>
          </div>
        )}

        <div className="metadata-item">
          <label>Rating</label>
          <div className="metadata-value" style={{ display: 'flex', gap: '2px' }}>
            {renderStars(supplier.rating)}
          </div>
        </div>

        <div className="metadata-item">
          <label>Since</label>
          <div className="metadata-value text-muted">{formatDate(supplier.created_at)}</div>
        </div>

        {/* On Hold reason callout */}
        {isOnHold && supplier.on_hold_reason && (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              padding: '10px 12px',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#92400e',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Hold Reason
            </div>
            <div style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5 }}>
              {supplier.on_hold_reason}
            </div>
          </div>
        )}

        {/* Inactive callout */}
        {!isActive && (
          <div
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '10px 12px',
              marginTop: '4px',
            }}
          >
            <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              This supplier has been deactivated. Reactivate to resume operations.
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="side-panel__actions">
        {/* Active, not on hold */}
        {isActive && !isOnHold && (
          <>
            <button
              onClick={() => setIsPutOnHoldOpen(true)}
              className="btn btn-secondary btn-block"
              style={{ borderColor: '#d97706', color: '#d97706' }}
            >
              <AlertTriangle size={15} />
              Put On Hold
            </button>
            {/* <button
              onClick={() => setIsAddProductOpen(true)}
              className="btn btn-secondary btn-block"
            >
              <Package size={15} />
              Add Product
            </button> */}
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="btn btn-danger btn-block"
            >
              <PowerOff size={15} />
              Deactivate
            </button>
          </>
        )}

        {/* On hold */}
        {isActive && isOnHold && (
          <>
            <button
              onClick={() => setShowReleaseConfirm(true)}
              className="btn btn-primary btn-block"
              style={{ background: '#059669', borderColor: '#059669' }}
              disabled={isReleasingHold}
            >
              <CheckCircle size={15} />
              {isReleasingHold ? 'Releasing…' : 'Release Hold'}
            </button>
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="btn btn-danger btn-block"
            >
              <PowerOff size={15} />
              Deactivate
            </button>
          </>
        )}

        {/* Inactive */}
        {!isActive && (
          <button
            onClick={() => setShowReactivateConfirm(true)}
            className="btn btn-primary btn-block"
            disabled={isReactivating}
          >
            <RotateCcw size={15} />
            {isReactivating ? 'Reactivating…' : 'Reactivate'}
          </button>
        )}
      </div>

      {/* ── Deactivate Confirm ── */}
      {showDeactivateConfirm && (
        <div className="confirmation-dialog">
          <div
            className="confirmation-dialog__overlay"
            onClick={() => setShowDeactivateConfirm(false)}
          />
          <div className="confirmation-dialog__content">
            <h3>Deactivate Supplier?</h3>
            <p>
              <strong>{supplier.name}</strong> will be marked as <em>inactive</em> (terminated).
              This prevents new Purchase Orders from being raised.
            </p>
            <p className="text-muted">This can be reversed by reactivating the supplier later.</p>
            <div className="confirmation-dialog__actions">
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button onClick={handleDeactivate} disabled={isDeleting} className="btn btn-danger">
                {isDeleting ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Release Hold Confirm ── */}
      {showReleaseConfirm && (
        <div className="confirmation-dialog">
          <div
            className="confirmation-dialog__overlay"
            onClick={() => setShowReleaseConfirm(false)}
          />
          <div className="confirmation-dialog__content">
            <h3>Release Hold?</h3>
            <p>
              <strong>{supplier.name}</strong> will be unblocked. New Purchase Orders can be raised
              against them again.
            </p>
            <div className="confirmation-dialog__actions">
              <button
                onClick={() => setShowReleaseConfirm(false)}
                className="btn btn-secondary"
                disabled={isReleasingHold}
              >
                Cancel
              </button>
              <button
                onClick={handleReleaseHold}
                disabled={isReleasingHold}
                className="btn btn-primary"
                style={{ background: '#059669', borderColor: '#059669' }}
              >
                {isReleasingHold ? 'Releasing…' : 'Release Hold'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reactivate Confirm ── */}
      {showReactivateConfirm && (
        <div className="confirmation-dialog">
          <div
            className="confirmation-dialog__overlay"
            onClick={() => setShowReactivateConfirm(false)}
          />
          <div className="confirmation-dialog__content">
            <h3>Reactivate Supplier?</h3>
            <p>
              <strong>{supplier.name}</strong> will be marked as active and can receive new
              Purchase Orders.
            </p>
            <div className="confirmation-dialog__actions">
              <button
                onClick={() => setShowReactivateConfirm(false)}
                className="btn btn-secondary"
                disabled={isReactivating}
              >
                Cancel
              </button>
              <button
                onClick={handleReactivate}
                disabled={isReactivating}
                className="btn btn-primary"
              >
                {isReactivating ? 'Reactivating…' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PutOnHoldModal
        isOpen={isPutOnHoldOpen}
        onClose={() => setIsPutOnHoldOpen(false)}
        supplierId={supplier.id}
        supplierName={supplier.name}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        supplierId={supplier.id}
      />
    </>
  );
};

export default SupplierSidePanel;
