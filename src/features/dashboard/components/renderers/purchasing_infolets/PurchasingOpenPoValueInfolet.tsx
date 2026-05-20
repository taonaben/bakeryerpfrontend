import React from "react";
import { FileStack } from "lucide-react";
import {
  formatNumber,
  isRecord,
  MetricHero,
  optionalNumber,
  toNumber,
} from "../infoletRenderUtils";

const formatCurrency = (value: unknown): string => `$${formatNumber(value, 2)}`;

export const PurchasingOpenPoValueInfolet: React.FC<{ data: unknown }> = ({
  data,
}) => {
  const record = isRecord(data) ? data : {};
  const value = toNumber(record.open_po_value ?? record.value ?? data);
  const previous = optionalNumber(
    record.previous_open_po_value ?? record.previous_value,
  );
  const delta = previous === null ? null : value - previous;
  const tone = value > 0 ? "warning" : "good";

  return (
    <MetricHero
      value={formatCurrency(value)}
      label="Open PO value"
      tone={tone}
      icon={<FileStack size={20} />}
      secondary={
        delta === null
          ? "No previous period comparison"
          : `${delta >= 0 ? "+" : "-"}${formatCurrency(Math.abs(delta))} vs prior ${delta >= 0 ? "▲" : "▼"}`
      }
    />
  );
};

export default PurchasingOpenPoValueInfolet;
