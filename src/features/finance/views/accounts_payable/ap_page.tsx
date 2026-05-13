import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Landmark,
  Receipt,
  Search,
  User,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supplierService } from '../../../procurement/services/suppliers_services';
import type { Supplier } from '../../../procurement/types/models';
import { useAccountsPayableStore } from '../../stores/accountsPayableStore';
import type {
  AccountsPayable,
  APPayment,
  PaymentMethod,
} from '../../types/accounts_payable_models';
import '../../styles/finance.css';

type APFilter = 'all' | 'open' | 'partially_paid' | 'overdue' | 'paid';

const STATUS_FILTERS: Array<{ label: string; value: APFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Partially Paid', value: 'partially_paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
];

const PAYMENT_METHODS: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Mobile Money', value: 'mobile_money' },
];

const AccountsPayablePage: React.FC = () => {
  const {
    items,
    isLoading,
    isSubmitting,
    error,
    fetchAll,
    fetchById,
    pay,
    clearError,
  } = useAccountsPayableStore();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [statusFilter, setStatusFilter] = useState<APFilter>('all');
  const [supplierId, setSupplierId] = useState('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [detailById, setDetailById] = useState<Record<string, AccountsPayable>>({});
  const [detailLoadingIds, setDetailLoadingIds] = useState<Set<string>>(new Set());
  const [payingRecord, setPayingRecord] = useState<AccountsPayable | null>(null);

  const loadData = useCallback(async () => {
    await fetchAll(undefined, true);
  }, [fetchAll]);

  useEffect(() => {
    loadData();
    supplierService
      .fetchSuppliers({ page_size: 100 })
      .then((result) => setSuppliers(result.data))
      .catch(() => setSuppliers([]));
  }, [loadData]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => dateToMs(a.due_date) - dateToMs(b.due_date)),
    [items],
  );

  const summary = useMemo(() => getSummary(sortedItems), [sortedItems]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return sortedItems.filter((record) => {
      if (statusFilter !== 'all' && getEffectiveStatus(record) !== statusFilter) return false;
      if (supplierId && record.supplier !== supplierId) return false;
      if (overdueOnly && !isOverdue(record)) return false;
      if (dueFrom && dateToMs(record.due_date) < dateToMs(dueFrom)) return false;
      if (dueTo && dateToMs(record.due_date) > dateToMs(dueTo)) return false;
      if (!query) return true;

      return [
        record.invoice_number,
        record.supplier_name,
        record.entry_number,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [dueFrom, dueTo, overdueOnly, searchTerm, sortedItems, statusFilter, supplierId]);

  const setSummaryFilter = (filter: APFilter) => {
    setStatusFilter(filter);
    setOverdueOnly(filter === 'overdue');
  };

  const toggleRow = async (record: AccountsPayable) => {
    const isExpanded = expandedIds.has(record.id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(record.id)) next.delete(record.id);
      else next.add(record.id);
      return next;
    });

    if (isExpanded || detailById[record.id] || detailLoadingIds.has(record.id)) return;

    setDetailLoadingIds((prev) => new Set(prev).add(record.id));
    try {
      const detail = await fetchById(record.id);
      setDetailById((prev) => ({ ...prev, [record.id]: detail }));
    } finally {
      setDetailLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  };

  const handlePaymentSaved = async () => {
    if (!payingRecord) return;
    const detail = await fetchById(payingRecord.id);
    setDetailById((prev) => ({ ...prev, [payingRecord.id]: detail }));
    setPayingRecord(null);
  };

  return (
    <div className="finance-page">
      <div className="finance-sticky-stack">
        <div className="finance-page-header">
          <div className="finance-page-title">
            <div className="finance-page-title__icon">
              <Landmark size={22} />
            </div>
            <div>
              <h1>Accounts Payable</h1>
              <p>Finance / Payables / Supplier invoices</p>
            </div>
          </div>
        </div>

        <div className="ar-summary-strip" aria-label="Accounts payable summary filters">
          <button
            type="button"
            className={statusFilter === 'open' && !overdueOnly ? 'active' : ''}
            onClick={() => setSummaryFilter('open')}
          >
            <span>Total Open</span>
            <strong>{formatMoney(summary.open)}</strong>
          </button>
          <button
            type="button"
            className={statusFilter === 'overdue' || overdueOnly ? 'active ar-summary-strip__overdue' : 'ar-summary-strip__overdue'}
            onClick={() => setSummaryFilter('overdue')}
          >
            <span>Total Overdue</span>
            <strong>{formatMoney(summary.overdue)}</strong>
          </button>
          <button
            type="button"
            className={statusFilter === 'partially_paid' ? 'active' : ''}
            onClick={() => setSummaryFilter('partially_paid')}
          >
            <span>Total Partially Paid</span>
            <strong>{formatMoney(summary.partiallyPaid)}</strong>
          </button>
          <button
            type="button"
            className={statusFilter === 'paid' ? 'active' : ''}
            onClick={() => setSummaryFilter('paid')}
          >
            <span>Total Paid This Period</span>
            <strong>{formatMoney(summary.paidThisPeriod)}</strong>
          </button>
        </div>

        <div className="finance-filter-bar ar-filter-bar">
          <div className="finance-entry-type-tabs" role="tablist" aria-label="Payable status filters">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`finance-pill ${statusFilter === filter.value && !(filter.value !== 'overdue' && overdueOnly) ? 'finance-pill--active' : ''}`}
                type="button"
                onClick={() => {
                  setStatusFilter(filter.value);
                  if (filter.value === 'overdue') setOverdueOnly(true);
                  if (filter.value !== 'overdue') setOverdueOnly(false);
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <label className="finance-filter-field ar-search-field">
            <Search size={15} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search invoice, supplier, journal entry..."
            />
          </label>

          <label className="finance-filter-field">
            <User size={15} />
            <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
              <option value="">All suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>

          <label className="finance-filter-field">
            <CalendarDays size={15} />
            <input
              type="date"
              value={dueFrom}
              onChange={(event) => setDueFrom(event.target.value)}
              aria-label="Due date from"
            />
          </label>

          <label className="finance-filter-field">
            <CalendarDays size={15} />
            <input
              type="date"
              value={dueTo}
              onChange={(event) => setDueTo(event.target.value)}
              aria-label="Due date to"
            />
          </label>

          <label className="ar-toggle">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(event) => {
                setOverdueOnly(event.target.checked);
                if (event.target.checked) setStatusFilter('all');
              }}
            />
            Overdue only
          </label>
        </div>
      </div>

      <div className="finance-content">
        {error && (
          <div className="finance-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={clearError}>
              Dismiss
            </button>
          </div>
        )}

        {isLoading && items.length === 0 ? (
          <div className="finance-loading">
            <div className="finance-spinner" />
            <span>Loading accounts payable...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="finance-table-container">
            <div className="finance-empty-state">
              <div className="finance-empty-state__icon">
                <Receipt size={44} />
              </div>
              <h3>No payables found</h3>
              <p>Adjust the filters to review supplier invoice balances.</p>
            </div>
          </div>
        ) : (
          <div className="finance-table-container ar-table-wrap">
            <table className="finance-table ar-table">
              <thead>
                <tr>
                  <th aria-label="Expand row" />
                  <th>Invoice Number</th>
                  <th>Supplier</th>
                  <th className="finance-table__amount">Original Amount</th>
                  <th className="finance-table__amount">Amount Paid</th>
                  <th className="finance-table__amount">Outstanding</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Days Overdue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((record) => {
                  const detail = detailById[record.id] || record;
                  const expanded = expandedIds.has(record.id);
                  const daysOverdue = getDaysOverdue(record);
                  const overdue = daysOverdue > 0;
                  const payable = canPay(record);

                  return (
                    <React.Fragment key={record.id}>
                      <tr
                        className={`finance-table__clickable-row ${overdue ? 'ar-row--overdue' : ''}`}
                        onClick={() => toggleRow(record)}
                        aria-expanded={expanded}
                      >
                        <td className="finance-table__icon-cell">
                          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </td>
                        <td>
                          <Link
                            className="finance-mono-link"
                            to={`/procurement/invoices/${record.supplier_invoice}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {record.invoice_number}
                          </Link>
                        </td>
                        <td>{record.supplier_name}</td>
                        <td className="finance-table__amount">{formatMoney(toNumber(record.original_amount))}</td>
                        <td className="finance-table__amount">{formatMoney(toNumber(record.amount_paid))}</td>
                        <td className="finance-table__amount">{formatMoney(toNumber(record.amount_outstanding))}</td>
                        <td>{formatDate(record.due_date)}</td>
                        <td>
                          <span className={`finance-badge ${getStatusClass(record)}`}>
                            {formatStatus(getEffectiveStatus(record))}
                          </span>
                        </td>
                        <td>
                          {overdue ? (
                            <span className="ar-days-overdue">{daysOverdue}d overdue</span>
                          ) : (
                            <span className="finance-muted">-</span>
                          )}
                        </td>
                        <td>
                          {payable ? (
                            <button
                              className="btn btn-primary ar-table-action"
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setPayingRecord(detail);
                              }}
                            >
                              <CreditCard size={14} />
                              Pay
                            </button>
                          ) : (
                            <span className="finance-muted">-</span>
                          )}
                        </td>
                      </tr>

                      {expanded && (
                        <tr className="journal-entry-expanded-row">
                          <td colSpan={10}>
                            <APInlineDetail
                              record={detail}
                              isLoading={detailLoadingIds.has(record.id)}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payingRecord && (
        <PayAPModal
          record={detailById[payingRecord.id] || payingRecord}
          isSubmitting={isSubmitting}
          onClose={() => setPayingRecord(null)}
          onSubmit={async (dto) => {
            await pay(payingRecord.id, dto);
            await handlePaymentSaved();
          }}
        />
      )}
    </div>
  );
};

interface APInlineDetailProps {
  record: AccountsPayable;
  isLoading: boolean;
}

const APInlineDetail: React.FC<APInlineDetailProps> = ({ record, isLoading }) => {
  const payments = record.payments || [];
  const original = toNumber(record.original_amount);
  const paid = toNumber(record.amount_paid);
  const paidPercent = original > 0 ? Math.min(100, Math.max(0, (paid / original) * 100)) : 0;

  return (
    <div className="ap-inline-detail">
      {isLoading && <div className="finance-field-note">Loading payment history...</div>}

      <div className="journal-entry-preview__meta">
        <div>
          <span>AP Record</span>
          <strong>{record.id}</strong>
        </div>
        <div>
          <span>Supplier Invoice</span>
          <Link className="finance-text-link" to={`/procurement/invoices/${record.supplier_invoice}`}>
            {record.invoice_number}
          </Link>
        </div>
        <div>
          <span>Linked Journal Entry</span>
          {record.journal_entry ? (
            <Link className="finance-text-link" to={`/finance/journal-entries/${record.journal_entry}`}>
              {record.entry_number || record.journal_entry}
            </Link>
          ) : (
            <strong>-</strong>
          )}
        </div>
        <div>
          <span>Created</span>
          <strong>{formatDateTime(record.created_at)}</strong>
        </div>
        <div>
          <span>Last Updated</span>
          <strong>{formatDateTime(record.updated_at)}</strong>
        </div>
      </div>

      <div className="ap-payment-progress">
        <div>
          <span>Payment progress</span>
          <strong>{formatMoney(paid)} paid of {formatMoney(original)}</strong>
        </div>
        <div className="ap-payment-progress__track" aria-hidden="true">
          <span style={{ width: `${paidPercent}%` }} />
        </div>
      </div>

      <div className="ap-payments-timeline" aria-label="Payment timeline">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <span key={payment.id} title={`${formatDate(payment.payment_date)} ${formatMoney(toNumber(payment.amount))}`} />
          ))
        ) : (
          <span className="ap-payments-timeline__empty">No payments recorded yet.</span>
        )}
      </div>

      <div className="journal-entry-preview__lines">
        <table className="finance-table ap-payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th className="finance-table__amount">Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Paid By</th>
              <th>Journal Entry</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.payment_date)}</td>
                  <td className="finance-table__amount">{formatMoney(toNumber(payment.amount))}</td>
                  <td>{formatPaymentMethod(payment.payment_method)}</td>
                  <td>{payment.reference || '-'}</td>
                  <td>{payment.paid_by || '-'}</td>
                  <td>
                    {payment.journal_entry ? (
                      <Link className="finance-text-link" to={`/finance/journal-entries/${payment.journal_entry}`}>
                        {payment.entry_number || payment.journal_entry}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="finance-empty-table-cell">
                  No supplier payments were returned for this payable.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface PayAPModalProps {
  record: AccountsPayable;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (dto: {
    amount: number;
    payment_method: PaymentMethod;
    reference?: string;
    notes?: string;
  }) => Promise<void>;
}

const PayAPModal: React.FC<PayAPModalProps> = ({
  record,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const outstanding = toNumber(record.amount_outstanding);
  const [amount, setAmount] = useState(formatPlainAmount(outstanding));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const numericAmount = toNumber(amount);
  const newOutstanding = Math.max(0, outstanding - numericAmount);
  const isValid = numericAmount > 0 && numericAmount <= outstanding;

  return (
    <>
      <div className="finance-drawer-backdrop" onClick={onClose} />
      <div className="finance-modal ap-pay-modal" role="dialog" aria-modal="true" aria-labelledby="pay-ap-title">
        <div className="finance-drawer__header">
          <div>
            <h2 id="pay-ap-title">Record Supplier Payment</h2>
            <p>Capture the payment against this payable.</p>
          </div>
          <button className="finance-icon-button" type="button" onClick={onClose} aria-label="Close payment modal">
            <X size={18} />
          </button>
        </div>

        <form
          className="finance-drawer__body"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!isValid) return;
            await onSubmit({
              amount: numericAmount,
              payment_method: paymentMethod,
              reference: reference.trim() || undefined,
              notes: notes.trim() || undefined,
            });
          }}
        >
          <div className="ap-pay-modal__summary">
            <span>{record.supplier_name}</span>
            <strong>{record.invoice_number}</strong>
            <p>Outstanding balance</p>
            <b>{formatMoney(outstanding)}</b>
          </div>

          <label className="finance-form-field">
            <span>Amount <span className="required">*</span></span>
            <input
              className="finance-input--amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          <label className="finance-form-field">
            <span>Payment Method <span className="required">*</span></span>
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          <label className="finance-form-field">
            <span>Reference</span>
            <input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Cheque number, transfer reference..."
            />
          </label>

          <label className="finance-form-field">
            <span>Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Optional payment notes"
            />
          </label>

          <div className="ap-pay-modal__outstanding">
            <span>New Outstanding After Payment</span>
            <strong className={newOutstanding === 0 ? 'is-settled' : ''}>
              {formatMoney(newOutstanding)}
            </strong>
          </div>

          {!isValid && (
            <div className="finance-field-note">
              Payment amount must be greater than zero and cannot exceed the outstanding balance.
            </div>
          )}

          <div className="finance-drawer__footer">
            <button className="btn btn-outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

function getSummary(records: AccountsPayable[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return records.reduce(
    (summary, record) => {
      const outstanding = toNumber(record.amount_outstanding);
      const effectiveStatus = getEffectiveStatus(record);

      if (effectiveStatus === 'open') summary.open += outstanding;
      if (effectiveStatus === 'overdue') summary.overdue += outstanding;
      if (effectiveStatus === 'partially_paid') summary.partiallyPaid += outstanding;

      const periodPayments = (record.payments || []).reduce((total, payment) => {
        const paidAt = payment.payment_date ? new Date(`${payment.payment_date}T00:00:00`) : null;
        if (paidAt && paidAt.getMonth() === currentMonth && paidAt.getFullYear() === currentYear) {
          return total + toNumber(payment.amount);
        }
        return total;
      }, 0);

      if (periodPayments > 0) {
        summary.paidThisPeriod += periodPayments;
      } else {
        const updated = record.updated_at ? new Date(record.updated_at) : null;
        if (effectiveStatus === 'paid' && updated && updated.getMonth() === currentMonth && updated.getFullYear() === currentYear) {
          summary.paidThisPeriod += toNumber(record.amount_paid);
        }
      }

      return summary;
    },
    { open: 0, overdue: 0, partiallyPaid: 0, paidThisPeriod: 0 },
  );
}

function getEffectiveStatus(record: AccountsPayable): APFilter {
  if (record.status === 'paid') return 'paid';
  if (record.status === 'partially_paid') return isOverdue(record) ? 'overdue' : 'partially_paid';
  if (record.status === 'overdue') return 'overdue';
  if (isOverdue(record)) return 'overdue';
  return 'open';
}

function getStatusClass(record: AccountsPayable): string {
  const status = getEffectiveStatus(record);
  if (status === 'open') return 'finance-badge--open-ar';
  if (status === 'partially_paid') return 'finance-badge--partial-ar';
  if (status === 'overdue') return 'finance-badge--overdue-ar';
  if (status === 'paid') return 'finance-badge--paid-ar';
  return 'finance-badge--inactive';
}

function canPay(record: AccountsPayable): boolean {
  const status = getEffectiveStatus(record);
  return toNumber(record.amount_outstanding) > 0 && ['open', 'partially_paid', 'overdue'].includes(status);
}

function isOverdue(record: AccountsPayable): boolean {
  return getDaysOverdue(record) > 0;
}

function getDaysOverdue(record: AccountsPayable): number {
  if (record.status === 'paid' || toNumber(record.amount_outstanding) <= 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${record.due_date}T00:00:00`);
  const diff = Math.floor((today.getTime() - due.getTime()) / 86400000);
  return Math.max(0, diff);
}

function toNumber(value: number | string | null | undefined): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function dateToMs(value?: string | null): number {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatPlainAmount(value: number): string {
  return value.toFixed(2);
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(status: APFilter): string {
  if (status === 'partially_paid') return 'Partially Paid';
  return status.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPaymentMethod(method: PaymentMethod): string {
  return PAYMENT_METHODS.find((item) => item.value === method)?.label || method;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default AccountsPayablePage;
