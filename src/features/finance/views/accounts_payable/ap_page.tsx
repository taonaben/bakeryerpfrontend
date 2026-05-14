import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Landmark, Search, User } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AccountsPayableTable from '../../components/accounts_payable/AccountsPayableTable';
import PayAccountsPayableModal from '../../components/accounts_payable/PayAccountsPayableModal';
import { supplierService } from '../../../procurement/services/suppliers_services';
import type { Supplier } from '../../../procurement/types/models';
import { useAccountsPayableStore } from '../../stores/accountsPayableStore';
import type { AccountsPayable } from '../../types/accounts_payable_models';
import {
  dateToMs,
  FinanceBalanceFilter,
  formatMoney,
  getEffectiveStatus,
  isOverdue,
  toNumber,
} from '../../utils/receivablesPayablesDisplay';
import '../../styles/finance.css';

const STATUS_FILTERS: Array<{ label: string; value: FinanceBalanceFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Partially Paid', value: 'partially_paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
];

const AccountsPayablePage: React.FC = () => {
  const [searchParams] = useSearchParams();
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
  const [statusFilter, setStatusFilter] = useState<FinanceBalanceFilter>('all');
  const [supplierId, setSupplierId] = useState('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [detailById, setDetailById] = useState<Record<string, AccountsPayable>>({});
  const [detailLoadingIds, setDetailLoadingIds] = useState<Set<string>>(new Set());
  const [payingRecord, setPayingRecord] = useState<AccountsPayable | null>(null);
  const overdueQuery = searchParams.get('overdue');

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

  useEffect(() => {
    if (overdueQuery === 'true') {
      setOverdueOnly(true);
      setStatusFilter('all');
    }
  }, [overdueQuery]);

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

  const setSummaryFilter = (filter: FinanceBalanceFilter) => {
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
        ) : (
          <AccountsPayableTable
            records={filteredItems}
            detailById={detailById}
            detailLoadingIds={detailLoadingIds}
            expandedIds={expandedIds}
            onPay={setPayingRecord}
            onToggleRow={toggleRow}
          />
        )}
      </div>

      {payingRecord && (
        <PayAccountsPayableModal
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

export default AccountsPayablePage;
