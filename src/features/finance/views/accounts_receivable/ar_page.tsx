import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Receipt, Search, User } from 'lucide-react';
import AccountsReceivableTable from '../../components/accounts_receivable/AccountsReceivableTable';
import { useAccountsReceivableStore } from '../../stores/accountsReceivableStore';
import type { AccountsReceivable } from '../../types/accounts_receivable_models';
import {
  dateToMs,
  FinanceBalanceFilter,
  formatMoney,
  getEffectiveStatus,
  isOverdue,
  toNumber,
} from '../../utils/receivablesPayablesDisplay';
import { useCustomersStore } from '../../../sales/stores/customersStore';
import '../../styles/finance.css';

const STATUS_FILTERS: Array<{ label: string; value: FinanceBalanceFilter }> = [
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

  const [statusFilter, setStatusFilter] = useState<FinanceBalanceFilter>('all');
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

  const setSummaryFilter = (filter: FinanceBalanceFilter) => {
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
        ) : (
          <AccountsReceivableTable
            records={filteredItems}
            expandedIds={expandedIds}
            onToggleRow={toggleRow}
          />
        )}
      </div>
    </div>
  );
};

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

export default AccountsReceivablePage;
