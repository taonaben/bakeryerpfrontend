import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CreditCard,
  Plus,
  Search,
  User,
  Warehouse as WarehouseIcon,
  X,
} from 'lucide-react';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type { Warehouse } from '../../../../core/warehouses/types/models';
import { useCustomersStore } from '../../stores/customersStore';
import { useInvoicesStore } from '../../stores/invoicesStore';
import { usePaymentsStore } from '../../stores/paymentsStore';
import type { Customer } from '../../types/customers_models';
import type { Invoice } from '../../types/invoices_models';
import type { Payment } from '../../types/payments_models';
import type { PaymentMethod } from '../../types/shared';
import '../../styles/sales.css';
import '../../../procurement/styles/procurement.css';

const PAYMENT_METHODS: Array<{ label: string; value: PaymentMethod | '' }> = [
  { label: 'All Methods', value: '' },
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cheque', value: 'cheque' },
];

const RECORD_METHODS: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cheque', value: 'cheque' },
];

const PaymentsPage: React.FC = () => {
  const {
    items: payments,
    isLoading,
    error,
    fetchAll: fetchPayments,
    clearError,
  } = usePaymentsStore();

  const {
    items: invoices,
    fetchAll: fetchInvoices,
    recordPayment,
    isSubmitting,
    error: invoiceError,
    clearError: clearInvoiceError,
  } = useInvoicesStore();

  const {
    items: customers,
    fetchAll: fetchCustomers,
  } = useCustomersStore();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseError, setWarehouseError] = useState<string | null>(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelCustomerId, setPanelCustomerId] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash' as PaymentMethod,
    payment_date: new Date().toISOString().slice(0, 10),
    reference: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    await fetchPayments(
      {
        customer_id: customerId || undefined,
        warehouse_id: warehouseId || undefined,
        payment_method: paymentMethod || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      },
      true,
    );
  }, [customerId, dateFrom, dateTo, fetchPayments, paymentMethod, warehouseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchCustomers(undefined, true);
    fetchInvoices(undefined, true);

    let cancelled = false;
    warehouseService
      .getWarehouses()
      .then((data) => {
        if (!cancelled) setWarehouses(data);
      })
      .catch((err: any) => {
        if (!cancelled) setWarehouseError(err?.message ?? 'Failed to load warehouses');
      });

    return () => {
      cancelled = true;
    };
  }, [fetchCustomers, fetchInvoices]);

  const filteredPayments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return payments;

    return payments.filter((payment) =>
      [
        getPaymentReference(payment),
        payment.customer_name,
        payment.invoice_number,
        payment.received_by,
        payment.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [payments, searchTerm]);

  const openInvoices = useMemo(() => {
    const query = invoiceSearch.trim().toLowerCase();

    return invoices
      .filter((invoice) => invoice.status !== 'paid' && invoice.status !== 'cancelled')
      .filter((invoice) => !panelCustomerId || invoice.customer === panelCustomerId)
      .filter((invoice) => {
        if (!query) return true;
        return [invoice.invoice_number, invoice.customer_name, invoice.order_number]
          .join(' ')
          .toLowerCase()
          .includes(query);
      });
  }, [invoiceSearch, invoices, panelCustomerId]);

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId],
  );

  const invoiceBalanceBefore = selectedInvoice ? getBalanceRemaining(selectedInvoice) : 0;
  const paymentAmount = Number(paymentForm.amount) || 0;
  const invoiceBalanceAfter = Math.max(invoiceBalanceBefore - paymentAmount, 0);

  const openPanel = () => {
    setIsPanelOpen(true);
    setPanelCustomerId('');
    setInvoiceSearch('');
    setSelectedInvoiceId('');
    setPaymentForm({
      amount: '',
      payment_method: 'cash',
      payment_date: new Date().toISOString().slice(0, 10),
      reference: '',
      notes: '',
    });
  };

  const handleSelectInvoice = (invoiceId: string) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    setSelectedInvoiceId(invoiceId);
    setPaymentForm((prev) => ({
      ...prev,
      amount: invoice ? getBalanceRemaining(invoice).toFixed(2) : '',
    }));
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoiceId) return;

    await recordPayment(selectedInvoiceId, {
      amount: paymentForm.amount,
      payment_method: paymentForm.payment_method,
      payment_date: paymentForm.payment_date,
      reference: paymentForm.reference.trim() || undefined,
      notes: paymentForm.notes.trim() || undefined,
    });

    setIsPanelOpen(false);
    await fetchInvoices(undefined, true);
    await fetchData();
  };

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <div className="payments-page-title">
              <div className="payments-page-title__icon">
                <CreditCard size={22} />
              </div>
              <div>
                <h1>Payments</h1>
                <p className="procurement-page-header__breadcrumb">
                  Sales / Payments
                </p>
              </div>
            </div>
          </div>
          <div className="procurement-page-header__actions">
            <button className="btn btn-primary" type="button" onClick={openPanel}>
              <Plus size={16} />
              Record Payment
            </button>
          </div>
        </div>

        <div className="payments-filter-bar">
          <label className="payments-filter-field payments-search-field">
            <Search size={15} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search payments..."
            />
          </label>

          <label className="payments-filter-field">
            <CalendarDays size={15} />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="Date from"
            />
          </label>

          <label className="payments-filter-field">
            <CalendarDays size={15} />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="Date to"
            />
          </label>

          <label className="payments-filter-field">
            <CreditCard size={15} />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value || 'all'} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          <label className="payments-filter-field">
            <User size={15} />
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">All customers</option>
              {customers.map((customer: Customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="payments-filter-field">
            <WarehouseIcon size={15} />
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              <option value="">All warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="procurement-content">
        {(error || invoiceError || warehouseError) && (
          <div className="error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error || invoiceError || warehouseError}</span>
            <button
              type="button"
              onClick={() => {
                clearError();
                clearInvoiceError();
                setWarehouseError(null);
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading payments...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <CreditCard size={48} />
            </div>
            <h3 className="empty-state__title">No payments recorded</h3>
            <p className="empty-state__description">
              Payments are recorded against invoices.
            </p>
          </div>
        ) : (
          <div className="sales-table-container payments-table-container">
            <table className="sales-table payments-table">
              <thead>
                <tr>
                  <th>Payment Ref</th>
                  <th>Customer</th>
                  <th>Invoice #</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <span className="table-link">{getPaymentReference(payment)}</span>
                    </td>
                    <td>{payment.customer_name}</td>
                    <td>{payment.invoice_number}</td>
                    <td>{formatDateTime(payment.payment_date)}</td>
                    <td>
                      <span className={`badge badge-method-${payment.payment_method}`}>
                        {formatPaymentMethod(payment.payment_method)}
                      </span>
                    </td>
                    <td className="table-amount">{formatMoney(Number(payment.amount))}</td>
                    <td>{payment.received_by || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isPanelOpen && (
        <>
          <div className="panel-backdrop" onClick={() => setIsPanelOpen(false)} />
          <aside className="create-customer-panel payments-record-panel open">
            <div className="panel-header">
              <h2>Record Payment</h2>
              <button className="btn-icon" type="button" onClick={() => setIsPanelOpen(false)} aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <div className="panel-body">
              <div className="form-group">
                <label>Customer</label>
                <select
                  value={panelCustomerId}
                  onChange={(e) => {
                    setPanelCustomerId(e.target.value);
                    setSelectedInvoiceId('');
                    setPaymentForm((prev) => ({ ...prev, amount: '' }));
                  }}
                >
                  <option value="">All customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Find Open Invoice</label>
                <input
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Search invoice, customer, order..."
                />
              </div>

              <div className="form-group">
                <label>
                  Invoice <span className="required">*</span>
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleSelectInvoice(e.target.value)}
                >
                  <option value="">Select an open invoice</option>
                  {openInvoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - {invoice.customer_name} - {formatMoney(getBalanceRemaining(invoice))}
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div className="payments-balance-preview">
                  <div>
                    <span>Invoice Balance</span>
                    <strong>{formatMoney(invoiceBalanceBefore)}</strong>
                  </div>
                  <div>
                    <span>After Payment</span>
                    <strong className={invoiceBalanceAfter > 0 ? 'payments-balance-preview__due' : ''}>
                      {formatMoney(invoiceBalanceAfter)}
                    </strong>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Amount <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Payment Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                  />
                </div>
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
                  {RECORD_METHODS.map((method) => (
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
                  placeholder="Receipt, card auth, transfer reference..."
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="panel-footer">
              <button className="btn btn-outline" type="button" onClick={() => setIsPanelOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleRecordPayment}
                disabled={!selectedInvoiceId || Number(paymentForm.amount) <= 0 || isSubmitting}
              >
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

function getPaymentReference(payment: Payment): string {
  return payment.reference || `PAY-${payment.id.slice(0, 8)}`;
}

function getAmountPaid(invoice: Invoice): number {
  const explicit = invoice.amount_paid ?? invoice.paid_amount;
  if (explicit !== undefined && explicit !== null && explicit !== '') return Number(explicit) || 0;
  return invoice.status === 'paid' ? Number(invoice.total_amount) || 0 : 0;
}

function getBalanceRemaining(invoice: Invoice): number {
  const explicit = invoice.balance_remaining ?? invoice.outstanding_balance;
  if (explicit !== undefined && explicit !== null && explicit !== '') return Number(explicit) || 0;
  return Math.max((Number(invoice.total_amount) || 0) - getAmountPaid(invoice), 0);
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatPaymentMethod(method: PaymentMethod): string {
  return method.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default PaymentsPage;
