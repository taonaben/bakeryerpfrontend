import React from "react";
import { DollarSign, TrendingDown } from "lucide-react";
import {
  formatNumber,
  isRecord,
  MetricHero,
  optionalNumber,
  toNumber,
} from "../infoletRenderUtils";

const formatCurrency = (value: unknown): string => `$${formatNumber(value, 2)}`;

export const FinanceRevenueInfolet: React.FC<{ data: unknown }> = ({
  data,
}) => {
  const record = isRecord(data) ? data : {};
  const revenue = toNumber(record.total_revenue ?? record.revenue ?? data);
  const previous = optionalNumber(record.previous_revenue);
  const delta = previous === null ? null : revenue - previous;

  return (
    <MetricHero
      value={formatCurrency(revenue)}
      label="Revenue"
      tone={delta !== null && delta < 0 ? "warning" : "good"}
      icon={
        delta !== null && delta < 0 ? (
          <TrendingDown size={20} />
        ) : (
          <DollarSign size={20} />
        )
      }
      secondary={
        delta === null
          ? "No prior period comparison"
          : `${delta >= 0 ? "▲" : "▼"} ${formatCurrency(Math.abs(delta))} vs prior`
      }
    />
  );
};

export default FinanceRevenueInfolet;
