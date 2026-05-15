import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CircleDollarSign,
  Landmark,
  Receipt,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAccountsPayableStore } from '../../stores/accountsPayableStore';
import { useAccountsReceivableStore } from '../../stores/accountsReceivableStore';
import { useFiscalPeriodsStore } from '../../stores/fiscalPeriodsStore';
import { useJournalEntriesStore } from '../../stores/journalEntriesStore';
import { financeReportsService } from '../../services/financeReportsService';
import type { FiscalPeriod } from '../../types/fiscal_periods_models';
import type { TrialBalanceReport } from '../../types/finance_reports_models';
import type { JournalEntry } from '../../types/journal_entries_models';
import { formatEntryType, formatDate, getEntryTotals } from '../../components/journal_entries/journalEntryDisplay';
import {
  formatReportMoney,
  toNumber,
} from '../../components/finance_reports/financeReportHelpers';
import '../../styles/finance.css';

type AgingBucketKey = 'current' | 'days_1_30' | 'days_31_60' | 'days_61_90' | 'over_90';

interface AgingBucket {
  key: AgingBucketKey;
  label: string;
  value: number;
  color: string;
}

const AGING_BUCKETS: Array<{ key: AgingBucketKey; label: string; color: string }> = [
  { key: 'current', label: 'Current', color: '#5b7282' },
  { key: 'days_1_30', label: '1-30', color: '#7aa6b2' },
  { key: 'days_31_60', label: '31-60', color: '#f59e0b' },
  { key: 'days_61_90', label: '61-90', color: '#f97316' },
  { key: 'over_90', label: '90+', color: '#dc2626' },
];

const FinanceOverview: React.FC = () => {
  const { items: arItems, isLoading: isLoadingAR, fetchAll: fetchAR } = useAccountsReceivableStore();
  const { items: apItems, isLoading: isLoadingAP, fetchAll: fetchAP } = useAccountsPayableStore();
  const { items: journalEntries, isLoading: isLoadingJournalEntries, fetchAll: fetchJournalEntries } = useJournalEntriesStore();
  const { items: fiscalPeriods, isLoading: isLoadingFiscalPeriods, fetchAll: fetchFiscalPeriods } = useFiscalPeriodsStore();

  const [trialBalance, setTrialBalance] = useState<TrialBalanceReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [showOverdueBanner, setShowOverdueBanner] = useState(true);

  useEffect(() => {
    fetchAR(undefined, true);
    fetchAP(undefined, true);
    fetchJournalEntries(undefined, true);
    fetchFiscalPeriods(undefined, true);
  }, [fetchAP, fetchAR, fetchFiscalPeriods, fetchJournalEntries]);

  const openPeriod = useMemo(
    () => fiscalPeriods.find((period) => period.status === 'open') || null,
    [fiscalPeriods],
  );

  const loadTrialBalance = useCallback(async (period: FiscalPeriod | null) => {
    if (!period) {
      setTrialBalance(null);
      return;
    }

    setIsLoadingReport(true);
    setReportError(null);
    try {
      const report = await financeReportsService.getTrialBalance({
        date_from: period.period_start,
        date_to: period.period_end,
        fiscal_period_id: period.id,
      });
      setTrialBalance(report);
    } catch (error: any) {
      setReportError(error?.message || 'Could not load finance overview report data');
      setTrialBalance(null);
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  useEffect(() => {
    loadTrialBalance(openPeriod);
  }, [loadTrialBalance, openPeriod]);

  const revenueThisPeriod = useMemo(
    () => (trialBalance?.lines || [])
      .filter((line) => line.account_type === 'revenue')
      .reduce((total, line) => total + toNumber(line.total_credits), 0),
    [trialBalance],
  );

  const netCashPosition = useMemo(
    () => (trialBalance?.lines || [])
      .filter((line) => ['1001', '1100'].includes(line.account_code))
      .reduce((total, line) => total + toNumber(line.balance), 0),
    [trialBalance],
  );

  const openAR = useMemo(
    () => arItems.filter(isOpenBalanceRecord),
    [arItems],
  );
  const openAP = useMemo(
    () => apItems.filter(isOpenBalanceRecord),
    [apItems],
  );

  const outstandingAR = useMemo(
    () => openAR.reduce((total, item) => total + toNumber(item.amount_outstanding), 0),
    [openAR],
  );
  const outstandingAP = useMemo(
    () => openAP.reduce((total, item) => total + toNumber(item.amount_outstanding), 0),
    [openAP],
  );

  const arOverdue = useMemo(() => openAR.filter(isOverdue), [openAR]);
  const apOverdue = useMemo(() => openAP.filter(isOverdue), [openAP]);
  const arOverdueTotal = useMemo(
    () => arOverdue.reduce((total, item) => total + toNumber(item.amount_outstanding), 0),
    [arOverdue],
  );
  const apOverdueTotal = useMemo(
    () => apOverdue.reduce((total, item) => total + toNumber(item.amount_outstanding), 0),
    [apOverdue],
  );

  const arAging = useMemo(() => buildAgingBuckets(openAR), [openAR]);
  const apAging = useMemo(() => buildAgingBuckets(openAP), [openAP]);

  const recentEntries = useMemo(
    () => [...journalEntries]
      .sort((a, b) => dateValue(b.created_at || b.entry_date) - dateValue(a.created_at || a.entry_date))
      .slice(0, 10),
    [journalEntries],
  );

  const periodProgress = useMemo(
    () => getPeriodProgress(openPeriod),
    [openPeriod],
  );

  const showBanner = showOverdueBanner && (arOverdue.length > 0 || apOverdue.length > 0);

  return (
    <div className="finance-page">
      <div className="finance-sticky-stack">
        <div className="finance-page-header">
          <div className="finance-page-title">
            <div className="finance-page-title__icon">
              <Landmark size={22} />
            </div>
            <div>
              <h1>Finance Overview</h1>
              <p>Finance / Overview / Daily financial health</p>
            </div>
          </div>
        </div>
      </div>

      <div className="finance-content finance-overview-content">
        {reportError && (
          <div className="finance-error-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{reportError}</span>
            <button type="button" onClick={() => setReportError(null)}>
              Dismiss
            </button>
          </div>
        )}

        <section className="finance-overview-kpis">
          <KpiCard
            icon={<TrendingUp size={20} />}
            label="Total Revenue"
            helper="This Period"
            value={formatReportMoney(revenueThisPeriod)}
            isLoading={isLoadingReport}
          />
          <KpiCard
            icon={<Receipt size={20} />}
            label="Outstanding AR"
            helper={`${openAR.length} open records`}
            value={formatReportMoney(outstandingAR)}
            isLoading={isLoadingAR}
          />
          <KpiCard
            icon={<WalletCards size={20} />}
            label="Outstanding AP"
            helper={`${openAP.length} open records`}
            value={formatReportMoney(outstandingAP)}
            isLoading={isLoadingAP}
          />
          <KpiCard
            icon={<CircleDollarSign size={20} />}
            label="Net Cash Position"
            helper="Accounts 1001 + 1100"
            value={formatReportMoney(netCashPosition)}
            isLoading={isLoadingReport}
          />
        </section>

        {showBanner && (
          <div className="finance-overdue-banner">
            <AlertTriangle size={18} />
            <span>
              You have <strong>{arOverdue.length}</strong> overdue receivables ({formatReportMoney(arOverdueTotal)})
              {' '}and <strong>{apOverdue.length}</strong> overdue payables ({formatReportMoney(apOverdueTotal)}).
            </span>
            <Link to="/finance/accounts-receivable?overdue=true">View AR</Link>
            <Link to="/finance/accounts-payable?overdue=true">View AP</Link>
            <button type="button" onClick={() => setShowOverdueBanner(false)} aria-label="Dismiss overdue alert">
              <X size={16} />
            </button>
          </div>
        )}

        <section className="finance-overview-grid finance-overview-grid--two">
          <AgingPanel
            title="AR Aging Summary"
            description="Customer balances by overdue age bucket."
            buckets={arAging}
            linkTo="/finance/reports?report=ar_aging"
            isLoading={isLoadingAR}
          />
          <AgingPanel
            title="AP Aging Summary"
            description="Supplier balances by overdue age bucket."
            buckets={apAging}
            linkTo="/finance/reports?report=ap_aging"
            alarming={apAging.find((bucket) => bucket.key === 'over_90')?.value ? true : false}
            isLoading={isLoadingAP}
          />
        </section>

        <section className="finance-overview-grid finance-overview-grid--bottom">
          <RecentJournalEntries entries={recentEntries} isLoading={isLoadingJournalEntries} />
          <FiscalPeriodStatus
            period={openPeriod}
            progress={periodProgress}
            isLoading={isLoadingFiscalPeriods}
          />
        </section>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  helper: string;
  value: string;
  isLoading?: boolean;
}> = ({ icon, label, helper, value, isLoading = false }) => (
  <article className="finance-overview-kpi">
    <div className="finance-overview-kpi__icon">{icon}</div>
    <div>
      <span>{label}</span>
      {isLoading ? (
        <>
          <strong className="finance-overview-skeleton finance-overview-skeleton--value" aria-label="Loading" />
          <small className="finance-overview-skeleton finance-overview-skeleton--text" />
        </>
      ) : (
        <>
          <strong>{value}</strong>
          <small>{helper}</small>
        </>
      )}
    </div>
  </article>
);

const AgingPanel: React.FC<{
  title: string;
  description: string;
  buckets: AgingBucket[];
  linkTo: string;
  alarming?: boolean;
  isLoading?: boolean;
}> = ({ title, description, buckets, linkTo, alarming = false, isLoading = false }) => (
  <Link className={`finance-overview-panel finance-overview-aging ${alarming ? 'finance-overview-panel--danger' : ''}`} to={linkTo}>
    <div className="finance-section-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <ArrowRight size={18} />
    </div>
    {isLoading ? <FinanceChartSkeleton /> : <ResponsiveContainer width="100%" height={210}>
      <BarChart data={buckets} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatShortMoney} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={54} />
        <Tooltip content={<AgingTooltip />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {buckets.map((bucket) => (
            <Cell key={bucket.key} fill={bucket.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>}
  </Link>
);

const AgingTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="finance-chart-tooltip">
      <div className="finance-chart-tooltip__label">{label}</div>
      <div className="finance-chart-tooltip__row">
        <span className="finance-chart-tooltip__dot" style={{ background: payload[0].payload.color }} />
        <span>Outstanding</span>
        <strong>{formatReportMoney(payload[0].value)}</strong>
      </div>
    </div>
  );
};

const RecentJournalEntries: React.FC<{ entries: JournalEntry[]; isLoading: boolean }> = ({ entries, isLoading }) => (
  <section className="finance-overview-panel">
    <div className="finance-section-header">
      <div>
        <h2>Recent Journal Entries</h2>
        <p>Last 10 ledger postings.</p>
      </div>
      <BookOpenCheck size={18} />
    </div>

    {isLoading ? (
      <div className="finance-table-container finance-overview-table-wrap">
        <table className="finance-table finance-overview-journal-table">
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td colSpan={5}>
                  <span className="finance-overview-skeleton finance-overview-skeleton--row" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : entries.length === 0 ? (
      <div className="finance-empty-state finance-overview-empty">
        <h3>No journal entries yet</h3>
        <p>Recent ledger postings will appear here.</p>
      </div>
    ) : (
      <div className="finance-table-container finance-overview-table-wrap">
        <table className="finance-table finance-overview-journal-table">
          <thead>
            <tr>
              <th>Entry Number</th>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th className="finance-table__amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const totals = getEntryTotals(entry);
              return (
                <tr key={entry.id} className="finance-table__clickable-row">
                  <td>
                    <Link className="finance-mono-link" to={`/finance/journal-entries/${entry.id}`}>
                      {entry.entry_number || entry.id}
                    </Link>
                  </td>
                  <td>{formatDate(entry.entry_date)}</td>
                  <td>{entry.description || '-'}</td>
                  <td>
                    <span className={`finance-badge finance-badge--${entry.entry_type}`}>
                      {formatEntryType(entry.entry_type)}
                    </span>
                  </td>
                  <td className="finance-table__amount">{formatReportMoney(totals.debit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

const FiscalPeriodStatus: React.FC<{
  period: FiscalPeriod | null;
  progress: number;
  isLoading: boolean;
}> = ({ period, progress, isLoading }) => {
  if (isLoading) {
    return (
      <section className="finance-overview-panel finance-period-status">
        <span className="finance-overview-skeleton finance-overview-skeleton--line" />
        <span className="finance-overview-skeleton finance-overview-skeleton--value" />
        <span className="finance-overview-skeleton finance-overview-skeleton--text" />
        <span className="finance-overview-skeleton finance-overview-skeleton--bar" />
      </section>
    );
  }

  if (!period) {
    return (
      <section className="finance-overview-panel finance-period-status finance-period-status--blocked">
        <AlertTriangle size={22} />
        <h2>No open period</h2>
        <p>No open period - posting is blocked.</p>
      </section>
    );
  }

  return (
    <section className="finance-overview-panel finance-period-status">
      <div className="finance-section-header">
        <div>
          <h2>Open Fiscal Period</h2>
          <p>Posting is currently open.</p>
        </div>
        <CalendarClock size={18} />
      </div>
      <div className="finance-period-status__name">{period.name}</div>
      <div className="finance-period-status__dates">
        {formatDate(period.period_start)} to {formatDate(period.period_end)}
      </div>
      <div className="finance-period-progress" aria-label={`Fiscal period is ${Math.round(progress)} percent complete`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="finance-period-status__progress">{Math.round(progress)}% through period</div>
    </section>
  );
};

const FinanceChartSkeleton: React.FC = () => (
  <div className="finance-overview-chart-skeleton" aria-label="Loading chart">
    <span className="finance-overview-skeleton finance-overview-skeleton--chart-bar finance-overview-skeleton--chart-bar-1" />
    <span className="finance-overview-skeleton finance-overview-skeleton--chart-bar finance-overview-skeleton--chart-bar-2" />
    <span className="finance-overview-skeleton finance-overview-skeleton--chart-bar finance-overview-skeleton--chart-bar-3" />
    <span className="finance-overview-skeleton finance-overview-skeleton--chart-bar finance-overview-skeleton--chart-bar-4" />
    <span className="finance-overview-skeleton finance-overview-skeleton--chart-bar finance-overview-skeleton--chart-bar-5" />
  </div>
);

function buildAgingBuckets<T extends { due_date: string; amount_outstanding: number | string }>(items: T[]): AgingBucket[] {
  const totals: Record<AgingBucketKey, number> = {
    current: 0,
    days_1_30: 0,
    days_31_60: 0,
    days_61_90: 0,
    over_90: 0,
  };

  items.forEach((item) => {
    totals[getAgingBucket(item.due_date)] += toNumber(item.amount_outstanding);
  });

  return AGING_BUCKETS.map((bucket) => ({
    ...bucket,
    value: totals[bucket.key],
  }));
}

function getAgingBucket(dueDate: string): AgingBucketKey {
  const days = getDaysOverdue(dueDate);
  if (days <= 0) return 'current';
  if (days <= 30) return 'days_1_30';
  if (days <= 60) return 'days_31_60';
  if (days <= 90) return 'days_61_90';
  return 'over_90';
}

function isOpenBalanceRecord(record: { status: string }): boolean {
  return ['open', 'partially_paid', 'overdue'].includes(record.status);
}

function isOverdue(record: { due_date: string; amount_outstanding: number | string; status: string }): boolean {
  return record.status !== 'paid' && toNumber(record.amount_outstanding) > 0 && getDaysOverdue(record.due_date) > 0;
}

function getDaysOverdue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000));
}

function getPeriodProgress(period: FiscalPeriod | null): number {
  if (!period) return 0;
  const start = new Date(`${period.period_start}T00:00:00`).getTime();
  const end = new Date(`${period.period_end}T23:59:59`).getTime();
  const today = new Date().getTime();
  if (end <= start) return 100;
  return Math.max(0, Math.min(100, ((today - start) / (end - start)) * 100));
}

function dateValue(value?: string | null): number {
  if (!value) return 0;
  return new Date(value).getTime();
}

function formatShortMoney(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export default FinanceOverview;
