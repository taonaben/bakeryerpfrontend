import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Truck,
  XCircle,
  FileText,
  Package,
} from 'lucide-react';
import { useOrdersStore } from '../../stores/ordersStore';
import '../../../procurement/styles/procurement.css';
import '../../styles/sales.css';

// ── small helper ──────────────────────────────
const fmt = (v: string | number) =>
  `$${parseFloat(String(v)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ─────────────────────────────────────────────
const SalesOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { detailMap, isLoading, error, fetchById, confirm, cancel, dispatch, isSubmitting } =
    useOrdersStore();

  const order = orderId ? detailMap[orderId] : null;

  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!orderId) { navigate('/sales/orders'); return; }
    fetchById(orderId, true);
  }, [orderId]);

  const handleConfirm = async () => {
    if (!orderId) return;
    try { await confirm(orderId); } catch { /* store holds error */ }
  };

  const handleDispatch = async () => {
    if (!orderId) return;
    try { await dispatch(orderId); } catch { /* store holds error */ }
  };

  const handleCancel = async () => {
    if (!orderId) return;
    try {
      await cancel(orderId, { reason: cancelReason || undefined });
      setShowCancelModal(false);
    } catch { /* store holds error */ }
  };

  // ── Loading ──────────────────────────────────
  if (isLoading && !order) {
    return (
      <div className="sales-page">
        <div className="sales-sticky-stack">
          <div className="sales-page-header">
            <div className="sales-page-header__left">
              <button className="btn btn-outline" onClick={() => navigate(-1)} type="button">
                <ArrowLeft size={16} /> Back
              </button>
            </div>
          </div>
        </div>
        <div className="sales-content">
          <div className="loading-container"><div className="spinner" /><span>Loading order…</span></div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────
  if (error && !order) {
    return (
      <div className="sales-page">
        <div className="sales-sticky-stack">
          <div className="sales-page-header">
            <div className="sales-page-header__left">
              <button className="btn btn-outline" onClick={() => navigate(-1)} type="button">
                <ArrowLeft size={16} /> Back
              </button>
            </div>
          </div>
        </div>
        <div className="sales-content">
          <div className="error-banner">
            <AlertCircle size={18} />
            {error}
            <button onClick={() => orderId && fetchById(orderId, true)} type="button">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────
  if (!order) {
    return (
      <div className="sales-page">
        <div className="sales-sticky-stack">
          <div className="sales-page-header">
            <div className="sales-page-header__left">
              <button className="btn btn-outline" onClick={() => navigate(-1)} type="button">
                <ArrowLeft size={16} /> Back
              </button>
            </div>
          </div>
        </div>
        <div className="sales-content">
          <div className="empty-state-card" style={{ marginTop: 40 }}>
            <Package size={40} style={{ marginBottom: 12, color: '#94a3b8' }} />
            <p style={{ fontWeight: 600 }}>Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);

  return (
    <div className="sales-page">
      {/* ── Sticky header ─────────────────────── */}
      <div className="sales-sticky-stack">
        <div className="sales-page-header">
          <div className="sales-page-header__left" style={{ flex: 1 }}>
            <button
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              type="button"
              style={{ marginBottom: 8, alignSelf: 'flex-start' }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="order-detail-header-title">
              <h1>{order.order_number}</h1>
              <span className={`badge badge-${order.status}`}>{statusLabel}</span>
              <span className={`badge badge-${order.order_type}`}>
                {order.order_type === 'pos' ? 'POS' : 'B2B'}
              </span>
            </div>

            <p className="sales-page-header__breadcrumb">
              Sales / Orders / {order.order_number}
            </p>

            {/* Actions sit below breadcrumb, clearly separated */}
            <div className="order-detail-actions">
              {order.status === 'draft' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                  >
                    <CheckCircle size={16} /> Confirm Order
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowCancelModal(true)}
                    disabled={isSubmitting}
                    style={{ color: '#ef4444', borderColor: '#fecaca' }}
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                </>
              )}
              {order.status === 'confirmed' && (
                <button
                  className="btn btn-primary"
                  onClick={handleDispatch}
                  disabled={isSubmitting}
                >
                  <Truck size={16} /> Dispatch Order
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/sales/orders/${order.id}/invoice`)}
              >
                <FileText size={16} /> Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────── */}
      <div className="sales-content" style={{ paddingTop: 24 }}>
        <div className="order-detail-layout">

          {/* ── LEFT SIDEBAR ──────────────────── */}
          <aside className="order-detail-sidebar">

            {/* Order meta card */}
            <div className="od-card">
              <div className="od-card__header">Order Details</div>
              <div className="od-meta-grid">
                <div className="od-meta-item">
                  <span className="od-meta-label">Customer</span>
                  <span className="od-meta-value">{order.customer_name}</span>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Warehouse</span>
                  <span className="od-meta-value">{order.warehouse_name}</span>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Order Date</span>
                  <span className="od-meta-value">{fmtDateTime(order.order_date)}</span>
                </div>
                {order.expected_delivery_date && (
                  <div className="od-meta-item">
                    <span className="od-meta-label">Expected Delivery</span>
                    <span className="od-meta-value">{fmtDate(order.expected_delivery_date)}</span>
                  </div>
                )}
                {order.delivery_address && (
                  <div className="od-meta-item od-meta-item--full">
                    <span className="od-meta-label">Delivery Address</span>
                    <span className="od-meta-value">{order.delivery_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline card */}
            <div className="od-card">
              <div className="od-card__header">Status Timeline</div>
              <div className="status-timeline">
                {/* Draft */}
                <div className={`timeline-item${order.status !== 'draft' ? ' completed' : ''}`}>
                  <div className="timeline-icon">
                    {order.status !== 'draft'
                      ? <CheckCircle size={15} />
                      : <div className="timeline-dot" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-label">Created</div>
                    <div className="timeline-date">{fmtDateTime(order.created_at)}</div>
                  </div>
                </div>

                {/* Confirmed */}
                <div className={`timeline-item${
                  ['confirmed', 'cancelled'].includes(order.status) ? ' completed' : ''
                }`}>
                  <div className="timeline-icon">
                    {['confirmed', 'cancelled'].includes(order.status)
                      ? <CheckCircle size={15} />
                      : <div className="timeline-dot" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-label">Confirmed</div>
                    {order.status !== 'draft' && (
                      <div className="timeline-date">{fmtDateTime(order.updated_at)}</div>
                    )}
                  </div>
                </div>

                {/* Dispatched (only if relevant) */}
                {order.status !== 'cancelled' && (
                  <div className={`timeline-item${order.status === 'dispatched' || order.status === 'completed' ? ' completed' : ''}`}>
                    <div className="timeline-icon">
                      {order.status === 'dispatched' || order.status === 'completed'
                        ? <CheckCircle size={15} />
                        : <div className="timeline-dot" />}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-label">Dispatched</div>
                    </div>
                  </div>
                )}

                {/* Cancelled */}
                {order.status === 'cancelled' && (
                  <div className="timeline-item completed">
                    <div className="timeline-icon">
                      <XCircle size={15} style={{ color: '#ef4444' }} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-label" style={{ color: '#ef4444' }}>Cancelled</div>
                      <div className="timeline-date">{fmtDateTime(order.updated_at)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes card */}
            {order.notes && (
              <div className="od-card">
                <div className="od-card__header">Notes</div>
                <p className="od-notes">{order.notes}</p>
              </div>
            )}
          </aside>

          {/* ── RIGHT MAIN ────────────────────── */}
          <main className="order-detail-main">

            {/* Order lines */}
            <div className="od-card">
              <div className="od-card__header">Order Lines</div>
              <div className="sales-table-container" style={{ borderRadius: 0, border: 'none', borderTop: '1px solid #e2e8f0' }}>
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                      <th style={{ textAlign: 'right' }}>Dispatched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(order.lines) && order.lines.map((line) => (
                      <tr key={line.id}>
                        <td style={{ fontWeight: 500 }}>{line.product_name}</td>
                        <td className="table-amount">{parseFloat(line.quantity).toLocaleString()}</td>
                        <td className="table-amount">{fmt(line.unit_price)}</td>
                        <td className="table-amount">{fmt(line.subtotal)}</td>
                        <td className="table-amount">{parseFloat(line.quantity_dispatched).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals block */}
              <div className="od-totals">
                <div className="od-totals-row">
                  <span>Subtotal</span>
                  <span>{fmt(order.subtotal)}</span>
                </div>
                <div className="od-totals-row">
                  <span>Tax</span>
                  <span>{fmt(order.tax_amount)}</span>
                </div>
                <div className="od-totals-row od-totals-row--total">
                  <span>Total</span>
                  <span>{fmt(order.total_amount)}</span>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* ── Cancel Modal ──────────────────────── */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel <strong>{order.order_number}</strong>? This cannot be undone.</p>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Reason (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason…"
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowCancelModal(false)}>
                Keep Order
              </button>
              <button className="btn btn-danger" onClick={handleCancel} disabled={isSubmitting}>
                {isSubmitting ? 'Cancelling…' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrderDetailPage;
