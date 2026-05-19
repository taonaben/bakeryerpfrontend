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

export const SalesGrossProfitInfolet: React.FC<{ data: unknown }> = ({
  data,
}) => {
  const record = isRecord(data) ? data : {};
  const grossProfit = toNumber(
    record.gross_profit ?? record.total_gross_profit ?? data,
  );
  const margin = optionalNumber(record.gross_margin ?? record.margin);
  const tone = grossProfit >= 0 ? "good" : "danger";

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <MetricHero
        value={formatCurrency(grossProfit)}
        label="Gross profit"
        tone={tone}
        icon={
          grossProfit >= 0 ? (
            <ArrowUpRight size={20} />
          ) : (
            <ArrowDownRight size={20} />
          )
        }
        secondary={
          grossProfit >= 0 ? "Positive contribution" : "Negative contribution"
        }
      />
      <ProgressMetric
        label="Gross margin"
        value={margin}
        tone={margin !== null && margin >= 0.3 ? "good" : "warning"}
      />
    </div>
  );
};

export default SalesGrossProfitInfolet;
