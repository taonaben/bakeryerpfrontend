import React from "react";
import { AlertTriangle } from "lucide-react";
import type { DashboardWidgetWidth } from "../../../types/dashboardTypes";
import {
  EmptyInfolet,
  formatNumber,
  isRecord,
  readString,
  SimpleTable,
  StatTiles,
  toNumber,
} from "../infoletRenderUtils";

interface CostAdverseVariancesInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

const formatCurrency = (value: unknown): string => `$${formatNumber(value, 2)}`;

export const CostAdverseVariancesInfolet: React.FC<
  CostAdverseVariancesInfoletProps
> = ({ data, width }) => {
  const rows = Array.isArray(data)
    ? data.filter(isRecord)
    : isRecord(data) && Array.isArray(data.items)
      ? data.items.filter(isRecord)
      : [];

  const adverseRows = rows
    .filter((row) => {
      const isFavourable = row.is_favourable;
      if (typeof isFavourable === "boolean") return !isFavourable;
      return toNumber(row.total_variance) > 0;
    })
    .sort(
      (a, b) =>
        Math.abs(toNumber(b.total_variance)) -
        Math.abs(toNumber(a.total_variance)),
    );

  const totalAdverse = adverseRows.reduce(
    (sum, row) => sum + Math.abs(toNumber(row.total_variance)),
    0,
  );

  if (adverseRows.length === 0) {
    return (
      <StatTiles
        items={[
          {
            label: "Adverse variances",
            value: "0",
            tone: "good",
            icon: <AlertTriangle size={16} />,
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
            label: "Adverse items",
            value: formatNumber(adverseRows.length, 0),
            tone: "danger",
            icon: <AlertTriangle size={16} />,
          },
          {
            label: "Total adverse",
            value: formatCurrency(totalAdverse),
            tone: "warning",
            icon: <AlertTriangle size={16} />,
          },
        ]}
      />
      {adverseRows.length > 0 ? (
        <SimpleTable
          rows={adverseRows}
          width={width}
          emptyMessage="No adverse variances found."
          columns={[
            {
              key: "product",
              label: "Product",
              render: (row) =>
                readString(
                  row,
                  ["product_name", "product", "group_name"],
                  "Unknown",
                ),
            },
            {
              key: "variance",
              label: "Variance",
              align: "right",
              render: (row) => formatCurrency(row.total_variance),
            },
            {
              key: "percent",
              label: "Var %",
              align: "right",
              render: (row) =>
                `${formatNumber(row.variance_percentage ?? row.avg_variance_percentage)}%`,
            },
          ]}
        />
      ) : (
        <EmptyInfolet message="No adverse variances found." />
      )}
    </div>
  );
};

export default CostAdverseVariancesInfolet;
