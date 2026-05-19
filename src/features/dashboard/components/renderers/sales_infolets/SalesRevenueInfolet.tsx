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

export const SalesRevenueInfolet: React.FC<{ data: unknown }> = ({ data }) => {
  const record = isRecord(data) ? data : {};
  const revenue = toNumber(record.total_revenue ?? record.revenue ?? data);
  const previous = optionalNumber(
    record.previous_revenue ?? record.previous_day_revenue,
  );
  const delta = previous === null ? null : revenue - previous;

  return (
    <MetricHero
      value={formatCurrency(revenue)}
      label="Daily revenue"
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
          ? "No prior period to compare"
          : `${delta >= 0 ? "▲" : "▼"} ${formatCurrency(Math.abs(delta))} vs yesterday`
      }
    />
  );
};

export default SalesRevenueInfolet;
