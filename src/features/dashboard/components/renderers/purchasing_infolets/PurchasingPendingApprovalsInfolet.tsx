import React from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { CheckCircle2 } from "lucide-react";
import {
  ChartFrame,
  EmptyInfolet,
  formatLabel,
  formatNumber,
  isRecord,
  StatTiles,
  toNumber,
} from "../infoletRenderUtils";

const APPROVAL_COLORS = [
  "#2563eb",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#16a34a",
];

export const PurchasingPendingApprovalsInfolet: React.FC<{ data: unknown }> = ({
  data,
}) => {
  const record = isRecord(data) ? data : {};
  const chartData = Object.entries(record)
    .map(([key, value], index) => ({
      key,
      name: formatLabel(key),
      value: toNumber(value),
      color: APPROVAL_COLORS[index % APPROVAL_COLORS.length],
    }))
    .filter((entry) => entry.value > 0);
  const totalApprovals = chartData.reduce((sum, entry) => sum + entry.value, 0);

  if (totalApprovals <= 0) {
    return (
      <StatTiles
        items={[
          {
            label: "Pending approvals",
            value: "0",
            tone: "good",
            icon: <CheckCircle2 size={16} />,
          },
        ]}
      />
    );
  }

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <StatTiles
        items={[
          {
            label: "Pending approvals",
            value: formatNumber(totalApprovals, 0),
            tone: totalApprovals > 0 ? "warning" : "good",
            icon: <CheckCircle2 size={16} />,
          },
        ]}
      />
      {chartData.length > 0 ? (
        <ChartFrame size="small">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={28}
              outerRadius={48}
              paddingAngle={3}
            >
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatNumber(value, 0)} />
          </PieChart>
        </ChartFrame>
      ) : (
        <EmptyInfolet message="No pending approvals." />
      )}
    </div>
  );
};

export default PurchasingPendingApprovalsInfolet;
