import React from "react";
import { ArrowUpRight, Coins } from "lucide-react";
import {
  formatNumber,
  isRecord,
  MetricHero,
  optionalNumber,
  toNumber,
} from "../infoletRenderUtils";

const formatCurrency = (value: unknown): string => `$${formatNumber(value, 2)}`;

export const SalesCogsInfolet: React.FC<{ data: unknown }> = ({ data }) => {
  const record = isRecord(data) ? data : {};
  const cogs = toNumber(record.total_cogs ?? record.cogs ?? data);
  const revenue = optionalNumber(record.total_revenue ?? record.revenue);
  const cogsRatio = revenue === null || revenue <= 0 ? null : cogs / revenue;

  return (
    <MetricHero
      value={formatCurrency(cogs)}
      label="Daily COGS"
      tone={cogsRatio !== null && cogsRatio > 0.7 ? "danger" : "warning"}
      icon={
        cogsRatio !== null && cogsRatio > 0.7 ? (
          <ArrowUpRight size={20} />
        ) : (
          <Coins size={20} />
        )
      }
      secondary={
        cogsRatio === null
          ? "Revenue comparison unavailable"
          : `COGS ratio ${(cogsRatio * 100).toFixed(1)}%`
      }
    />
  );
};

export default SalesCogsInfolet;
