import React, { useEffect, useMemo } from "react";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Receipt,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSalesOverviewStore } from "../../stores/salesOverviewStore";
import "../../styles/sales.css";
import "../../styles/sales_overview.css";

interface SalesOverviewProps {
  activeWarehouse?: { id: string; name: string };
}

const toNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const money = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const pct = (value: number): string => `${value.toFixed(1)}%`;

const startOfMonthIso = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const SalesOverview: React.FC<SalesOverviewProps> = ({ activeWarehouse }) => {
  const {
    dailySummary,
    revenueByProduct,
    marginByProduct,
    outstandingDebtors,
    salesByWarehouse,
    isLoading,
    error,
    fetchOverview,
    clearError,
  } = useSalesOverviewStore();

  useEffect(() => {
    fetchOverview(
      {
        warehouse_id: activeWarehouse?.id,
        date_from: startOfMonthIso(),
        date_to: todayIso(),
        date: todayIso(),
      },
      true,
    );
  }, [activeWarehouse?.id, fetchOverview]);

  const marginByProductId = useMemo(() => {
    return marginByProduct.reduce<Record<string, number>>((acc, item) => {
      acc[item.product_id] = toNumber(item.margin_percentage);
      return acc;
    }, {});
  }, [marginByProduct]);

  const topProducts = useMemo(() => {
    return [...revenueByProduct]
      .sort((a, b) => toNumber(b.total_revenue) - toNumber(a.total_revenue))
      .slice(0, 6)
      .map((item) => ({
        ...item,
        marginPercentage: marginByProductId[item.product_id] ?? 0,
      }));
  }, [marginByProductId, revenueByProduct]);

  const topWarehouses = useMemo(() => {
    return [...salesByWarehouse]
      .sort((a, b) => toNumber(b.total_revenue) - toNumber(a.total_revenue))
      .slice(0, 6);
  }, [salesByWarehouse]);

  const topDebtors = useMemo(() => {
    return [...outstandingDebtors]
      .sort(
        (a, b) =>
          toNumber(b.outstanding_balance) - toNumber(a.outstanding_balance),
      )
      .slice(0, 6);
  }, [outstandingDebtors]);

  const kpis = useMemo(() => {
    const todayRevenue = toNumber(dailySummary?.total_revenue);
    const todayProfit = toNumber(dailySummary?.gross_profit);
    const todayMargin =
      todayRevenue > 0 ? (todayProfit / todayRevenue) * 100 : 0;

    const outstandingTotal = outstandingDebtors.reduce(
      (total, debtor) => total + toNumber(debtor.outstanding_balance),
      0,
    );

    return {
      todayRevenue,
      todayMargin,
      outstandingTotal,
      activeWarehouses: salesByWarehouse.length,
    };
  }, [dailySummary, outstandingDebtors, salesByWarehouse.length]);

  return (
    <div className="sales-overview-page">
      <div className="sales-overview-header">
        <div className="sales-overview-header__icon">
          <ShoppingCart size={22} />
        </div>
        <div>
          <h1>Sales Overview</h1>
          <p>
            Sales / Overview
            {activeWarehouse?.name ? ` / ${activeWarehouse.name}` : ""}
          </p>
        </div>
      </div>

      {error && (
        <div className="sales-overview-alert" role="alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      <section className="sales-overview-kpis">
        <article className="sales-overview-kpi">
          <div className="sales-overview-kpi__icon">
            <BarChart3 size={20} />
          </div>
          <div>
            <span>Today Revenue</span>
            <strong>
              {isLoading ? "Loading..." : money(kpis.todayRevenue)}
            </strong>
            <small>From daily summary</small>
          </div>
        </article>
        <article className="sales-overview-kpi">
          <div className="sales-overview-kpi__icon">
            <Wallet size={20} />
          </div>
          <div>
            <span>Today Gross Margin</span>
            <strong>{isLoading ? "Loading..." : pct(kpis.todayMargin)}</strong>
            <small>Profit / Revenue</small>
          </div>
        </article>
        <article className="sales-overview-kpi">
          <div className="sales-overview-kpi__icon">
            <Receipt size={20} />
          </div>
          <div>
            <span>Outstanding Debtors</span>
            <strong>
              {isLoading ? "Loading..." : money(kpis.outstandingTotal)}
            </strong>
            <small>{topDebtors.length} key accounts shown</small>
          </div>
        </article>
        <article className="sales-overview-kpi">
          <div className="sales-overview-kpi__icon">
            <ClipboardList size={20} />
          </div>
          <div>
            <span>Warehouses With Sales</span>
            <strong>{isLoading ? "Loading..." : kpis.activeWarehouses}</strong>
            <small>Current filter context</small>
          </div>
        </article>
      </section>

      <div className="sales-overview-grid">
        <section className="sales-overview-panel">
          <div className="sales-overview-panel__head">
            <h2>
              <BarChart3 size={16} /> Top Products by Revenue
            </h2>
            <Link to="/sales/reports">Open reports</Link>
          </div>
          <table className="sales-overview-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Revenue</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="sales-overview-empty">
                    No product revenue data
                  </td>
                </tr>
              ) : (
                topProducts.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_name}</td>
                    <td>{money(toNumber(item.total_revenue))}</td>
                    <td>{pct(item.marginPercentage)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="sales-overview-panel">
          <div className="sales-overview-panel__head">
            <h2>
              <Wallet size={16} /> Outstanding Debtors
            </h2>
            <Link to="/sales/debtors">Open debtors</Link>
          </div>
          <table className="sales-overview-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Outstanding</th>
                <th>Overdue</th>
              </tr>
            </thead>
            <tbody>
              {topDebtors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="sales-overview-empty">
                    No debtor balances
                  </td>
                </tr>
              ) : (
                topDebtors.map((item) => (
                  <tr key={item.customer_id}>
                    <td>{item.customer_name}</td>
                    <td>{money(toNumber(item.outstanding_balance))}</td>
                    <td>
                      {item.days_overdue
                        ? `${item.days_overdue} days`
                        : "Current"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="sales-overview-panel">
          <div className="sales-overview-panel__head">
            <h2>
              <Users size={16} /> Warehouse Performance
            </h2>
            <Link to="/sales/reports">View distribution</Link>
          </div>
          <table className="sales-overview-table">
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={3} className="sales-overview-empty">
                    No warehouse sales data
                  </td>
                </tr>
              ) : (
                topWarehouses.map((item) => (
                  <tr key={item.warehouse_id}>
                    <td>{item.warehouse_name}</td>
                    <td>{item.total_orders}</td>
                    <td>{money(toNumber(item.total_revenue))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="sales-overview-panel">
          <div className="sales-overview-panel__head">
            <h2>
              <ClipboardList size={16} /> Quick Actions
            </h2>
          </div>
          <div className="sales-overview-actions">
            <Link to="/sales/orders">Open Sales Orders</Link>
            <Link to="/sales/invoices">Open Invoices</Link>
            <Link to="/sales/payments">Open Payments</Link>
            <Link to="/sales/customers">Open Customers</Link>
            <Link to="/sales/reports">Open Reports</Link>
            <Link to="/sales/orders/new">Create Sales Order</Link>
          </div>
          <div className="sales-overview-note">
            <Receipt size={15} />
            <span>
              This overview uses existing Sales report endpoints only.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalesOverview;
