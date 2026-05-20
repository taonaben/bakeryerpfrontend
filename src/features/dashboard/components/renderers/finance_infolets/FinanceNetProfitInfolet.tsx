import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  formatNumber,
  isRecord,
  MetricHero,
  optionalNumber,
  ProgressMetric,
  toNumber,
} from "../infoletRenderUtils";

const formatCurrency = (value: unknown): string => `$${formatNumber(value, 2)}`;

export const FinanceNetProfitInfolet: React.FC<{ data: unknown }> = ({
  data,
}) => {
  const record = isRecord(data) ? data : {};
  const netProfit = toNumber(
    record.net_profit ?? record.total_net_profit ?? data,
  );
  const revenue = optionalNumber(record.total_revenue ?? record.revenue);
  const margin = revenue === null || revenue === 0 ? null : netProfit / revenue;

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <MetricHero
        value={formatCurrency(netProfit)}
        label="Net profit"
        tone={netProfit >= 0 ? "good" : "danger"}
        icon={
          netProfit >= 0 ? (
            <ArrowUpRight size={20} />
          ) : (
            <ArrowDownRight size={20} />
          )
        }
        secondary={
          netProfit >= 0
            ? "Profitable after all expenses"
            : "Loss after expenses"
        }
      />
      <ProgressMetric
        label="Net margin"
        value={margin}
        tone={margin !== null && margin >= 0.1 ? "good" : "warning"}
      />
    </div>
  );
};

export default FinanceNetProfitInfolet;
