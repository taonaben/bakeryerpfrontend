import React from "react";
import { Receipt } from "lucide-react";
import {
  formatNumber,
  isRecord,
  MetricHero,
  toNumber,
} from "../infoletRenderUtils";

export const SalesTransactionsInfolet: React.FC<{ data: unknown }> = ({
  data,
}) => {
  const record = isRecord(data) ? data : {};
  const transactions = toNumber(
    record.total_transactions ?? record.transactions ?? data,
  );

  return (
    <MetricHero
      value={formatNumber(transactions, 0)}
      label="Transactions today"
      tone={transactions > 0 ? "info" : "neutral"}
      icon={<Receipt size={20} />}
      secondary={
        transactions > 0
          ? "Sales activity is active"
          : "No transactions posted yet"
      }
    />
  );
};

export default SalesTransactionsInfolet;
