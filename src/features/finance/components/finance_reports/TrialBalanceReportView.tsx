import React from 'react';
import type { TrialBalanceReport } from '../../types/finance_reports_models';
import {
  formatReportMoney,
  groupTrialBalanceLines,
  nearlyEqual,
  toNumber,
} from './financeReportHelpers';

interface TrialBalanceReportViewProps {
  report: TrialBalanceReport | null;
}

const TrialBalanceReportView: React.FC<TrialBalanceReportViewProps> = ({ report }) => {
  if (!report) return <EmptyReport message="Generate a trial balance to view account totals." />;

  const groups = groupTrialBalanceLines(report.lines || []);
  const balanced = report.is_balanced && nearlyEqual(toNumber(report.total_debits), toNumber(report.total_credits));

  if (groups.length === 0) {
    return <EmptyReport message="No trial balance lines were returned for this period." />;
  }

  return (
    <section className="finance-report-output">
      <div className="finance-section-header">
        <div>
          <h2>Trial Balance</h2>
          <p>{report.date_from || '-'} to {report.date_to || '-'}</p>
        </div>
      </div>

      <div className="finance-table-container finance-report-table-wrap">
        <table className="finance-table finance-report-table trial-balance-report-table">
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th>Account Type</th>
              <th className="finance-table__amount">Total Debits</th>
              <th className="finance-table__amount">Total Credits</th>
              <th className="finance-table__amount">Balance</th>
              <th>Normal Balance</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <React.Fragment key={group.accountType}>
                <tr className="finance-report-group-row">
                  <td colSpan={7}>{group.accountType}</td>
                </tr>
                {group.lines.map((line) => (
                  <tr key={`${line.account_code}-${line.account_name}`}>
                    <td className="finance-mono-link">{line.account_code}</td>
                    <td>{line.account_name}</td>
                    <td>{line.account_type}</td>
                    <td className="finance-table__amount">{formatReportMoney(line.total_debits)}</td>
                    <td className="finance-table__amount">{formatReportMoney(line.total_credits)}</td>
                    <td className="finance-table__amount">{formatReportMoney(line.balance)}</td>
                    <td>{line.normal_balance}</td>
                  </tr>
                ))}
                <tr className="finance-report-subtotal-row">
                  <td colSpan={3}>Subtotal {group.accountType}</td>
                  <td className="finance-table__amount">{formatReportMoney(group.totalDebits)}</td>
                  <td className="finance-table__amount">{formatReportMoney(group.totalCredits)}</td>
                  <td className="finance-table__amount">{formatReportMoney(group.balance)}</td>
                  <td />
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className={balanced ? '' : 'finance-report-total-row--danger'}>
              <td colSpan={3}>Grand Total</td>
              <td className="finance-table__amount">{formatReportMoney(report.total_debits)}</td>
              <td className="finance-table__amount">{formatReportMoney(report.total_credits)}</td>
              <td className="finance-table__amount" colSpan={2}>
                {balanced ? 'Balanced' : 'Not balanced'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

const EmptyReport: React.FC<{ message: string }> = ({ message }) => (
  <div className="finance-table-container">
    <div className="finance-empty-state">
      <h3>No report data</h3>
      <p>{message}</p>
    </div>
  </div>
);

export default TrialBalanceReportView;
