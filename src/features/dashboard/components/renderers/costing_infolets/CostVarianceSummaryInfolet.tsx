import React from "react";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import {
  ChartFrame,
  EmptyInfolet,
  formatNumber,
  isRecord,
  StatTiles,
  toNumber,
} from "../infoletRenderUtils";

interface CostVarianceSummaryInfoletProps {
  data: unknown;
}

const formatCurrency = (value: unknown): string => `$${formatNumber(value, 2)}`;

export const CostVarianceSummaryInfolet: React.FC<
  CostVarianceSummaryInfoletProps
> = ({ data }) => {
  const rows = Array.isArray(data)
    ? data.filter(isRecord)
    : isRecord(data) && Array.isArray(data.items)
      ? data.items.filter(isRecord)
      : [];

  if (rows.length === 0) {
    if (isRecord(data)) {
      const totalVariance = toNumber(data.total_variance);
      const adverseCount = toNumber(data.adverse_count);
      const favourableCount = toNumber(
        data.favourable_count ?? data.favorable_count,
      );
      return (
        <StatTiles
          items={[
            {
              label: "Total variance",
              value: formatCurrency(totalVariance),
              tone: totalVariance > 0 ? "danger" : "good",
              icon:
                totalVariance > 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                ),
            },
            {
              label: "Adverse",
              value: formatNumber(adverseCount, 0),
              tone: adverseCount > 0 ? "warning" : "good",
              icon: <AlertTriangle size={16} />,
            },
            {
              label: "Favourable",
              value: formatNumber(favourableCount, 0),
              tone: "good",
              icon: <TrendingDown size={16} />,
            },
          ]}
        />
      );
    }

    return <EmptyInfolet message="No variance summary data found." />;
  }

  const totals = rows.reduce(
    (acc, row) => {
      const variance = toNumber(row.total_variance);
      acc.totalVariance += variance;
      if (variance > 0) acc.adverse += 1;
      else if (variance < 0) acc.favourable += 1;
      acc.material += Math.abs(
        toNumber(row.material_price_variance) +
          toNumber(row.material_usage_variance),
      );
      acc.yield += Math.abs(toNumber(row.yield_variance));
      acc.overhead += Math.abs(toNumber(row.overhead_variance));
      return acc;
    },
    {
      totalVariance: 0,
      adverse: 0,
      favourable: 0,
      material: 0,
      yield: 0,
      overhead: 0,
    },
  );

  const breakdownData = [
    { label: "Material", value: totals.material },
    { label: "Yield", value: totals.yield },
    { label: "Overhead", value: totals.overhead },
  ];

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <StatTiles
        items={[
          {
            label: "Total variance",
            value: formatCurrency(totals.totalVariance),
            tone: totals.totalVariance > 0 ? "danger" : "good",
            icon:
              totals.totalVariance > 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              ),
          },
          {
            label: "Adverse items",
            value: formatNumber(totals.adverse, 0),
            tone: totals.adverse > 0 ? "warning" : "good",
            icon: <AlertTriangle size={16} />,
          },
          {
            label: "Favourable items",
            value: formatNumber(totals.favourable, 0),
            tone: "good",
            icon: <TrendingDown size={16} />,
          },
        ]}
      />
      <ChartFrame size="small">
        <BarChart data={breakdownData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartFrame>
    </div>
  );
};

export default CostVarianceSummaryInfolet;
