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

export const FinanceGrossProfitInfolet: React.FC<{ data: unknown }> = ({
  data,
}) => {
  const record = isRecord(data) ? data : {};
  const gross = toNumber(
    record.gross_profit ?? record.total_gross_profit ?? data,
  );
  const revenue = optionalNumber(record.total_revenue ?? record.revenue);
  const margin = revenue === null || revenue === 0 ? null : gross / revenue;

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <MetricHero
        value={formatCurrency(gross)}
        label="Gross profit"
        tone={gross >= 0 ? "good" : "danger"}
        icon={
          gross >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />
        }
        secondary={
          gross >= 0
            ? "Operating above cost baseline"
            : "Costs are overrunning revenue"
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

export default FinanceGrossProfitInfolet;
