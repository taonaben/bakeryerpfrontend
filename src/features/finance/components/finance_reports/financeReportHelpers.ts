import type { FiscalPeriod } from '../../types/fiscal_periods_models';
import type {
  APAgingLine,
  ARAgingLine,
  TrialBalanceLine,
} from '../../types/finance_reports_models';

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  fiscalPeriodId: string;
}

export interface TrialBalanceGroup {
  accountType: string;
  lines: TrialBalanceLine[];
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

export type AgingLine = (ARAgingLine | APAgingLine) & {
  name: string;
};

export interface AgingTotals {
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  over_90: number;
  total_outstanding: number;
}

export function formatReportMoney(value: number | string | null | undefined): string {
  const amount = toNumber(value);
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatSignedMoney(value: number | string | null | undefined): string {
  const amount = toNumber(value);
  const formatted = formatReportMoney(Math.abs(amount));
  return amount < 0 ? `(${formatted})` : formatted;
}

export function toNumber(value: number | string | null | undefined): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function sortPeriods(periods: FiscalPeriod[]): FiscalPeriod[] {
  return [...periods].sort((a, b) => a.period_start.localeCompare(b.period_start));
}

export function getDefaultReportFilters(periods: FiscalPeriod[]): ReportFilters {
  const sorted = sortPeriods(periods);
  const selected = sorted.find((period) => period.status === 'open') || sorted[sorted.length - 1];

  if (!selected) {
    return {
      dateFrom: '',
      dateTo: '',
      fiscalPeriodId: '',
    };
  }

  return {
    dateFrom: selected.period_start,
    dateTo: selected.period_end,
    fiscalPeriodId: selected.id,
  };
}

export function getPeriodById(periods: FiscalPeriod[], id: string): FiscalPeriod | undefined {
  return periods.find((period) => period.id === id);
}

export function getRecentPeriods(periods: FiscalPeriod[], selectedId: string, limit = 6): FiscalPeriod[] {
  const sorted = sortPeriods(periods);
  const selectedIndex = selectedId
    ? sorted.findIndex((period) => period.id === selectedId)
    : sorted.length - 1;
  const endIndex = selectedIndex >= 0 ? selectedIndex : sorted.length - 1;

  return sorted.slice(Math.max(0, endIndex - limit + 1), endIndex + 1);
}

export function groupTrialBalanceLines(lines: TrialBalanceLine[]): TrialBalanceGroup[] {
  const groups = new Map<string, TrialBalanceLine[]>();

  [...lines]
    .sort((a, b) => a.account_code.localeCompare(b.account_code, undefined, { numeric: true }))
    .forEach((line) => {
      const key = line.account_type || 'Unclassified';
      groups.set(key, [...(groups.get(key) || []), line]);
    });

  return Array.from(groups.entries()).map(([accountType, groupLines]) => {
    const totalDebits = groupLines.reduce((total, line) => total + toNumber(line.total_debits), 0);
    const totalCredits = groupLines.reduce((total, line) => total + toNumber(line.total_credits), 0);

    return {
      accountType,
      lines: groupLines,
      totalDebits,
      totalCredits,
      balance: groupLines.reduce((total, line) => total + toNumber(line.balance), 0),
    };
  });
}

export function normalizeAgingLines(
  items: Array<ARAgingLine | APAgingLine>,
  type: 'ar' | 'ap',
): AgingLine[] {
  return items
    .map((item) => ({
      ...item,
      name: type === 'ar'
        ? (item as ARAgingLine).customer_name
        : (item as APAgingLine).supplier_name,
    }))
    .sort((a, b) => toNumber(b.total_outstanding) - toNumber(a.total_outstanding));
}

export function getAgingTotals(lines: AgingLine[]): AgingTotals {
  return lines.reduce(
    (totals, line) => ({
      current: totals.current + toNumber(line.current),
      days_1_30: totals.days_1_30 + toNumber(line.days_1_30),
      days_31_60: totals.days_31_60 + toNumber(line.days_31_60),
      days_61_90: totals.days_61_90 + toNumber(line.days_61_90),
      over_90: totals.over_90 + toNumber(line.over_90),
      total_outstanding: totals.total_outstanding + toNumber(line.total_outstanding),
    }),
    {
      current: 0,
      days_1_30: 0,
      days_31_60: 0,
      days_61_90: 0,
      over_90: 0,
      total_outstanding: 0,
    },
  );
}

export function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.01;
}
