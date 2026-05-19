import React from "react";
import { Wallet } from "lucide-react";
import {
  formatNumber,
  isRecord,
  MetricHero,
  optionalNumber,
  toNumber,
} from "../infoletRenderUtils";

const formatCurrency = (value: unknown): string => `$${formatNumber(value, 2)}`;

export const FinanceExpensesInfolet: React.FC<{ data: unknown }> = ({
  data,
}) => {
  const record = isRecord(data) ? data : {};
  const expenses = toNumber(
    record.total_operating_expenses ??
      record.operating_expenses ??
      record.total_expenses ??
      data,
  );
  const previous = optionalNumber(
    record.previous_operating_expenses ?? record.previous_expenses,
  );
  const delta = previous === null ? null : expenses - previous;

  return (
    <MetricHero
      value={formatCurrency(expenses)}
      label="Operating expenses"
      tone={delta !== null && delta > 0 ? "danger" : "warning"}
      icon={<Wallet size={20} />}
      secondary={
        delta === null
          ? "No prior period comparison"
          : `${delta >= 0 ? "▲" : "▼"} ${formatCurrency(Math.abs(delta))} vs prior`
      }
    />
  );
};

export default FinanceExpensesInfolet;
