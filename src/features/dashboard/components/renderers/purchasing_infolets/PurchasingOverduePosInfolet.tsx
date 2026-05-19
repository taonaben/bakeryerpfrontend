import React from "react";
import { AlertTriangle, CircleDollarSign } from "lucide-react";
import type { DashboardWidgetWidth } from "../../../types/dashboardTypes";
import {
  EmptyInfolet,
  formatNumber,
  isRecord,
  readString,
  SimpleTable,
  StatTiles,
  toNumber,
} from "../infoletRenderUtils";

interface PurchasingOverduePosInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

const formatCurrency = (value: unknown): string => `$${formatNumber(value, 2)}`;

export const PurchasingOverduePosInfolet: React.FC<
  PurchasingOverduePosInfoletProps
> = ({ data, width }) => {
  const record = isRecord(data) ? data : {};
  const overdueCount = toNumber(record.count ?? record.overdue_count ?? 0);
  const overdueValue = toNumber(
    record.value ?? record.total_value ?? record.overdue_value ?? 0,
  );
  const overdueRows = Array.isArray(record.items)
    ? record.items.filter(isRecord)
    : Array.isArray(record.overdue_purchase_orders)
      ? record.overdue_purchase_orders.filter(isRecord)
      : [];

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <StatTiles
        items={[
          {
            label: "Overdue POs",
            value: formatNumber(overdueCount, 0),
            tone: overdueCount > 0 ? "danger" : "good",
            icon: <AlertTriangle size={16} />,
          },
          {
            label: "Overdue value",
            value: formatCurrency(overdueValue),
            tone: overdueValue > 0 ? "warning" : "good",
            icon: <CircleDollarSign size={16} />,
          },
        ]}
      />
      {overdueRows.length > 0 ? (
        <SimpleTable
          rows={overdueRows}
          width={width}
          emptyMessage="No overdue purchase orders."
          columns={[
            {
              key: "po",
              label: "PO",
              render: (row) =>
                readString(row, ["po_number", "reference", "id"], "N/A"),
            },
            {
              key: "supplier",
              label: "Supplier",
              render: (row) =>
                readString(row, ["supplier_name", "supplier"], "Unknown"),
            },
            {
              key: "days",
              label: "Days",
              align: "right",
              render: (row) =>
                formatNumber(row.days_overdue ?? row.overdue_days, 0),
            },
            {
              key: "value",
              label: "Value",
              align: "right",
              render: (row) => formatCurrency(row.value ?? row.total_value),
            },
          ]}
        />
      ) : (
        <EmptyInfolet message="No overdue purchase orders." />
      )}
    </div>
  );
};

export default PurchasingOverduePosInfolet;
