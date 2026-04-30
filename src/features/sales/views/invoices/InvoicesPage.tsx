import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Ban,
  CreditCard,
  Download,
  Eye,
  FileText,
  Receipt,
  X,
} from 'lucide-react';
import { useInvoicesStore } from '../../stores/invoicesStore';
import { invoicesService } from '../../services/invoicesService';
import type { Invoice, InvoiceDetail } from '../../types/invoices_models';
import type { InvoiceStatus, PaymentMethod } from '../../types/shared';
import '../../styles/sales.css';
import '../../../procurement/styles/procurement.css';

type InvoiceStatusFilter = '' | InvoiceStatus;

const STATUS_TABS: Array<{ label: string; value: InvoiceStatusFilter }> = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Issued', value: 'issued' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Cancelled', value: 'cancelled' },
];

const PAYMENT_METHODS: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Cheque', value: 'cheque' },
];

const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    detailMap,
    isLoading,
    isSubmitting,
    error,
    fetchAll,
    fetchById,
    cancel,
    recordPayment,
    clearError,
  } = useInvoicesStore();

  const [activeStatus, setActiveStatus] = useState<InvoiceStatusFilter>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null);
  const [cancelInvoice, setCancelInvoice] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash' as PaymentMethod,
    reference: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    await fetchAll(undefined, true);
  }, [fetchAll]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const overdueInvoices = useMemo(() => items.filter(isOverdueInvoice), [items]);
  const overdueCount = overdueInvoices.length;

  const visibleInvoices = useMemo(() => {
    if (!activeStatus) return items;
    if (activeStatus === 'overdue') return overdueInvoices;
    return items.filter((invoice) => invoice.status === activeStatus);
  }, [activeStatus, items, overdueInvoices]);

  const stats = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return items.reduce(
      (acc, invoice) => {
        const issued = new Date(invoice.issued_date);
        const isThisMonth = issued.getMonth() === month && issued.getFullYear() === year;
        const total = getInvoiceTotal(invoice);
        const paid = getAmountPaid(invoice);
        const balance = getBalanceRemaining(invoice);

        if (isThisMonth) {
          acc.totalInvoiced += total;
          acc.totalCollected += paid;
        }

        if (invoice.status !== 'cancelled') {
          acc.totalOutstanding += balance;
          if (isOverdueInvoice(invoice)) acc.overdueAmount += balance;
        }

        return acc;
      },
      {
        totalInvoiced: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        overdueAmount: 0,
      },
    );
  }, [items]);

  const handleOpenPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: getBalanceRemaining(invoice).toFixed(2),
      payment_method: 'cash',
      reference: '',
      notes: '',
    });
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;

    await recordPayment(selectedInvoice.id, {
      amount: paymentForm.amount,
      payment_method: paymentForm.payment_method,
      reference: paymentForm.reference.trim() || undefined,
      notes: paymentForm.notes.trim() || undefined,
    });

    setSelectedInvoice(null);
    await fetchData();
  };

  const handleCancelInvoice = async () => {
    if (!cancelInvoice) return;

    await cancel(cancelInvoice.id, { reason: cancelReason.trim() || undefined });
    setCancelInvoice(null);
    setCancelReason('');
  };

  const handleViewDetail = async (invoice: Invoice) => {
    navigate(`/sales/invoices/${invoice.id}`);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    const pdf = await invoicesService.getPDF(invoice.id);
    const url = pdf.download_url || pdf.pdf_url || pdf.url;

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    window.alert(pdf.detail || 'PDF generated, but no download URL was returned.');
  };

  const detailInvoice = detailInvoiceId ? detailMap[detailInvoiceId] : null;

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <div className="finance-invoice-title">
              <div className="finance-invoice-title__icon">
                <Receipt size={22} />
              </div>
              <div>
                <h1>Invoices</h1>
                <p className="procurement-page-header__breadcrumb">Finance / Invoices</p>
              </div>
            </div>
          </div>
          <div className="procurement-page-header__actions">
            <button className="btn btn-outline" type="button" onClick={fetchData}>
              Refresh
            </button>
          </div>
        </div>

        <div className="finance-invoice-tabs" role="tablist" aria-label="Invoice status filters">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value || 'all'}
              type="button"
              role="tab"
              aria-selected={activeStatus === tab.value}
              className={`finance-invoice-tab ${activeStatus === tab.value ? 'finance-invoice-tab--active' : ''}`}
              onClick={() => setActiveStatus(tab.value)}
            >
              <span>{tab.label}</span>
              {tab.value === 'overdue' && (
                <span className="finance-overdue-count">{overdueCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="sales-summary-cards">
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Total Invoiced This Month</div>
            <div className="sales-summary-card__value">{formatMoney(stats.totalInvoiced)}</div>
          </div>
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Total Collected This Month</div>
            <div className="sales-summary-card__value sales-summary-card__value--info">
              {formatMoney(stats.totalCollected)}
            </div>
          </div>
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Total Outstanding</div>
            <div className="sales-summary-card__value sales-summary-card__value--warning">
              {formatMoney(stats.totalOutstanding)}
            </div>
          </div>
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Overdue Amount</div>
            <div className="sales-summary-card__value sales-summary-card__value--danger">
              {formatMoney(stats.overdueAmount)}
            </div>
          </div>
        </div>
      </div>

      <div className="procurement-content">
        {error && (
          <div className="error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={clearError}>
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading invoices...</span>
          </div>
        ) : visibleInvoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <FileText size={48} />
            </div>
            <h3 className="empty-state__title">No invoices found</h3>
            <p className="empty-state__description">
              There are no invoices for the selected status.
            </p>
          </div>
        ) : (
          <div className="sales-table-container finance-invoices-table-container">
            <table className="sales-table finance-invoices-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Sales Order</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Amount Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Days Overdue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleInvoices.map((invoice) => {
                  const overdueDays = getDaysOverdue(invoice);
                  return (
                    <tr
                      key={invoice.id}
                      onClick={() => navigate(`/sales/invoices/${invoice.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <button
                          className="table-link table-link-button"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(invoice);
                          }}
                        >
                          {invoice.invoice_number}
                        </button>
                      </td>
                      <td>{invoice.customer_name}</td>
                      <td>{invoice.order_number || '-'}</td>
                      <td>{formatDate(invoice.issued_date)}</td>
                      <td>{formatDate(invoice.due_date)}</td>
                      <td className="table-amount">{formatMoney(getInvoiceTotal(invoice))}</td>
                      <td className="table-amount">{formatMoney(getAmountPaid(invoice))}</td>
                      <td className="table-amount">{formatMoney(getBalanceRemaining(invoice))}</td>
                      <td>
                        <span className={`badge badge-${invoice.status}`}>
                          {formatStatus(invoice.status)}
                        </span>
                      </td>
                      <td>
                        {overdueDays > 0 ? (
                          <span className="finance-overdue-days">{overdueDays}d</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className="finance-invoice-actions">
                          <button
                            className="btn-icon"
                            type="button"
                            title="Record payment"
                            aria-label="Record payment"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPayment(invoice);
                            }}
                            disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
                          >
                            <CreditCard size={16} />
                          </button>
                          <button
                            className="btn-icon"
                            type="button"
                            title="Download PDF"
                            aria-label="Download PDF"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(invoice);
                            }}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            className="btn-icon"
                            type="button"
                            title="Cancel invoice"
                            aria-label="Cancel invoice"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCancelInvoice(invoice);
                            }}
                            disabled={invoice.status === 'cancelled' || invoice.status === 'paid'}
                          >
                            <Ban size={16} />
                          </button>
                          <button
                            className="btn-icon"
                            type="button"
                            title="View detail"
                            aria-label="View detail"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(invoice);
                            }}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Record Payment</h3>
            <p>
              {selectedInvoice.invoice_number} has a remaining balance of{' '}
              <strong>{formatMoney(getBalanceRemaining(selectedInvoice))}</strong>.
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
              <button className="btn btn-outline" type="button" onClick={() => setSelectedInvoice(null)}>
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

      {cancelInvoice && (
        <div className="modal-overlay" onClick={() => setCancelInvoice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Invoice</h3>
            <p>
              Cancel <strong>{cancelInvoice.invoice_number}</strong>? This will remove it from active collections.
            </p>
            <div className="form-group">
              <label>Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Optional cancellation reason"
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setCancelInvoice(null)}>
                Keep Invoice
              </button>
              <button className="btn btn-danger" type="button" onClick={handleCancelInvoice} disabled={isSubmitting}>
                {isSubmitting ? 'Cancelling...' : 'Cancel Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailInvoiceId && (
        <InvoiceDetailModal
          invoice={detailInvoice}
          isLoading={isLoading && !detailInvoice}
          onClose={() => setDetailInvoiceId(null)}
        />
      )}
    </div>
  );
};

interface InvoiceDetailModalProps {
  invoice: InvoiceDetail | null;
  isLoading: boolean;
  onClose: () => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, isLoading, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content finance-invoice-detail-modal" onClick={(e) => e.stopPropagation()}>
      <div className="finance-modal-header">
        <h3>{invoice?.invoice_number ?? 'Invoice Detail'}</h3>
        <button className="btn-icon" type="button" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading invoice...</span>
        </div>
      ) : invoice ? (
        <>
          <div className="overview-grid finance-invoice-detail-grid">
            <div className="overview-item">
              <span className="overview-label">Customer</span>
              <span className="overview-value">{invoice.customer_name}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Sales Order</span>
              <span className="overview-value">{invoice.order_number}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Issued</span>
              <span className="overview-value">{formatDate(invoice.issued_date)}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Due</span>
              <span className="overview-value">{formatDate(invoice.due_date)}</span>
            </div>
          </div>
          <table className="sales-table finance-detail-lines">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line) => (
                <tr key={`${line.product_id}-${line.product_name}`}>
                  <td>{line.product_name}</td>
                  <td className="table-amount">{formatNumber(line.quantity_dispatched)}</td>
                  <td className="table-amount">{formatMoney(Number(line.unit_price))}</td>
                  <td className="table-amount">{formatMoney(Number(line.line_total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>Invoice detail could not be loaded.</p>
      )}
    </div>
  </div>
);

function isOverdueInvoice(invoice: Invoice): boolean {
  if (invoice.status === 'cancelled' || invoice.status === 'paid') return false;
  if (invoice.status === 'overdue') return true;
  return getDaysOverdue(invoice) > 0 && getBalanceRemaining(invoice) > 0;
}

function getDaysOverdue(invoice: Invoice): number {
  if (!invoice.due_date) return 0;
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(invoice.due_date));
  const diff = today.getTime() - due.getTime();
  return diff > 0 ? Math.floor(diff / 86_400_000) : 0;
}

function getInvoiceTotal(invoice: Invoice): number {
  return Number(invoice.total_amount) || 0;
}

function getAmountPaid(invoice: Invoice): number {
  const explicit = invoice.amount_paid ?? invoice.paid_amount;
  if (explicit !== undefined && explicit !== null && explicit !== '') return Number(explicit) || 0;
  return invoice.status === 'paid' ? getInvoiceTotal(invoice) : 0;
}

function getBalanceRemaining(invoice: Invoice): number {
  const explicit = invoice.balance_remaining ?? invoice.outstanding_balance;
  if (explicit !== undefined && explicit !== null && explicit !== '') return Number(explicit) || 0;
  return Math.max(getInvoiceTotal(invoice) - getAmountPaid(invoice), 0);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatNumber(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : value;
}

export default InvoicesPage;
