import React from 'react';
import type { APAgingReport, ARAgingReport } from '../../types/finance_reports_models';
import {
  formatReportMoney,
  getAgingTotals,
  normalizeAgingLines,
  toNumber,
} from './financeReportHelpers';

interface AgingReportViewProps {
  report: ARAgingReport | APAgingReport | null;
  type: 'ar' | 'ap';
}

const AgingReportView: React.FC<AgingReportViewProps> = ({ report, type }) => {
  if (!report) {
    return (
      <div className="finance-table-container">
        <div className="finance-empty-state">
          <h3>No report data</h3>
          <p>Generate {type === 'ar' ? 'AR' : 'AP'} aging to view outstanding balances.</p>
        </div>
      </div>
    );
  }

  const lines = normalizeAgingLines(report.items || [], type);
  const totals = getAgingTotals(lines);
  const nameLabel = type === 'ar' ? 'Customer' : 'Supplier';

  if (lines.length === 0) {
    return (
      <div className="finance-table-container">
        <div className="finance-empty-state">
          <h3>No aging balances</h3>
          <p>No outstanding {type === 'ar' ? 'customer' : 'supplier'} balances were returned.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="finance-report-output">
      <div className="finance-section-header">
        <div>
          <h2>{type === 'ar' ? 'Accounts Receivable Aging' : 'Accounts Payable Aging'}</h2>
          <p>Outstanding balances grouped by age bucket.</p>
        </div>
      </div>

      <div className="finance-table-container finance-report-table-wrap">
        <table className="finance-table finance-report-table finance-aging-table">
          <thead>
            <tr>
              <th>{nameLabel}</th>
              <th className="finance-table__amount">Current</th>
              <th className="finance-table__amount">1-30 days</th>
              <th className="finance-table__amount">31-60</th>
              <th className="finance-table__amount">61-90</th>
              <th className="finance-table__amount">Over 90</th>
              <th className="finance-table__amount">Total Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={`${type}-${line.name}`} className={toNumber(line.over_90) > 0 ? 'finance-aging-row--danger' : ''}>
                <td>{line.name}</td>
                <td className="finance-table__amount">{formatReportMoney(line.current)}</td>
                <td className="finance-table__amount">{formatReportMoney(line.days_1_30)}</td>
                <td className="finance-table__amount">{formatReportMoney(line.days_31_60)}</td>
                <td className="finance-table__amount">{formatReportMoney(line.days_61_90)}</td>
                <td className="finance-table__amount">{formatReportMoney(line.over_90)}</td>
                <td className="finance-table__amount">{formatReportMoney(line.total_outstanding)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Subtotal</td>
              <td className="finance-table__amount">{formatReportMoney(totals.current)}</td>
              <td className="finance-table__amount">{formatReportMoney(totals.days_1_30)}</td>
              <td className="finance-table__amount">{formatReportMoney(totals.days_31_60)}</td>
              <td className="finance-table__amount">{formatReportMoney(totals.days_61_90)}</td>
              <td className="finance-table__amount">{formatReportMoney(totals.over_90)}</td>
              <td className="finance-table__amount">{formatReportMoney(totals.total_outstanding)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default AgingReportView;
