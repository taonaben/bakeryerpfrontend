import React from "react";
import { GenericInfoletRenderer } from "../GenericInfoletRenderer";
import type { DashboardResolvedWidget } from "../../types/dashboardTypes";
import {
  PurchasingOpenPoValueInfolet,
  PurchasingOverduePosInfolet,
  PurchasingPendingApprovalsInfolet,
  PurchasingPoStatusInfolet,
  PurchasingSupplierRiskInfolet,
  PurchasingTrendsInfolet,
} from "./purchasing_infolets";
import {
  SalesCogsInfolet,
  SalesGrossProfitInfolet,
  SalesRevenueInfolet,
  SalesTransactionsInfolet,
} from "./sales_infolets";

export const PurchasingSalesInfoletRenderer: React.FC<{
  widget: DashboardResolvedWidget;
}> = ({ widget }) => {
  switch (widget.key) {
    case "po_status":
      return <PurchasingPoStatusInfolet data={widget.data} />;
    case "open_po_value":
      return <PurchasingOpenPoValueInfolet data={widget.data} />;
    case "overdue_pos":
      return (
        <PurchasingOverduePosInfolet
          data={widget.data}
          width={widget.layout.width}
        />
      );
    case "pending_approvals":
      return <PurchasingPendingApprovalsInfolet data={widget.data} />;
    case "supplier_risk":
      return (
        <PurchasingSupplierRiskInfolet
          data={widget.data}
          width={widget.layout.width}
        />
      );
    case "purchasing_trends":
      return (
        <PurchasingTrendsInfolet
          data={widget.data}
          width={widget.layout.width}
        />
      );
    case "sales_revenue":
      return <SalesRevenueInfolet data={widget.data} />;
    case "sales_gross_profit":
      return <SalesGrossProfitInfolet data={widget.data} />;
    case "sales_transactions":
      return <SalesTransactionsInfolet data={widget.data} />;
    case "sales_cogs":
      return <SalesCogsInfolet data={widget.data} />;
    default:
      return (
        <GenericInfoletRenderer
          data={widget.data}
          width={widget.layout.width}
        />
      );
  }
};

export default PurchasingSalesInfoletRenderer;
