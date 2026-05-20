import React from "react";
import { GenericInfoletRenderer } from "../GenericInfoletRenderer";
import type { DashboardResolvedWidget } from "../../types/dashboardTypes";
import {
  CostAdverseVariancesInfolet,
  CostProductMarginsInfolet,
  CostVarianceSummaryInfolet,
} from "./costing_infolets";
import {
  FinanceExpensesInfolet,
  FinanceGrossProfitInfolet,
  FinanceNetProfitInfolet,
  FinancePnlSummaryInfolet,
  FinanceRevenueInfolet,
} from "./finance_infolets";

export const CostingFinanceInfoletRenderer: React.FC<{
  widget: DashboardResolvedWidget;
}> = ({ widget }) => {
  switch (widget.key) {
    case "cost_variance_summary":
      return <CostVarianceSummaryInfolet data={widget.data} />;
    case "adverse_variances":
      return (
        <CostAdverseVariancesInfolet
          data={widget.data}
          width={widget.layout.width}
        />
      );
    case "costing_margin":
      return (
        <CostProductMarginsInfolet
          data={widget.data}
          width={widget.layout.width}
        />
      );
    case "finance_revenue":
      return <FinanceRevenueInfolet data={widget.data} />;
    case "finance_gross_profit":
      return <FinanceGrossProfitInfolet data={widget.data} />;
    case "finance_net_profit":
      return <FinanceNetProfitInfolet data={widget.data} />;
    case "finance_expenses":
      return <FinanceExpensesInfolet data={widget.data} />;
    case "finance_pnl":
      return (
        <FinancePnlSummaryInfolet
          data={widget.data}
          width={widget.layout.width}
        />
      );
    default:
      return (
        <GenericInfoletRenderer
          data={widget.data}
          width={widget.layout.width}
        />
      );
  }
};

export default CostingFinanceInfoletRenderer;
