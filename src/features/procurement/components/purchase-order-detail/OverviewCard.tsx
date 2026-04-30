import React from 'react';
import type { PurchaseOrder } from '../../types/purchase_orders_models';

interface PurchaseOrderOverviewCardProps {
  purchaseOrder: PurchaseOrder;
}

const PurchaseOrderOverviewCard: React.FC<PurchaseOrderOverviewCardProps> = ({ purchaseOrder }) => {
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
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

  const statusClass = purchaseOrder.status.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="overview-card">
      <div className="overview-grid">
        <div className="overview-item">
          <label className="overview-label">PO Number</label>
          <div className="overview-value">
            <code>{purchaseOrder.po_number}</code>
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Status</label>
          <div className="overview-value">
            <span className={`badge ${statusClass}`}>{purchaseOrder.status}</span>
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Supplier</label>
          <div className="overview-value">{purchaseOrder.supplier_name || '—'}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Warehouse</label>
          <div className="overview-value">{purchaseOrder.warehouse_name || '—'}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Order Date</label>
          <div className="overview-value">{formatDate(purchaseOrder.order_date)}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Expected Delivery</label>
          <div className="overview-value">{formatDate(purchaseOrder.expected_delivery_date)}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Currency</label>
          <div className="overview-value">{purchaseOrder.currency || '—'}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Total Amount</label>
          <div className="overview-value po-detail-value">{formatCurrency(purchaseOrder.total_amount)}</div>
        </div>

        {purchaseOrder.purchase_requisition && purchaseOrder.pr_number && (
          <div className="overview-item">
            <label className="overview-label">Originating Requisition</label>
            <div className="overview-value">{purchaseOrder.pr_number}</div>
          </div>
        )}

        <div className="overview-item">
          <label className="overview-label">Items</label>
          <div className="overview-value">{purchaseOrder.line_items?.length ?? purchaseOrder.item_count ?? 0}</div>
        </div>

        {purchaseOrder.description && (
          <div className="overview-item full-width">
            <label className="overview-label">Description</label>
            <div className="overview-value">{purchaseOrder.description}</div>
          </div>
        )}
      </div>

      <div className="line-items-section">
        <h3 className="line-items-heading">
          Line Items
          <span className="line-items-count">{purchaseOrder.line_items?.length ?? 0}</span>
        </h3>

        {purchaseOrder.line_items && purchaseOrder.line_items.length > 0 ? (
          <table className="line-items-table po-detail-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th className="numeric">Ordered</th>
                <th className="numeric">Received</th>
                <th>UoM</th>
                <th className="numeric">Unit Price</th>
                <th className="numeric">Line Total</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrder.line_items.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-muted">{index + 1}</td>
                  <td className="product-cell">{item.product_name || item.product}</td>
                  <td className="quantity-cell numeric">{Number(item.quantity).toLocaleString()}</td>
                  <td className="quantity-cell numeric">{Number(item.quantity_received).toLocaleString()}</td>
                  <td>{item.unit_of_measure || '—'}</td>
                  <td className="numeric">{formatCurrency(item.unit_price)}</td>
                  <td className="numeric">{formatCurrency(item.total_price)}</td>
                  <td className="text-muted">{item.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state-card">No line items</div>
        )}
      </div>

      <div className="po-detail-summary">
        <div className="po-detail-summary-grid">
          <div className="po-detail-summary-card">
            <label>Item Count</label>
            <strong>{purchaseOrder.item_count || purchaseOrder.line_items?.length || 0}</strong>
          </div>
          <div className="po-detail-summary-card">
            <label>Grand Total</label>
            <strong>{formatCurrency(purchaseOrder.total_amount)}</strong>
          </div>
        </div>
      </div>

      <div className="overview-audit">
        <div className="audit-item">
          <span className="audit-label">Created:</span>
          <span className="audit-value">{formatDate(purchaseOrder.created_at)}</span>
        </div>
        {purchaseOrder.updated_at && (
          <div className="audit-item">
            <span className="audit-label">Last Updated:</span>
            <span className="audit-value">{formatDate(purchaseOrder.updated_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderOverviewCard;
