import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardWidgetWidth } from "../../../types/dashboardTypes";
import {
  ChartFrame,
  EmptyInfolet,
  formatNumber,
  ProgressMetric,
  StatTiles,
  isRecord,
  toNumber,
} from "../infoletRenderUtils";

interface FinancePnlSummaryInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

const formatCurrency = (value: unknown): string => `$${formatNumber(value, 2)}`;

export const FinancePnlSummaryInfolet: React.FC<
  FinancePnlSummaryInfoletProps
> = ({ data }) => {
  const record = isRecord(data) ? data : null;
  if (!record) return <EmptyInfolet message="No P&L summary data found." />;

  const revenue = toNumber(record.total_revenue ?? record.revenue);
  const costOfSales = toNumber(
    record.total_cost_of_sales ?? record.cost_of_sales,
  );
  const operatingExpenses = toNumber(
    record.total_operating_expenses ??
      record.operating_expenses ??
      record.total_expenses,
  );
  const grossProfit = toNumber(
    record.gross_profit ?? record.total_gross_profit ?? revenue - costOfSales,
  );
  const netProfit = toNumber(
    record.net_profit ??
      record.total_net_profit ??
      grossProfit - operatingExpenses,
  );

  const chartData = [
    { metric: "Revenue", value: revenue, color: "#16a34a" },
    { metric: "Cost of Sales", value: costOfSales, color: "#f59e0b" },
    { metric: "OpEx", value: operatingExpenses, color: "#dc2626" },
    {
      metric: "Net",
      value: netProfit,
      color: netProfit >= 0 ? "#2563eb" : "#dc2626",
    },
  ];

  const grossMargin = revenue > 0 ? grossProfit / revenue : null;
  const netMargin = revenue > 0 ? netProfit / revenue : null;

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <StatTiles
        items={[
          {
            label: "Revenue",
            value: formatCurrency(revenue),
            tone: "good",
          },
          {
            label: "Gross profit",
            value: formatCurrency(grossProfit),
            tone: grossProfit >= 0 ? "good" : "danger",
          },
          {
            label: "Net profit",
            value: formatCurrency(netProfit),
            tone: netProfit >= 0 ? "good" : "danger",
          },
        ]}
      />
      <ChartFrame>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="metric" tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((row) => (
              <Cell key={row.metric} fill={row.color} />
            ))}
          </Bar>
        </BarChart>
      </ChartFrame>
      <div className="dashboard-progress-grid">
        <ProgressMetric
          label="Gross margin"
          value={grossMargin}
          tone={grossMargin !== null && grossMargin >= 0.3 ? "good" : "warning"}
        />
        <ProgressMetric
          label="Net margin"
          value={netMargin}
          tone={netMargin !== null && netMargin >= 0.1 ? "good" : "warning"}
        />
      </div>
    </div>
  );
};

export default FinancePnlSummaryInfolet;
