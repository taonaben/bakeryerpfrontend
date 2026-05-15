import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { IncomeStatementReport } from '../../types/finance_reports_models';
import {
  formatReportMoney,
  formatSignedMoney,
  toNumber,
} from './financeReportHelpers';

const CHART_COLORS = {
  revenue: '#0f9f6e',
  expenses: '#dc2626',
  slate: '#94a3b8',
};

export interface IncomeTrendPoint {
  period: string;
  revenue: number;
  expenses: number;
}

interface IncomeStatementReportViewProps {
  report: IncomeStatementReport | null;
  trendData: IncomeTrendPoint[];
}

const IncomeStatementReportView: React.FC<IncomeStatementReportViewProps> = ({
  report,
  trendData,
}) => {
  if (!report) {
    return (
      <div className="finance-table-container">
        <div className="finance-empty-state">
          <h3>No report data</h3>
          <p>Generate an income statement to view revenue and expenses.</p>
        </div>
      </div>
    );
  }

  const showChart = trendData.length >= 2;

  return (
    <section className={`finance-report-output finance-income-statement-layout ${showChart ? 'has-chart' : ''}`}>
      <div className="finance-statement-card">
        <div className="finance-section-header">
          <div>
            <h2>Income Statement</h2>
            <p>{report.date_from || '-'} to {report.date_to || '-'}</p>
          </div>
        </div>

        <StatementSection
          title="Revenue"
          lines={report.revenue}
          totalLabel="Total Revenue"
          total={report.total_revenue}
        />
        <StatementSection
          title="Cost of Sales"
          lines={report.cost_of_sales}
          totalLabel="Total Cost of Sales"
          total={report.total_cost_of_sales}
        />
        <StatementTotal label="Gross Profit" value={report.gross_profit} emphasis />
        <StatementSection
          title="Operating Expenses"
          lines={report.operating_expenses}
          totalLabel="Total Operating Exp"
          total={report.total_operating_expenses}
        />
        <StatementTotal label="Net Profit / (Loss)" value={report.net_profit} emphasis danger={toNumber(report.net_profit) < 0} />
      </div>

      {showChart && (
        <div className="finance-statement-card finance-income-chart-card">
          <div className="finance-section-header">
            <div>
              <h2>Revenue vs Expenses</h2>
              <p>Last {trendData.length} fiscal periods</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="financeRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="financeExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.expenses} stopOpacity={0.13} />
                  <stop offset="95%" stopColor={CHART_COLORS.expenses} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10, fill: CHART_COLORS.slate }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatShortMoney}
                tick={{ fontSize: 10, fill: CHART_COLORS.slate }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<IncomeChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={CHART_COLORS.revenue}
                strokeWidth={2.5}
                fill="url(#financeRevenueGrad)"
                dot={{ r: 3, fill: CHART_COLORS.revenue, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: CHART_COLORS.revenue }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke={CHART_COLORS.expenses}
                strokeWidth={2.5}
                fill="url(#financeExpenseGrad)"
                dot={{ r: 3, fill: CHART_COLORS.expenses, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: CHART_COLORS.expenses }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="finance-chart-legend">
            <span><i style={{ background: CHART_COLORS.revenue }} />Revenue</span>
            <span><i style={{ background: CHART_COLORS.expenses }} />Expenses</span>
          </div>
        </div>
      )}
    </section>
  );
};

interface StatementSectionProps {
  title: string;
  lines: Array<{ account_code: string; account_name: string; amount: number }>;
  totalLabel: string;
  total: number;
}

const StatementSection: React.FC<StatementSectionProps> = ({
  title,
  lines,
  totalLabel,
  total,
}) => (
  <section className="finance-statement-section">
    <h3>{title}</h3>
    {lines.length > 0 ? (
      lines.map((line) => (
        <div className="finance-statement-line" key={`${line.account_code}-${line.account_name}`}>
          <span>{line.account_name}</span>
          <strong>{formatReportMoney(line.amount)}</strong>
        </div>
      ))
    ) : (
      <div className="finance-statement-line finance-statement-line--muted">
        <span>No lines</span>
        <strong>{formatReportMoney(0)}</strong>
      </div>
    )}
    <StatementTotal label={totalLabel} value={total} />
  </section>
);

const StatementTotal: React.FC<{
  label: string;
  value: number;
  emphasis?: boolean;
  danger?: boolean;
}> = ({ label, value, emphasis = false, danger = false }) => (
  <div className={`finance-statement-total ${emphasis ? 'finance-statement-total--emphasis' : ''} ${danger ? 'finance-statement-total--danger' : ''}`}>
    <span>{label}</span>
    <strong>{formatSignedMoney(value)}</strong>
  </div>
);

const IncomeChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="finance-chart-tooltip">
      <div className="finance-chart-tooltip__label">{label}</div>
      {payload.map((item: any) => (
        <div key={item.dataKey} className="finance-chart-tooltip__row">
          <span className="finance-chart-tooltip__dot" style={{ background: item.color }} />
          <span>{item.name}</span>
          <strong>{formatReportMoney(Number(item.value))}</strong>
        </div>
      ))}
    </div>
  );
};

function formatShortMoney(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export default IncomeStatementReportView;
