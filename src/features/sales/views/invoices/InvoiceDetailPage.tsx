import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CreditCard,
  Download,
  FileText,
  Receipt,
} from 'lucide-react';
import { useInvoicesStore } from '../../stores/invoicesStore';
import { invoicesService } from '../../services/invoicesService';
import type { Invoice, InvoiceLine } from '../../types/invoices_models';
import type { PaymentMethod } from '../../types/shared';
import '../../styles/sales.css';
import '../../../procurement/styles/procurement.css';

const PAYMENT_METHODS: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Cheque', value: 'cheque' },
];

const InvoiceDetailPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const {
    detailMap,
    paymentsMap,
    isLoading,
    isSubmitting,
    error,
    fetchById,
    fetchPayments,
    recordPayment,
    cancel,
    clearError,
  } = useInvoicesStore();

  const invoice = invoiceId ? detailMap[invoiceId] : null;
  const payments = invoiceId ? (paymentsMap[invoiceId] ?? []) : [];

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash' as PaymentMethod,
    reference: '',
    notes: '',
  });

  useEffect(() => {
    if (!invoiceId) {
      navigate('/sales/invoices', { replace: true });
      return;
    }

    fetchById(invoiceId, true);
    fetchPayments(invoiceId);
  }, [fetchById, fetchPayments, invoiceId, navigate]);

  useEffect(() => {
    if (!invoice) return;
    setPaymentForm((prev) => ({
      ...prev,
      amount: getBalanceRemaining(invoice).toFixed(2),
    }));
  }, [invoice]);

  const handleRecordPayment = async () => {
    if (!invoiceId) return;

    await recordPayment(invoiceId, {
      amount: paymentForm.amount,
      payment_method: paymentForm.payment_method,
      reference: paymentForm.reference.trim() || undefined,
      notes: paymentForm.notes.trim() || undefined,
    });

    setShowPaymentModal(false);
    setPaymentForm({
      amount: '',
      payment_method: 'cash',
      reference: '',
      notes: '',
    });
    await fetchById(invoiceId, true);
    await fetchPayments(invoiceId);
  };

  const handleCancel = async () => {
    if (!invoiceId) return;

    await cancel(invoiceId, { reason: cancelReason.trim() || undefined });
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleDownloadPDF = async () => {
    if (!invoiceId) return;

    const pdf = await invoicesService.getPDF(invoiceId);
    const url = pdf.download_url || pdf.pdf_url || pdf.url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    window.alert(pdf.detail || 'PDF generated, but no download URL was returned.');
  };

  if (isLoading && !invoice) {
    return (
      <div className="sales-page">
        <div className="sales-content">
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading invoice...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="sales-page">
        <div className="sales-sticky-stack">
          <div className="sales-page-header">
            <button className="btn btn-outline" type="button" onClick={() => navigate('/sales/invoices')}>
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
              <button type="button" onClick={() => invoiceId && fetchById(invoiceId, true)}>
                Retry
              </button>
            </div>
          ) : (
            <div className="empty-state-card">
              <FileText size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
              <p style={{ fontWeight: 600 }}>Invoice not found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const subtotal = Number(invoice.subtotal) || sumLineTotals(invoice.lines);
  const discount = getDiscountAmount(invoice);
  const tax = Number(invoice.tax_amount) || 0;
  const grandTotal = getInvoiceTotal(invoice);
  const amountPaid = getAmountPaid(invoice, payments);
  const balance = getBalanceRemaining(invoice, payments);

  return (
    <div className="sales-page">
      <div className="sales-sticky-stack">
        <div className="sales-page-header">
          <div className="sales-page-header__left" style={{ flex: 1 }}>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => navigate('/sales/invoices')}
              style={{ marginBottom: 8, alignSelf: 'flex-start' }}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="order-detail-header-title">
              <h1>{invoice.invoice_number}</h1>
              <span className={`badge badge-${invoice.status}`}>{formatStatus(invoice.status)}</span>
            </div>
            <p className="sales-page-header__breadcrumb">
              Sales / Invoices / {invoice.invoice_number}
            </p>

            <div className="order-detail-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setShowPaymentModal(true)}
                disabled={isSubmitting || invoice.status === 'paid' || invoice.status === 'cancelled'}
              >
                <CreditCard size={16} />
                Record Payment
              </button>
              <button className="btn btn-outline" type="button" onClick={handleDownloadPDF}>
                <Download size={16} />
                Download PDF
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => setShowCancelModal(true)}
                disabled={isSubmitting || invoice.status === 'paid' || invoice.status === 'cancelled'}
              >
                <Ban size={16} />
                Cancel
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

        <div className="invoice-detail-balance">
          <div>
            <span>Outstanding Balance</span>
            <strong className={balance > 0 ? 'invoice-detail-balance__amount--due' : ''}>
              {formatMoney(balance)}
            </strong>
          </div>
          <Receipt size={32} />
        </div>

        <div className="order-detail-layout">
          <aside className="order-detail-sidebar">
            <div className="od-card">
              <div className="od-card__header">Customer & Invoice</div>
              <div className="od-meta-grid">
                <div className="od-meta-item od-meta-item--full">
                  <span className="od-meta-label">Customer</span>
                  <span className="od-meta-value">{invoice.customer_name}</span>
                </div>
                {invoice.customer_email && (
                  <div className="od-meta-item od-meta-item--full">
                    <span className="od-meta-label">Email</span>
                    <span className="od-meta-value">{invoice.customer_email}</span>
                  </div>
                )}
                {invoice.customer_phone && (
                  <div className="od-meta-item od-meta-item--full">
                    <span className="od-meta-label">Phone</span>
                    <span className="od-meta-value">{invoice.customer_phone}</span>
                  </div>
                )}
                <div className="od-meta-item">
                  <span className="od-meta-label">Invoice Date</span>
                  <span className="od-meta-value">{formatDate(invoice.issued_date)}</span>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Due Date</span>
                  <span className="od-meta-value">{formatDate(invoice.due_date)}</span>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Payment Terms</span>
                  <span className="od-meta-value">{invoice.payment_terms || '-'}</span>
                </div>
                <div className="od-meta-item">
                  <span className="od-meta-label">Sales Order</span>
                  <button
                    type="button"
                    className="table-link table-link-button od-meta-value"
                    onClick={() => navigate(`/sales/orders/${invoice.sales_order}`)}
                  >
                    {invoice.order_number || invoice.sales_order}
                  </button>
                </div>
              </div>
            </div>

            <div className="od-card">
              <div className="od-card__header">Payment Summary</div>
              <div className="invoice-payment-summary">
                <div>
                  <span>Total</span>
                  <strong>{formatMoney(grandTotal)}</strong>
                </div>
                <div>
                  <span>Paid</span>
                  <strong>{formatMoney(amountPaid)}</strong>
                </div>
                <div>
                  <span>Outstanding</span>
                  <strong className={balance > 0 ? 'invoice-detail-balance__amount--due' : ''}>
                    {formatMoney(balance)}
                  </strong>
                </div>
              </div>
            </div>
          </aside>

          <main className="order-detail-main">
            <div className="od-card">
              <div className="od-card__header">Line Items</div>
              <div className="sales-table-container" style={{ borderRadius: 0, border: 'none' }}>
                <table className="sales-table invoice-detail-lines">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lines.map((line) => (
                      <tr key={`${line.product_id}-${line.product_name}`}>
                        <td style={{ fontWeight: 600 }}>{line.product_name}</td>
                        <td className="table-amount">{formatNumber(line.quantity_dispatched)}</td>
                        <td className="table-amount">{formatMoney(Number(line.unit_price))}</td>
                        <td className="table-amount">{formatMoney(Number(line.line_total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoice-detail-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatMoney(subtotal)}</strong>
                </div>
                <div>
                  <span>Discounts</span>
                  <strong>{formatMoney(discount)}</strong>
                </div>
                <div>
                  <span>Tax</span>
                  <strong>{formatMoney(tax)}</strong>
                </div>
                <div className="invoice-detail-totals__grand">
                  <span>Grand Total</span>
                  <strong>{formatMoney(grandTotal)}</strong>
                </div>
              </div>
            </div>

            <div className="od-card">
              <div className="od-card__header">Payment History</div>
              <div className="sales-table-container" style={{ borderRadius: 0, border: 'none' }}>
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                          No payments recorded for this invoice.
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{formatDateTime(payment.payment_date)}</td>
                          <td className="table-amount">{formatMoney(Number(payment.amount))}</td>
                          <td>
                            <span className={`badge badge-method-${payment.payment_method}`}>
                              {payment.payment_method.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{payment.reference || '-'}</td>
                          <td>{payment.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Record Payment</h3>
            <p>
              Remaining balance: <strong>{formatMoney(balance)}</strong>
            </p>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    payment_method: e.target.value as PaymentMethod,
                  }))
                }
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Reference</label>
              <input
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, reference: e.target.value }))}
                placeholder="Receipt, transfer, or transaction reference"
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleRecordPayment}
                disabled={isSubmitting || Number(paymentForm.amount) <= 0}
              >
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Invoice</h3>
            <p>
              Cancel <strong>{invoice.invoice_number}</strong>? This will remove it from active collections.
            </p>
            <div className="form-group">
              <label>Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Optional cancellation reason"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setShowCancelModal(false)}>
                Keep Invoice
              </button>
              <button className="btn btn-danger" type="button" onClick={handleCancel} disabled={isSubmitting}>
                {isSubmitting ? 'Cancelling...' : 'Cancel Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getInvoiceTotal(invoice: Invoice): number {
  return Number(invoice.total_amount) || 0;
}

function getAmountPaid(invoice: Invoice, payments: Array<{ amount: string }> = []): number {
  const explicit = invoice.amount_paid ?? invoice.paid_amount;
  if (explicit !== undefined && explicit !== null && explicit !== '') return Number(explicit) || 0;
  if (invoice.status === 'paid') return getInvoiceTotal(invoice);
  return payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
}

function getBalanceRemaining(invoice: Invoice, payments: Array<{ amount: string }> = []): number {
  const explicit = invoice.balance_remaining ?? invoice.outstanding_balance;
  if (explicit !== undefined && explicit !== null && explicit !== '') return Number(explicit) || 0;
  return Math.max(getInvoiceTotal(invoice) - getAmountPaid(invoice, payments), 0);
}

function getDiscountAmount(invoice: Invoice): number {
  return Number(invoice.discount_amount ?? invoice.discounts ?? 0) || 0;
}

function sumLineTotals(lines: InvoiceLine[]): number {
  return lines.reduce((sum, line) => sum + (Number(line.line_total) || 0), 0);
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatNumber(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : value;
}

export default InvoiceDetailPage;
