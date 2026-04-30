
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Search, FileText, CreditCard, X, ChevronDown, ChevronUp } from 'lucide-react';
import { reportsApi } from '../../api/reports_client';
import { invoicesApi } from '../../api/invoices_client';
import type { OutstandingDebtor, CustomerStatement } from '../../types/reports_models';
import type { Invoice } from '../../types/invoices_models';
import type { RecordPaymentDTO } from '../../types/payments_models';
import type { PaymentMethod } from '../../types/shared';
import '../../../procurement/styles/procurement.css';
import '../../styles/sales.css';

// ── helpers ───────────────────────────────────
const fmt = (v: string | number | null | undefined) => {
  if (v === null || v === undefined) return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
};

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ── Days overdue badge ────────────────────────
const OverdueBadge: React.FC<{ days: number | null }> = ({ days }) => {
  if (days === null || days === undefined) return <span style={{ color: '#94a3b8' }}>—</span>;
  if (days <= 0) return <span className="badge badge-active">Current</span>;
  if (days <= 30) return (
    <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
      {days}d overdue
    </span>
  );
  return (
    <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
      {days}d overdue
    </span>
  );
};

// ══════════════════════════════════════════════
// Record Payment Panel
// ══════════════════════════════════════════════
interface RecordPaymentPanelProps {
  open: boolean;
  debtor: (OutstandingDebtor & { total_invoiced?: string; last_payment_date?: string }) | null;
  overdueInvoices: Invoice[];
  onClose: () => void;
  onSaved: () => void;
}

const RecordPaymentPanel: React.FC<RecordPaymentPanelProps> = ({
  open, debtor, overdueInvoices, onClose, onSaved,
}) => {
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Filter invoices for this debtor
  const debtorInvoices = overdueInvoices.filter(
    (inv) => debtor && (inv.customer_name === debtor.customer_name),
  );

  useEffect(() => {
    if (open) {
      setInvoiceId(debtorInvoices[0]?.id ?? '');
      setAmount('');
      setMethod('cash');
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setReference('');
      setNotes('');
      setError(null);
      setFieldErrors({});
    }
  }, [open, debtor]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!invoiceId) e.invoiceId = 'Select an invoice';
    if (!amount || parseFloat(amount) <= 0) e.amount = 'Enter a valid amount';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const dto: RecordPaymentDTO = {
        amount,
        payment_method: method,
        payment_date: paymentDate,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      await invoicesApi.recordPayment(invoiceId, dto);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {open && <div className="panel-backdrop" onClick={onClose} />}
      <div className={`create-customer-panel${open ? ' open' : ''}`}>
        <div className="panel-header">
          <div>
            <h2>Record Payment</h2>
            {debtor && (
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                {debtor.customer_name}
                {debtor.company_name ? ` · ${debtor.company_name}` : ''}
              </p>
            )}
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="panel-body">
          {error && (
            <div className="error-banner" style={{ marginBottom: 16 }}>
              {error}
              <button onClick={() => setError(null)} type="button">×</button>
            </div>
          )}

          {/* Outstanding summary */}
          {debtor && (
            <div className="dm-payment-summary">
              <div className="dm-payment-summary__row">
                <span>Outstanding Balance</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>
                  {fmt(debtor.outstanding_balance)}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} id="record-payment-form">
            <div className="form-group">
              <label>Invoice <span className="required">*</span></label>
              {debtorInvoices.length > 0 ? (
                <select value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
                  <option value="">Select invoice</option>
                  {debtorInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} — {fmt(inv.balance_remaining ?? inv.outstanding_balance ?? inv.total_amount)} due
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  placeholder="Invoice ID"
                />
              )}
              {fieldErrors.invoiceId && <p className="field-error">{fieldErrors.invoiceId}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Amount <span className="required">*</span></label>
                <input
                  type="number" min="0.01" step="0.01"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
                {fieldErrors.amount && <p className="field-error">{fieldErrors.amount}</p>}
              </div>
              <div className="form-group">
                <label>Payment Date</label>
                <input
                  type="date" value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="form-group">
              <label>Reference</label>
              <input
                type="text" value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Receipt / transaction ref"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes…" rows={2}
              />
            </div>
          </form>
        </div>

        <div className="panel-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" form="record-payment-form" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Record Payment'}
          </button>
        </div>
      </div>
    </>
  );
};

// ══════════════════════════════════════════════
// Statement Modal
// ══════════════════════════════════════════════
interface StatementModalProps {
  open: boolean;
  statement: CustomerStatement | null;
  loading: boolean;
  onClose: () => void;
}

const StatementModal: React.FC<StatementModalProps> = ({ open, statement, loading, onClose }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 640, width: '95vw', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>
            {statement ? `Statement — ${statement.customer_name}` : 'Customer Statement'}
          </h3>
          <button className="btn-icon" onClick={onClose} type="button"><X size={18} /></button>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : !statement ? (
          <p style={{ color: '#64748b' }}>No statement data available.</p>
        ) : (
          <>
            {/* Summary row */}
            <div className="dm-stmt-summary">
              {[
                { label: 'Total Invoiced', value: fmt(statement.total_invoiced) },
                { label: 'Total Paid', value: fmt(statement.total_paid), color: '#10b981' },
                { label: 'Outstanding', value: fmt(statement.outstanding_balance), color: '#ef4444' },
              ].map(({ label, value, color }) => (
                <div key={label} className="dm-stmt-kpi">
                  <span className="dm-stmt-kpi__label">{label}</span>
                  <span className="dm-stmt-kpi__value" style={color ? { color } : {}}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Invoices */}
            {Array.isArray(statement.invoices) && statement.invoices.length > 0 && (
              <>
                <h4 style={{ margin: '20px 0 8px', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Invoices
                </h4>
                <div className="sales-table-container">
                  <table className="sales-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Due Date</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.invoices.map((inv: any) => (
                        <tr key={inv.id ?? inv.invoice_number}>
                          <td>{inv.invoice_number}</td>
                          <td>{fmtDate(inv.due_date)}</td>
                          <td className="table-amount">{fmt(inv.total_amount)}</td>
                          <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Payments */}
            {Array.isArray(statement.payments) && statement.payments.length > 0 && (
              <>
                <h4 style={{ margin: '20px 0 8px', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Payments
                </h4>
                <div className="sales-table-container">
                  <table className="sales-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.payments.map((p: any) => (
                        <tr key={p.id}>
                          <td>{fmtDate(p.payment_date)}</td>
                          <td><span className={`badge badge-method-${p.payment_method}`}>{p.payment_method}</span></td>
                          <td>{p.reference || '—'}</td>
                          <td className="table-amount" style={{ color: '#10b981' }}>{fmt(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════
type FilterView = 'all' | 'overdue' | 'due_soon';
type SortField = 'days_overdue' | 'outstanding_balance' | 'customer_name';

const DebtorManagementPage: React.FC = () => {
  const navigate = useNavigate();

  // Data
  const [debtors, setDebtors] = useState<OutstandingDebtor[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterView, setFilterView] = useState<FilterView>('all');
  const [search, setSearch] = useState('');
  const [minBalance, setMinBalance] = useState('');
  const [sortField, setSortField] = useState<SortField>('days_overdue');
  const [sortAsc, setSortAsc] = useState(false);

  // Panels
  const [paymentDebtor, setPaymentDebtor] = useState<OutstandingDebtor | null>(null);
  const [paymentPanelOpen, setPaymentPanelOpen] = useState(false);

  const [statement, setStatement] = useState<CustomerStatement | null>(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [debtorList, invoiceList] = await Promise.all([
        reportsApi.getOutstandingDebtors(),
        invoicesApi.getAll({ status: 'overdue' }),
      ]);
      setDebtors(Array.isArray(debtorList) ? debtorList : (debtorList as any)?.results ?? []);
      setOverdueInvoices(Array.isArray(invoiceList) ? invoiceList : []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load debtor data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Snapshot KPIs ─────────────────────────────
  const totalOutstanding = debtors.reduce(
    (s, d) => s + (parseFloat(d.outstanding_balance) || 0), 0,
  );
  const overdueCount = debtors.filter((d) => (d.days_overdue ?? 0) > 0).length;
  const overdue30 = debtors.filter((d) => (d.days_overdue ?? 0) > 30).length;
  const dueSoon = debtors.filter(
    (d) => d.oldest_due_date &&
      new Date(d.oldest_due_date) > new Date() &&
      new Date(d.oldest_due_date) <= new Date(Date.now() + 7 * 86400000),
  ).length;

  // ── Filtered + sorted list ────────────────────
  const filtered = useMemo(() => {
    let list = [...debtors];

    if (filterView === 'overdue') list = list.filter((d) => (d.days_overdue ?? 0) > 0);
    if (filterView === 'due_soon') list = list.filter((d) => {
      if (!d.oldest_due_date) return false;
      const due = new Date(d.oldest_due_date);
      return due > new Date() && due <= new Date(Date.now() + 7 * 86400000);
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.customer_name.toLowerCase().includes(q) ||
          (d.company_name && d.company_name.toLowerCase().includes(q)),
      );
    }

    if (minBalance && parseFloat(minBalance) > 0) {
      list = list.filter((d) => parseFloat(d.outstanding_balance) >= parseFloat(minBalance));
    }

    list.sort((a, b) => {
      let av: number, bv: number;
      if (sortField === 'days_overdue') {
        av = a.days_overdue ?? -1; bv = b.days_overdue ?? -1;
      } else if (sortField === 'outstanding_balance') {
        av = parseFloat(a.outstanding_balance) || 0;
        bv = parseFloat(b.outstanding_balance) || 0;
      } else {
        return sortAsc
          ? a.customer_name.localeCompare(b.customer_name)
          : b.customer_name.localeCompare(a.customer_name);
      }
      return sortAsc ? av - bv : bv - av;
    });

    return list;
  }, [debtors, filterView, search, minBalance, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc((p) => !p);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const handleViewStatement = async (debtor: OutstandingDebtor) => {
    setStatementOpen(true);
    setStatement(null);
    setStatementLoading(true);
    try {
      const stmt = await reportsApi.getCustomerStatement(debtor.customer_id);
      setStatement(stmt);
    } catch { setStatement(null); }
    finally { setStatementLoading(false); }
  };

  const handleRecordPayment = (debtor: OutstandingDebtor) => {
    setPaymentDebtor(debtor);
    setPaymentPanelOpen(true);
  };

  const FILTER_TABS: { label: string; value: FilterView }[] = [
    { label: 'All', value: 'all' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Due This Week', value: 'due_soon' },
  ];

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        {/* Header */}
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <h1>Debtor Management</h1>
            <p className="procurement-page-header__breadcrumb">Sales / Debtors</p>
          </div>
          <div className="procurement-page-header__actions">
            <button
              className="btn btn-outline"
              onClick={load}
              disabled={loading}
              type="button"
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="procurement-toolbar">
          <div className="procurement-toolbar__tabs">
            {FILTER_TABS.map((t) => (
              <button
                key={t.value}
                className={`status-tab${filterView === t.value ? ' active' : ''}`}
                onClick={() => setFilterView(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="procurement-content">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={load} type="button">Retry</button>
          </div>
        )}

        {/* ── Snapshot cards ── */}
        <div className="dm-kpi-strip">
          <div className="dm-kpi dm-kpi--danger">
            <span className="dm-kpi__label">Total Outstanding</span>
            <span className="dm-kpi__value">{fmt(totalOutstanding)}</span>
          </div>
          <div className="dm-kpi dm-kpi--warning">
            <span className="dm-kpi__label">Customers Overdue</span>
            <span className="dm-kpi__value">{overdueCount}</span>
          </div>
          <div className="dm-kpi dm-kpi--red">
            <span className="dm-kpi__label">Overdue 30+ Days</span>
            <span className="dm-kpi__value">{overdue30}</span>
          </div>
          <div className="dm-kpi dm-kpi--amber">
            <span className="dm-kpi__label">Due This Week</span>
            <span className="dm-kpi__value">{dueSoon}</span>
          </div>
        </div>

        {/* ── Search + filters ── */}
        <div className="dm-filter-row">
          <div className="pa-search" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer or company…"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              Min balance
            </label>
            <input
              type="number" min="0" step="any"
              value={minBalance}
              onChange={(e) => setMinBalance(e.target.value)}
              placeholder="0.00"
              className="pa-filter-select"
              style={{ width: 100 }}
            />
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="loading-container"><div className="spinner" /><span>Loading debtors…</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state-card" style={{ marginTop: 24 }}>
            <AlertTriangle size={36} style={{ marginBottom: 12, color: '#94a3b8' }} />
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>No outstanding debtors</p>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              {search || minBalance || filterView !== 'all'
                ? 'Try adjusting your filters'
                : 'All customer balances are settled'}
            </p>
          </div>
        ) : (
          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => toggleSort('customer_name')}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Customer <SortIcon field="customer_name" />
                    </span>
                  </th>
                  <th style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => toggleSort('outstanding_balance')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      Outstanding <SortIcon field="outstanding_balance" />
                    </span>
                  </th>
                  <th>Oldest Due Date</th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => toggleSort('days_overdue')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Days Overdue <SortIcon field="days_overdue" />
                    </span>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.customer_id}>
                    <td>
                      <div
                        className="table-link"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/sales/customers/${d.customer_id}`)}
                      >
                        {d.customer_name}
                      </div>
                      {d.company_name && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{d.company_name}</div>
                      )}
                    </td>
                    <td className="table-amount" style={{ fontWeight: 700, color: '#ef4444' }}>
                      {fmt(d.outstanding_balance)}
                    </td>
                    <td>{fmtDate(d.oldest_due_date)}</td>
                    <td><OverdueBadge days={d.days_overdue} /></td>
                    <td>
                      <div className="dm-row-actions">
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                          onClick={() => handleViewStatement(d)}
                          type="button"
                          title="View statement"
                        >
                          <FileText size={13} /> Statement
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                          onClick={() => handleRecordPayment(d)}
                          type="button"
                          title="Record payment"
                        >
                          <CreditCard size={13} /> Pay
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Record Payment Panel ── */}
      <RecordPaymentPanel
        open={paymentPanelOpen}
        debtor={paymentDebtor}
        overdueInvoices={overdueInvoices}
        onClose={() => setPaymentPanelOpen(false)}
        onSaved={load}
      />

      {/* ── Statement Modal ── */}
      <StatementModal
        open={statementOpen}
        statement={statement}
        loading={statementLoading}
        onClose={() => setStatementOpen(false)}
      />
    </div>
  );
};

export default DebtorManagementPage;
