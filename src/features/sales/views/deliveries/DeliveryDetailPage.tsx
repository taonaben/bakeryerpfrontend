import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Package,
  RotateCcw,
  Truck,
  XCircle,
} from 'lucide-react';
import { useDeliveriesStore } from '../../stores/deliveriesStore';
import type { Delivery, DeliveryLine } from '../../types/deliveries_models';
import '../../styles/sales.css';
import '../../../procurement/styles/procurement.css';

const DeliveryDetailPage: React.FC = () => {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const navigate = useNavigate();

  const {
    detailMap,
    isLoading,
    isSubmitting,
    error,
    fetchById,
    confirmReceipt,
    fail,
    clearError,
  } = useDeliveriesStore();

  const delivery = deliveryId ? detailMap[deliveryId] : null;
  const [showFailModal, setShowFailModal] = useState(false);
  const [failureReason, setFailureReason] = useState('');

  useEffect(() => {
    if (!deliveryId) {
      navigate('/sales/deliveries', { replace: true });
      return;
    }

    fetchById(deliveryId, true);
  }, [deliveryId, fetchById, navigate]);

  const handleConfirmReceipt = async () => {
    if (!deliveryId) return;
    await confirmReceipt(deliveryId);
  };

  const handleMarkFailed = async () => {
    if (!deliveryId || !failureReason.trim()) return;

    await fail(deliveryId, { reason: failureReason.trim() });
    setShowFailModal(false);
    setFailureReason('');
  };

  if (isLoading && !delivery) {
    return (
      <div className="sales-page">
        <div className="sales-content">
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading delivery...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="sales-page">
        <div className="sales-sticky-stack">
          <div className="sales-page-header">
            <button className="btn btn-outline" type="button" onClick={() => navigate('/sales/deliveries')}>
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>
        <div className="sales-content">
          {error ? (
            <div className="error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button type="button" onClick={() => deliveryId && fetchById(deliveryId, true)}>
                Retry
              </button>
            </div>
          ) : (
            <div className="empty-state-card">
              <Truck size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
              <p style={{ fontWeight: 600 }}>Delivery not found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const failureText = getFailureReason(delivery);
  const canUpdateStatus = delivery.status === 'dispatched';

  return (
    <div className="sales-page">
      <div className="sales-sticky-stack">
        <div className="sales-page-header">
          <div className="sales-page-header__left" style={{ flex: 1 }}>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => navigate('/sales/deliveries')}
              style={{ marginBottom: 8, alignSelf: 'flex-start' }}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="order-detail-header-title">
              <h1>{delivery.delivery_number}</h1>
              <span className={`badge ${getDeliveryBadgeClass(delivery)}`}>
                {getDeliveryStatusLabel(delivery)}
              </span>
            </div>

            <p className="sales-page-header__breadcrumb">
              Sales / Deliveries / {delivery.delivery_number}
            </p>

            <div className="order-detail-actions">
              {canUpdateStatus && (
                <>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleConfirmReceipt}
                    disabled={isSubmitting}
                  >
                    <CheckCircle2 size={16} />
                    {isSubmitting ? 'Confirming...' : 'Confirm Receipt'}
                  </button>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => setShowFailModal(true)}
                    disabled={isSubmitting}
                  >
                    <XCircle size={16} />
                    Mark as Failed
                  </button>
                </>
              )}
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => navigate(`/sales/orders/${delivery.sales_order}`)}
              >
                <FileText size={16} />
                View Sales Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sales-content" style={{ paddingTop: 24 }}>
        {error && (
          <div className="error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={clearError}>
              Dismiss
            </button>
          </div>
        )}

        {delivery.status === 'failed' && (
          <div className="delivery-failure-banner">
            <AlertCircle size={20} />
            <div>
              <strong>Delivery failed</strong>
              <p>{failureText || 'No failure reason was provided.'}</p>
              <button
                type="button"
                className="table-link table-link-button"
                onClick={() => navigate(`/sales/orders/${delivery.sales_order}`)}
              >
                Return to order {delivery.order_number}
              </button>
            </div>
          </div>
        )}

        <div className="order-detail-layout">
          <aside className="order-detail-sidebar">
            <div className="od-card">
              <div className="od-card__header">Delivery Details</div>
              <div className="od-meta-grid">
                <div className="od-meta-item">
                  <span className="od-meta-label">Sales Order</span>
                  <button
                    type="button"
                    className="table-link table-link-button od-meta-value"
                    onClick={() => navigate(`/sales/orders/${delivery.sales_order}`)}
                  >
                    {delivery.order_number}
                  </button>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Customer</span>
                  <span className="od-meta-value">{delivery.customer_name || '-'}</span>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Warehouse</span>
                  <span className="od-meta-value">{delivery.warehouse_name}</span>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Expected Delivery</span>
                  <span className="od-meta-value">{formatDate(delivery.expected_delivery_date)}</span>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Dispatched At</span>
                  <span className="od-meta-value">{formatDateTime(delivery.dispatched_at)}</span>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Delivered At</span>
                  <span className="od-meta-value">{formatDateTime(delivery.delivered_at)}</span>
                </div>
                {delivery.driver_name && (
                  <div className="od-meta-item">
                    <span className="od-meta-label">Driver</span>
                    <span className="od-meta-value">{delivery.driver_name}</span>
                  </div>
                )}
                {delivery.vehicle && (
                  <div className="od-meta-item">
                    <span className="od-meta-label">Vehicle</span>
                    <span className="od-meta-value">{delivery.vehicle}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="od-card">
              <div className="od-card__header">Status Timeline</div>
              <div className="status-timeline">
                <div className="timeline-item completed">
                  <div className="timeline-icon">
                    <Truck size={15} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-label">Dispatched</div>
                    <div className="timeline-date">{formatDateTime(delivery.dispatched_at)}</div>
                  </div>
                </div>
                <div className={`timeline-item ${delivery.status === 'delivered' ? 'completed' : ''}`}>
                  <div className="timeline-icon">
                    {delivery.status === 'delivered' ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-label">Receipt Confirmed</div>
                    <div className="timeline-date">{formatDateTime(delivery.delivered_at)}</div>
                  </div>
                </div>
                {delivery.status === 'failed' && (
                  <div className="timeline-item completed">
                    <div className="timeline-icon">
                      <XCircle size={15} style={{ color: '#ef4444' }} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-label" style={{ color: '#ef4444' }}>Failed</div>
                      <div className="timeline-date">Return to {delivery.order_number}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {delivery.notes && (
              <div className="od-card">
                <div className="od-card__header">Notes</div>
                <p className="od-notes">{delivery.notes}</p>
              </div>
            )}
          </aside>

          <main className="order-detail-main">
            <div className="od-card">
              <div className="od-card__header">Dispatch Lines</div>
              <div className="sales-table-container" style={{ borderRadius: 0, border: 'none' }}>
                <table className="sales-table delivery-lines-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity Dispatched</th>
                      <th>Batch Number</th>
                      <th>Stock Movement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delivery.lines.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>
                          <Package size={28} style={{ marginBottom: 8 }} />
                          <div>No dispatch lines found</div>
                        </td>
                      </tr>
                    ) : (
                      delivery.lines.map((line) => {
                        const movement = getLineStockMovement(line);
                        return (
                          <tr key={line.id}>
                            <td style={{ fontWeight: 600 }}>{line.product_name}</td>
                            <td className="table-amount">{formatQuantity(line.quantity_delivered)}</td>
                            <td>
                              <span className="delivery-trace-chip">{line.batch_number || '-'}</span>
                            </td>
                            <td>
                              {movement.id ? (
                                <button
                                  type="button"
                                  className="table-link table-link-button"
                                  onClick={() => navigate(`/inventory/stock_movements/${movement.id}`)}
                                >
                                  {movement.label}
                                </button>
                              ) : (
                                <span>{movement.label}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {delivery.status === 'failed' && (
              <div className="od-card">
                <div className="od-card__header">Failure Recovery</div>
                <div className="delivery-recovery-card">
                  <RotateCcw size={20} />
                  <div>
                    <strong>Return workflow</strong>
                    <p>
                      This failed delivery should be reviewed from sales order{' '}
                      <button
                        type="button"
                        className="table-link table-link-button"
                        onClick={() => navigate(`/sales/orders/${delivery.sales_order}`)}
                      >
                        {delivery.order_number}
                      </button>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showFailModal && (
        <div className="modal-overlay" onClick={() => setShowFailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Mark Delivery as Failed</h3>
            <p>
              Record why <strong>{delivery.delivery_number}</strong> failed. This keeps the delivery linked to{' '}
              <strong>{delivery.order_number}</strong> for follow-up.
            </p>
            <div className="form-group">
              <label>
                Failure Reason <span className="required">*</span>
              </label>
              <textarea
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="Example: Customer unavailable, damaged goods, wrong address..."
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setShowFailModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={handleMarkFailed}
                disabled={isSubmitting || !failureReason.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Mark Failed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getFailureReason(delivery: Delivery): string {
  return delivery.failure_reason || delivery.failed_reason || delivery.reason || '';
}

function getLineStockMovement(line: DeliveryLine): { id: string; label: string } {
  const id = line.stock_movement_id || line.stock_movement || line.movement_id || line.movement || '';
  const label = line.stock_movement_reference || line.movement_reference || id || '-';
  return { id, label };
}

function getDeliveryStatusLabel(delivery: Delivery): string {
  if (delivery.status === 'dispatched') return 'In Transit';
  return delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1);
}

function getDeliveryBadgeClass(delivery: Delivery): string {
  return `badge-${delivery.status}`;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatQuantity(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : value;
}

export default DeliveryDetailPage;
