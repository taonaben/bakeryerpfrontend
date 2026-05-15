import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, FileBarChart2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AgingReportView from '../../components/finance_reports/AgingReportView';
import BalanceSheetReportView from '../../components/finance_reports/BalanceSheetReportView';
import FinanceReportFilters from '../../components/finance_reports/FinanceReportFilters';
import IncomeStatementReportView, {
  IncomeTrendPoint,
} from '../../components/finance_reports/IncomeStatementReportView';
import ReportSelectorCards, {
  FinanceReportType,
} from '../../components/finance_reports/ReportSelectorCards';
import TrialBalanceReportView from '../../components/finance_reports/TrialBalanceReportView';
import {
  getDefaultReportFilters,
  getPeriodById,
  getRecentPeriods,
  ReportFilters,
  toNumber,
} from '../../components/finance_reports/financeReportHelpers';
import { financeReportsService } from '../../services/financeReportsService';
import { useFinanceReportsStore } from '../../stores/financeReportsStore';
import { useFiscalPeriodsStore } from '../../stores/fiscalPeriodsStore';
import '../../styles/finance.css';

const FinanceReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    trialBalance,
    incomeStatement,
    balanceSheet,
    arAging,
    apAging,
    isLoading,
    error,
    fetchTrialBalance,
    fetchIncomeStatement,
    fetchBalanceSheet,
    fetchARAging,
    fetchAPAging,
    clearError,
  } = useFinanceReportsStore();

  const {
    items: fiscalPeriods,
    fetchAll: fetchFiscalPeriods,
  } = useFiscalPeriodsStore();

  const [activeReport, setActiveReport] = useState<FinanceReportType | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: '',
    dateTo: '',
    fiscalPeriodId: '',
  });
  const [incomeTrend, setIncomeTrend] = useState<IncomeTrendPoint[]>([]);
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const reportViewerRef = useRef<HTMLDivElement | null>(null);
  const didAutoGenerateRef = useRef(false);
  const requestedReport = searchParams.get('report');

  useEffect(() => {
    fetchFiscalPeriods(undefined, true);
  }, [fetchFiscalPeriods]);

  useEffect(() => {
    if (fiscalPeriods.length === 0) return;
    setFilters((current) => {
      if (current.dateFrom || current.dateTo || current.fiscalPeriodId) return current;
      return getDefaultReportFilters(fiscalPeriods);
    });
  }, [fiscalPeriods]);

  const sortedPeriods = useMemo(
    () => [...fiscalPeriods].sort((a, b) => a.period_start.localeCompare(b.period_start)),
    [fiscalPeriods],
  );

  const updateFilters = (next: Partial<ReportFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const handleFiscalPeriodChange = (periodId: string) => {
    const period = getPeriodById(fiscalPeriods, periodId);
    setFilters((current) => ({
      ...current,
      fiscalPeriodId: periodId,
      dateFrom: period?.period_start || current.dateFrom,
      dateTo: period?.period_end || current.dateTo,
    }));
  };

  const buildTrendData = useCallback(async (currentFilters: ReportFilters) => {
    const recentPeriods = getRecentPeriods(fiscalPeriods, currentFilters.fiscalPeriodId, 6);
    if (recentPeriods.length < 2) {
      setIncomeTrend([]);
      return;
    }

    setIsTrendLoading(true);
    try {
      const reports = await Promise.all(
        recentPeriods.map(async (period) => {
          const report = await financeReportsService.getIncomeStatement({
            date_from: period.period_start,
            date_to: period.period_end,
          });

          return {
            period: period.name,
            revenue: toNumber(report.total_revenue),
            expenses: toNumber(report.total_cost_of_sales) + toNumber(report.total_operating_expenses),
          };
        }),
      );
      setIncomeTrend(reports);
    } catch {
      setIncomeTrend([]);
    } finally {
      setIsTrendLoading(false);
    }
  }, [fiscalPeriods]);

  const scrollToReportViewer = useCallback(() => {
    window.setTimeout(() => {
      reportViewerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  }, []);

  const generateReport = useCallback(async (reportType: FinanceReportType = activeReport || 'trial_balance') => {
    setActiveReport(reportType);
    scrollToReportViewer();

    if (reportType !== 'income_statement') {
      setIncomeTrend([]);
    }

    if (reportType === 'trial_balance') {
      await fetchTrialBalance({
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
        fiscal_period_id: filters.fiscalPeriodId || undefined,
      });
      return;
    }

    if (reportType === 'income_statement') {
      await fetchIncomeStatement({
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
      });
      await buildTrendData(filters);
      return;
    }

    if (reportType === 'balance_sheet') {
      await fetchBalanceSheet({
        as_of_date: filters.dateTo || undefined,
      });
      return;
    }

    if (reportType === 'ar_aging') {
      await fetchARAging();
      return;
    }

    await fetchAPAging();
  }, [
    activeReport,
    buildTrendData,
    fetchAPAging,
    fetchARAging,
    fetchBalanceSheet,
    fetchIncomeStatement,
    fetchTrialBalance,
    filters,
    scrollToReportViewer,
  ]);

  useEffect(() => {
    if (didAutoGenerateRef.current || !isFinanceReportType(requestedReport)) return;
    didAutoGenerateRef.current = true;
    generateReport(requestedReport);
  }, [generateReport, requestedReport]);

  const renderReport = () => {
    if (!activeReport) return null;

    if (isLoading) {
      return (
        <div className="finance-table-container">
          <div className="finance-loading finance-report-loading">
            <div className="finance-spinner" />
            <span>Generating report...</span>
          </div>
        </div>
      );
    }

    if (activeReport === 'trial_balance') {
      return <TrialBalanceReportView report={trialBalance} />;
    }
    if (activeReport === 'income_statement') {
      return (
        <>
          {isTrendLoading && (
            <div className="finance-report-filter-note">
              Loading income trend...
            </div>
          )}
          <IncomeStatementReportView report={incomeStatement} trendData={incomeTrend} />
        </>
      );
    }
    if (activeReport === 'balance_sheet') {
      return <BalanceSheetReportView report={balanceSheet} />;
    }
    if (activeReport === 'ar_aging') {
      return <AgingReportView report={arAging} type="ar" />;
    }
    return <AgingReportView report={apAging} type="ap" />;
  };

  return (
    <div className="finance-page">
      <div className="finance-sticky-stack">
        <div className="finance-page-header">
          <div className="finance-page-title">
            <div className="finance-page-title__icon">
              <FileBarChart2 size={22} />
            </div>
            <div>
              <h1>Finance Reports</h1>
              <p>Finance / Reports / Statements and aging</p>
            </div>
          </div>
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

        <ReportSelectorCards
          activeReport={activeReport}
          isLoading={isLoading}
          onGenerate={generateReport}
        />

        {activeReport && (
          <div className="finance-report-viewer" ref={reportViewerRef}>
            <FinanceReportFilters
              activeReport={activeReport}
              filters={filters}
              fiscalPeriods={sortedPeriods}
              isLoading={isLoading}
              onChange={updateFilters}
              onFiscalPeriodChange={handleFiscalPeriodChange}
              onGenerate={() => generateReport(activeReport)}
            />
            {renderReport()}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceReportsPage;

function isFinanceReportType(value: string | null): value is FinanceReportType {
  return value === 'trial_balance'
    || value === 'income_statement'
    || value === 'balance_sheet'
    || value === 'ar_aging'
    || value === 'ap_aging';
}
