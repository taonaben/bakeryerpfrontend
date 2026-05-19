import React from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardWidgetWidth } from "../../../types/dashboardTypes";
import {
  ChartFrame,
  EmptyInfolet,
  formatNumber,
  getRowLimit,
  isRecord,
  readString,
  SimpleTable,
  toNumber,
} from "../infoletRenderUtils";

interface CostProductMarginsInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

export const CostProductMarginsInfolet: React.FC<
  CostProductMarginsInfoletProps
> = ({ data, width }) => {
  const rows = Array.isArray(data)
    ? data.filter(isRecord)
    : isRecord(data) && Array.isArray(data.items)
      ? data.items.filter(isRecord)
      : [];

  if (rows.length === 0) {
    return <EmptyInfolet message="No product margin data found." />;
  }

  const chartRows = rows
    .map((row) => ({
      product: readString(row, ["product_name", "product"], "Unknown"),
      targetMargin: toNumber(row.target_gross_margin_percentage),
      minMargin: toNumber(row.minimum_margin_percentage),
    }))
    .slice(0, getRowLimit(width, 5));

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <ChartFrame>
        <BarChart data={chartRows}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="product"
            tickLine={false}
            axisLine={false}
            hide={width === "half"}
          />
          <YAxis hide />
          <Tooltip formatter={(value) => `${formatNumber(value)}%`} />
          <Bar
            dataKey="targetMargin"
            name="Target margin"
            fill="#16a34a"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="minMargin"
            name="Min margin"
            fill="#f59e0b"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ChartFrame>
      <SimpleTable
        rows={rows}
        width={width}
        emptyMessage="No product margins available."
        columns={[
          {
            key: "product",
            label: "Product",
            render: (row) =>
              readString(row, ["product_name", "product"], "Unknown"),
          },
          {
            key: "target",
            label: "Target",
            align: "right",
            render: (row) =>
              `${formatNumber(row.target_gross_margin_percentage)}%`,
          },
          {
            key: "minimum",
            label: "Minimum",
            align: "right",
            render: (row) => `${formatNumber(row.minimum_margin_percentage)}%`,
          },
        ]}
      />
    </div>
  );
};

export default CostProductMarginsInfolet;
