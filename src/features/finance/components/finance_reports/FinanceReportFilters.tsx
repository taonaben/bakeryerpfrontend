import React from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import type { FiscalPeriod } from '../../types/fiscal_periods_models';
import type { FinanceReportType } from './ReportSelectorCards';
import type { ReportFilters } from './financeReportHelpers';

interface FinanceReportFiltersProps {
  activeReport: FinanceReportType;
  filters: ReportFilters;
  fiscalPeriods: FiscalPeriod[];
  isLoading: boolean;
  onChange: (filters: Partial<ReportFilters>) => void;
  onFiscalPeriodChange: (periodId: string) => void;
  onGenerate: () => void;
}

const FinanceReportFilters: React.FC<FinanceReportFiltersProps> = ({
  activeReport,
  filters,
  fiscalPeriods,
  isLoading,
  onChange,
  onFiscalPeriodChange,
  onGenerate,
}) => {
  const isBalanceSheet = activeReport === 'balance_sheet';
  const isAging = activeReport === 'ar_aging' || activeReport === 'ap_aging';

  return (
    <div className="finance-filter-bar finance-report-filter-bar">
      <label className="finance-filter-field">
        <CalendarDays size={15} />
        <select
          value={filters.fiscalPeriodId}
          onChange={(event) => onFiscalPeriodChange(event.target.value)}
          aria-label="Fiscal period"
        >
          <option value="">No fiscal period</option>
          {fiscalPeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
      </label>

      {!isBalanceSheet && (
        <label className="finance-filter-field">
          <CalendarDays size={15} />
          <input
            type="date"
            value={filters.dateFrom}
            disabled={isAging}
            onChange={(event) => onChange({ dateFrom: event.target.value })}
            aria-label="Date from"
          />
        </label>
      )}

      <label className="finance-filter-field">
        <CalendarDays size={15} />
        <input
          type="date"
          value={filters.dateTo}
          disabled={isAging}
          onChange={(event) => onChange({ dateTo: event.target.value })}
          aria-label={isBalanceSheet ? 'As of date' : 'Date to'}
        />
      </label>

      {isAging && (
        <span className="finance-report-filter-note">
          Aging endpoints use current outstanding balances.
        </span>
      )}

      <button className="btn btn-primary" type="button" onClick={onGenerate} disabled={isLoading}>
        <RefreshCw size={15} className={isLoading ? 'finance-spin-icon' : ''} />
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
};

export default FinanceReportFilters;
