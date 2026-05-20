import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardWidgetWidth } from "../../../types/dashboardTypes";
import {
  ChartFrame,
  EmptyInfolet,
  formatNumber,
  getRowLimit,
  isRecord,
  readString,
  toNumber,
} from "../infoletRenderUtils";

interface PurchasingTrendsInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

export const PurchasingTrendsInfolet: React.FC<
  PurchasingTrendsInfoletProps
> = ({ data, width }) => {
  const record = isRecord(data) ? data : {};
  const rows = Array.isArray(data)
    ? data.filter(isRecord)
    : Array.isArray(record.trends)
      ? record.trends.filter(isRecord)
      : Array.isArray(record.data)
        ? record.data.filter(isRecord)
        : [];

  const chartData = rows.slice(-getRowLimit(width, 5)).map((row) => ({
    period: readString(row, ["period", "date", "day"], ""),
    spend: toNumber(row.total_spend ?? row.spend ?? row.purchase_value),
    openValue: toNumber(row.open_po_value ?? row.open_value),
    overdueCount: toNumber(row.overdue_pos ?? row.overdue_count),
  }));

  if (chartData.length === 0) {
    return <EmptyInfolet message="No purchasing trend data found." />;
  }

  return (
    <div className="dashboard-module-renderer">
      <ChartFrame>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis yAxisId="value" hide />
          <YAxis yAxisId="count" orientation="right" hide />
          <Tooltip formatter={(value) => formatNumber(value)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            yAxisId="value"
            type="monotone"
            dataKey="spend"
            name="Spend"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="value"
            type="monotone"
            dataKey="openValue"
            name="Open PO Value"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="count"
            type="monotone"
            dataKey="overdueCount"
            name="Overdue POs"
            stroke="#dc2626"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ChartFrame>
    </div>
  );
};

export default PurchasingTrendsInfolet;
