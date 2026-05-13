import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Receipt,
  Search,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomersStore } from '../../../sales/stores/customersStore';
import { useAccountsReceivableStore } from '../../stores/accountsReceivableStore';
import type { AccountsReceivable, ARStatus } from '../../types/accounts_receivable_models';
import '../../styles/finance.css';

type ARFilter = 'all' | 'open' | 'partially_paid' | 'overdue' | 'paid';

const STATUS_FILTERS: Array<{ label: string; value: ARFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Partially Paid', value: 'partially_paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
];

const AccountsReceivablePage: React.FC = () => {
  const {
    items,
    isLoading,
    error,
    fetchAll,
    clearError,
  } = useAccountsReceivableStore();

  const {
    items: customers,
    fetchAll: fetchCustomers,
  } = useCustomersStore();

  const [statusFilter, setStatusFilter] = useState<ARFilter>('all');
  const [customerId, setCustomerId] = useState('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    await fetchAll(undefined, true);
  }, [fetchAll]);

  useEffect(() => {
    loadData();
    fetchCustomers(undefined, true);
  }, [fetchCustomers, loadData]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => dateToMs(a.due_date) - dateToMs(b.due_date)),
    [items],
  );

  const summary = useMemo(() => getSummary(sortedItems), [sortedItems]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return sortedItems.filter((record) => {
      if (statusFilter !== 'all' && getEffectiveStatus(record) !== statusFilter) return false;
      if (customerId && record.customer !== customerId) return false;
      if (overdueOnly && !isOverdue(record)) return false;
      if (dueFrom && dateToMs(record.due_date) < dateToMs(dueFrom)) return false;
      if (dueTo && dateToMs(record.due_date) > dateToMs(dueTo)) return false;
      if (!query) return true;

      return [
        record.invoice_number,
        record.customer_name,
        record.entry_number,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [customerId, dueFrom, dueTo, overdueOnly, searchTerm, sortedItems, statusFilter]);

  const setSummaryFilter = (filter: ARFilter) => {
    setStatusFilter(filter);
    setOverdueOnly(filter === 'overdue');
  };

  const toggleRow = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="finance-page">
      <div className="finance-sticky-stack">
        <div className="finance-page-header">
          <div className="finance-page-title">
            <div className="finance-page-title__icon">
              <Receipt size={22} />
            </div>
            <div>
              <h1>Accounts Receivable</h1>
              <p>Finance / Receivables / Customer invoices</p>
            </div>
          </div>
        </div>

        <div className="ar-summary-strip" aria-label="Accounts receivable summary filters">
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
          <div className="finance-entry-type-tabs" role="tablist" aria-label="Receivable status filters">
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
              placeholder="Search invoice, customer, journal entry..."
            />
          </label>

          <label className="finance-filter-field">
            <User size={15} />
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
              <option value="">All customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
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

        {isLoading ? (
          <div className="finance-loading">
            <div className="finance-spinner" />
            <span>Loading accounts receivable...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="finance-table-container">
            <div className="finance-empty-state">
              <div className="finance-empty-state__icon">
                <Receipt size={44} />
              </div>
              <h3>No receivables found</h3>
              <p>Adjust the filters to review customer invoice balances.</p>
            </div>
          </div>
        ) : (
          <div className="finance-table-container ar-table-wrap">
            <table className="finance-table ar-table">
              <thead>
                <tr>
                  <th aria-label="Expand row" />
                  <th>Invoice Number</th>
                  <th>Customer</th>
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
                  const expanded = expandedIds.has(record.id);
                  const daysOverdue = getDaysOverdue(record);
                  const overdue = daysOverdue > 0;

                  return (
                    <React.Fragment key={record.id}>
                      <tr
                        className={`finance-table__clickable-row ${overdue ? 'ar-row--overdue' : ''}`}
                        onClick={() => toggleRow(record.id)}
                        aria-expanded={expanded}
                      >
                        <td className="finance-table__icon-cell">
                          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </td>
                        <td>
                          <span className="finance-mono-link">{record.invoice_number}</span>
                        </td>
                        <td>{record.customer_name}</td>
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
                          <Link
                            className="btn btn-outline ar-table-action"
                            to={`/sales/invoices/${record.invoice}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                            Invoice
                          </Link>
                        </td>
                      </tr>

                      {expanded && (
                        <tr className="journal-entry-expanded-row">
                          <td colSpan={10}>
                            <ARInlinePreview record={record} />
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
    </div>
  );
};

const ARInlinePreview: React.FC<{ record: AccountsReceivable }> = ({ record }) => (
  <div className="ar-inline-preview">
    <div className="journal-entry-preview__meta">
      <div>
        <span>AR Record</span>
        <strong>{record.id}</strong>
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

    <div className="ar-inline-preview__note">
      AR is read-only here. Payments are recorded in the Sales module and reflected automatically.
    </div>
  </div>
);

function getSummary(records: AccountsReceivable[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return records.reduce(
    (summary, record) => {
      const outstanding = toNumber(record.amount_outstanding);
      const paid = toNumber(record.amount_paid);
      const effectiveStatus = getEffectiveStatus(record);

      if (effectiveStatus === 'open') summary.open += outstanding;
      if (effectiveStatus === 'overdue') summary.overdue += outstanding;
      if (effectiveStatus === 'partially_paid') summary.partiallyPaid += outstanding;

      const updated = record.updated_at ? new Date(record.updated_at) : null;
      if (effectiveStatus === 'paid' && updated && updated.getMonth() === currentMonth && updated.getFullYear() === currentYear) {
        summary.paidThisPeriod += paid;
      }

      return summary;
    },
    { open: 0, overdue: 0, partiallyPaid: 0, paidThisPeriod: 0 },
  );
}

function getEffectiveStatus(record: AccountsReceivable): ARFilter {
  if (record.status === 'paid') return 'paid';
  if (record.status === 'partially_paid') return isOverdue(record) ? 'overdue' : 'partially_paid';
  if (record.status === 'overdue') return 'overdue';
  if (isOverdue(record)) return 'overdue';
  return 'open';
}

function getStatusClass(record: AccountsReceivable): string {
  const status = getEffectiveStatus(record);
  if (status === 'open') return 'finance-badge--open-ar';
  if (status === 'partially_paid') return 'finance-badge--partial-ar';
  if (status === 'overdue') return 'finance-badge--overdue-ar';
  if (status === 'paid') return 'finance-badge--paid-ar';
  return 'finance-badge--inactive';
}

function isOverdue(record: AccountsReceivable): boolean {
  return getDaysOverdue(record) > 0;
}

function getDaysOverdue(record: AccountsReceivable): number {
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

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(status: ARFilter): string {
  if (status === 'partially_paid') return 'Partially Paid';
  return status.replace(/\b\w/g, (char) => char.toUpperCase());
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

export default AccountsReceivablePage;
