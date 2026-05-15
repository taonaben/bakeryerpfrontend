import React from 'react';
import type { BalanceSheetLine, BalanceSheetReport } from '../../types/finance_reports_models';
import {
  formatReportMoney,
  nearlyEqual,
  toNumber,
} from './financeReportHelpers';

interface BalanceSheetReportViewProps {
  report: BalanceSheetReport | null;
}

const BalanceSheetReportView: React.FC<BalanceSheetReportViewProps> = ({ report }) => {
  if (!report) {
    return (
      <div className="finance-table-container">
        <div className="finance-empty-state">
          <h3>No report data</h3>
          <p>Generate a balance sheet to view assets, liabilities, and equity.</p>
        </div>
      </div>
    );
  }

  const liabilitiesAndEquity = toNumber(report.total_liabilities) + toNumber(report.total_equity);
  const balanced = report.is_balanced && nearlyEqual(toNumber(report.total_assets), liabilitiesAndEquity);

  return (
    <section className="finance-report-output finance-balance-sheet">
      <div className="finance-section-header">
        <div>
          <h2>Balance Sheet</h2>
          <p>As of {report.as_of_date || '-'}</p>
        </div>
      </div>

      <div className="finance-balance-sheet__columns">
        <StatementColumn title="Assets" lines={report.assets} totalLabel="Total Assets" total={report.total_assets} />
        <div className="finance-balance-sheet__stack">
          <StatementColumn title="Liabilities" lines={report.liabilities} totalLabel="Total Liabilities" total={report.total_liabilities} />
          <StatementColumn title="Equity" lines={report.equity} totalLabel="Total Equity" total={report.total_equity} />
        </div>
      </div>

      <div className={`finance-balance-check ${balanced ? '' : 'finance-balance-check--danger'}`}>
        <span>Total Assets</span>
        <strong>{formatReportMoney(report.total_assets)}</strong>
        <span>Total Liabilities + Equity</span>
        <strong>{formatReportMoney(liabilitiesAndEquity)}</strong>
        <b>{balanced ? 'Balanced' : 'Out of balance'}</b>
      </div>
    </section>
  );
};

const StatementColumn: React.FC<{
  title: string;
  lines: BalanceSheetLine[];
  totalLabel: string;
  total: number;
}> = ({ title, lines, totalLabel, total }) => (
  <section className="finance-statement-card finance-balance-column">
    <h3>{title}</h3>
    {lines.length > 0 ? (
      lines.map((line) => (
        <div className="finance-statement-line" key={`${line.account_code}-${line.account_name}`}>
          <span>{line.account_name}</span>
          <strong>{formatReportMoney(line.balance)}</strong>
        </div>
      ))
    ) : (
      <div className="finance-statement-line finance-statement-line--muted">
        <span>No lines</span>
        <strong>{formatReportMoney(0)}</strong>
      </div>
    )}
    <div className="finance-statement-total finance-statement-total--emphasis">
      <span>{totalLabel}</span>
      <strong>{formatReportMoney(total)}</strong>
    </div>
  </section>
);

export default BalanceSheetReportView;
