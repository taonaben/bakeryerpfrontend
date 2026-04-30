import React from 'react';
import type { SupplierInvoice } from '../../types/supplier_invoices_model';

interface SupplierInvoiceOverviewCardProps {
  supplierInvoice: SupplierInvoice;
}

const SupplierInvoiceOverviewCard: React.FC<SupplierInvoiceOverviewCardProps> = ({
  supplierInvoice,
}) => {
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
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(parsed);
  };

  const statusClass = supplierInvoice.status.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="overview-card">
      <div className="overview-grid">
        <div className="overview-item">
          <label className="overview-label">Invoice Number</label>
          <div className="overview-value">
            <code>{supplierInvoice.invoice_number}</code>
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Status</label>
          <div className="overview-value">
            <span className={`badge ${statusClass}`}>{supplierInvoice.status}</span>
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Supplier</label>
          <div className="overview-value">{supplierInvoice.supplier_name || '—'}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Warehouse</label>
          <div className="overview-value">{supplierInvoice.warehouse_name || '—'}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">PO Reference</label>
          <div className="overview-value">{supplierInvoice.po_number || '—'}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Invoice Date</label>
          <div className="overview-value">{formatDate(supplierInvoice.invoice_date)}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Due Date</label>
          <div className="overview-value">{formatDate(supplierInvoice.due_date)}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Total Amount</label>
          <div className="overview-value po-detail-value">{formatCurrency(supplierInvoice.total_amount)}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Items</label>
          <div className="overview-value">{supplierInvoice.line_items?.length ?? supplierInvoice.item_count ?? 0}</div>
        </div>

        {supplierInvoice.payment_reference && (
          <div className="overview-item">
            <label className="overview-label">Payment Reference</label>
            <div className="overview-value">{supplierInvoice.payment_reference}</div>
          </div>
        )}

        {supplierInvoice.description && (
          <div className="overview-item full-width">
            <label className="overview-label">Description</label>
            <div className="overview-value">{supplierInvoice.description}</div>
          </div>
        )}
      </div>

      <div className="line-items-section">
        <h3 className="line-items-heading">
          Invoice Lines
          <span className="line-items-count">{supplierInvoice.line_items?.length ?? 0}</span>
        </h3>

        {supplierInvoice.line_items && supplierInvoice.line_items.length > 0 ? (
          <table className="line-items-table po-detail-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th className="numeric">Qty Invoiced</th>
                <th>UoM</th>
                <th className="numeric">Unit Price</th>
                <th className="numeric">Line Total</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {supplierInvoice.line_items.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-muted">{index + 1}</td>
                  <td className="product-cell">{item.product_name || item.product}</td>
                  <td className="quantity-cell numeric">{Number(item.quantity_invoiced).toLocaleString()}</td>
                  <td>{item.unit_of_measure || '—'}</td>
                  <td className="numeric">{formatCurrency(item.unit_price)}</td>
                  <td className="numeric">{formatCurrency(item.total_price)}</td>
                  <td className="text-muted">{item.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state-card">No invoice lines</div>
        )}
      </div>

      <div className="po-detail-summary">
        <div className="po-detail-summary-grid">
          <div className="po-detail-summary-card">
            <label>Item Count</label>
            <strong>{supplierInvoice.item_count || supplierInvoice.line_items?.length || 0}</strong>
          </div>
          <div className="po-detail-summary-card">
            <label>Invoice Total</label>
            <strong>{formatCurrency(supplierInvoice.total_amount)}</strong>
          </div>
        </div>
      </div>

      <div className="overview-audit">
        <div className="audit-item">
          <span className="audit-label">Created:</span>
          <span className="audit-value">{formatDate(supplierInvoice.created_at)}</span>
        </div>
        {supplierInvoice.updated_at && (
          <div className="audit-item">
            <span className="audit-label">Last Updated:</span>
            <span className="audit-value">{formatDate(supplierInvoice.updated_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierInvoiceOverviewCard;
