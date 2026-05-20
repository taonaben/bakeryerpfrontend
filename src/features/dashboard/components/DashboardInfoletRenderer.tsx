import React from "react";
import { GenericInfoletRenderer } from "./GenericInfoletRenderer";
import { ProductionInventoryInfoletRenderer } from "./renderers/ProductionInventoryInfolets";
import { PurchasingSalesInfoletRenderer } from "./renderers/PurchasingSalesInfolets";
import { CostingFinanceInfoletRenderer } from "./renderers/CostingFinanceInfolets";
import type { DashboardResolvedWidget } from "../types/dashboardTypes";

interface DashboardInfoletRendererProps {
  widget: DashboardResolvedWidget;
}

export const DashboardInfoletRenderer: React.FC<
  DashboardInfoletRendererProps
> = ({ widget }) => {
  if (
    widget.key.startsWith("production_") ||
    widget.key.startsWith("inventory_")
  ) {
    return <ProductionInventoryInfoletRenderer widget={widget} />;
  }

  if (
    widget.key.startsWith("sales_") ||
    [
      "po_status",
      "open_po_value",
      "overdue_pos",
      "pending_approvals",
      "supplier_risk",
      "purchasing_trends",
    ].includes(widget.key)
  ) {
    return <PurchasingSalesInfoletRenderer widget={widget} />;
  }

  if (
    widget.key.startsWith("finance_") ||
    ["cost_variance_summary", "adverse_variances", "costing_margin"].includes(
      widget.key,
    )
  ) {
    return <CostingFinanceInfoletRenderer widget={widget} />;
  }

  return (
    <GenericInfoletRenderer data={widget.data} width={widget.layout.width} />
  );
};

export default DashboardInfoletRenderer;
