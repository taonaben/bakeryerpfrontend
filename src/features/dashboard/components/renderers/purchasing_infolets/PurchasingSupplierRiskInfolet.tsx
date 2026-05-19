import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { DashboardWidgetWidth } from "../../../types/dashboardTypes";
import {
  EmptyInfolet,
  formatNumber,
  isRecord,
  optionalNumber,
  ProgressMetric,
  readString,
  SimpleTable,
  StatTiles,
  toNumber,
} from "../infoletRenderUtils";

interface PurchasingSupplierRiskInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

export const PurchasingSupplierRiskInfolet: React.FC<
  PurchasingSupplierRiskInfoletProps
> = ({ data, width }) => {
  const record = isRecord(data) ? data : {};
  const highRiskSuppliers = toNumber(
    record.high_risk_suppliers ?? record.high_risk_count ?? 0,
  );
  const onTimeRate = optionalNumber(
    record.on_time_rate ?? record.on_time_delivery_rate,
  );
  const riskRows = Array.isArray(record.suppliers)
    ? record.suppliers.filter(isRecord)
    : Array.isArray(record.risk_items)
      ? record.risk_items.filter(isRecord)
      : [];

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <StatTiles
        items={[
          {
            label: "High-risk suppliers",
            value: formatNumber(highRiskSuppliers, 0),
            tone: highRiskSuppliers > 0 ? "danger" : "good",
            icon:
              highRiskSuppliers > 0 ? (
                <AlertTriangle size={16} />
              ) : (
                <ShieldCheck size={16} />
              ),
          },
        ]}
      />
      <div className="dashboard-progress-grid">
        <ProgressMetric
          label="On-time delivery"
          value={onTimeRate}
          tone={onTimeRate !== null && onTimeRate >= 0.9 ? "good" : "warning"}
        />
        <ProgressMetric
          label="Risk score"
          value={optionalNumber(record.risk_score)}
          tone={toNumber(record.risk_score) > 70 ? "danger" : "warning"}
        />
      </div>
      {riskRows.length > 0 ? (
        <SimpleTable
          rows={riskRows}
          width={width}
          emptyMessage="No risky suppliers listed."
          columns={[
            {
              key: "supplier",
              label: "Supplier",
              render: (row) =>
                readString(row, ["supplier_name", "name"], "Unknown supplier"),
            },
            {
              key: "risk",
              label: "Risk",
              align: "right",
              render: (row) =>
                `${formatNumber(row.risk_score ?? row.score, 0)}%`,
            },
            {
              key: "delays",
              label: "Delays",
              align: "right",
              render: (row) => formatNumber(row.delay_count ?? row.delays, 0),
            },
          ]}
        />
      ) : (
        <EmptyInfolet message="No supplier risk details available." />
      )}
    </div>
  );
};

export default PurchasingSupplierRiskInfolet;
