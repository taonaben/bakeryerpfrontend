import React, { useEffect, useMemo } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  Percent,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCostingOverviewStore } from "../../stores/costingOverviewStore";
import "../../styles/costing.css";
import "../../styles/costing_overview.css";

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

const monthStartIso = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const CostingOverview: React.FC = () => {
  const {
    varianceSummary,
    varianceAnalysis,
    marginReport,
    ingredientBreakdown,
    isLoading,
    error,
    fetchOverview,
    clearError,
  } = useCostingOverviewStore();

  useEffect(() => {
    fetchOverview({ date_from: monthStartIso(), date_to: todayIso() }, true);
  }, [fetchOverview]);

  const topVarianceDrivers = useMemo(() => {
    return [...varianceSummary]
      .sort(
        (a, b) =>
          Math.abs(toNumber(b.total_variance)) -
          Math.abs(toNumber(a.total_variance)),
      )
      .slice(0, 6);
  }, [varianceSummary]);

  const topMarginTargets = useMemo(() => {
    return [...marginReport]
      .sort(
        (a, b) =>
          toNumber(b.target_gross_margin_percentage) -
          toNumber(a.target_gross_margin_percentage),
      )
      .slice(0, 6);
  }, [marginReport]);

  const recentVarianceItems = useMemo(() => {
    return [...varianceAnalysis]
      .sort(
        (a, b) =>
          Math.abs(toNumber(b.total_variance)) -
          Math.abs(toNumber(a.total_variance)),
      )
      .slice(0, 6);
  }, [varianceAnalysis]);

  const kpis = useMemo(() => {
    const totalVariance = varianceSummary.reduce(
      (total, item) => total + toNumber(item.total_variance),
      0,
    );

    const avgVariancePct =
      varianceSummary.length > 0
        ? varianceSummary.reduce(
            (total, item) => total + toNumber(item.avg_variance_percentage),
            0,
          ) / varianceSummary.length
        : 0;

    const adverseBatches = varianceSummary.reduce(
      (total, item) => total + item.adverse_count,
      0,
    );

    return {
      totalVariance,
      avgVariancePct,
      adverseBatches,
      productsWithMarginData: marginReport.length,
      ingredientRows: ingredientBreakdown.length,
    };
  }, [ingredientBreakdown.length, marginReport.length, varianceSummary]);

  return (
    <div className="costing-overview-page">
      <div className="costing-overview-header">
        <div className="costing-overview-header__icon">
          <Calculator size={22} />
        </div>
        <div>
          <h1>Costing Overview</h1>
          <p>Costing / Overview</p>
        </div>
      </div>

      {error && (
        <div className="costing-overview-alert" role="alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      <section className="costing-overview-kpis">
        <article className="costing-overview-kpi">
          <div className="costing-overview-kpi__icon">
            <TrendingUp size={20} />
          </div>
          <div>
            <span>Total Variance</span>
            <strong>
              {isLoading ? "Loading..." : money(kpis.totalVariance)}
            </strong>
            <small>Summary groups combined</small>
          </div>
        </article>
        <article className="costing-overview-kpi">
          <div className="costing-overview-kpi__icon">
            <Percent size={20} />
          </div>
          <div>
            <span>Average Variance %</span>
            <strong>
              {isLoading ? "Loading..." : pct(kpis.avgVariancePct)}
            </strong>
            <small>Across summary groups</small>
          </div>
        </article>
        <article className="costing-overview-kpi">
          <div className="costing-overview-kpi__icon">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span>Adverse Batches</span>
            <strong>{isLoading ? "Loading..." : kpis.adverseBatches}</strong>
            <small>Requires corrective action</small>
          </div>
        </article>
        <article className="costing-overview-kpi">
          <div className="costing-overview-kpi__icon">
            <BarChart3 size={20} />
          </div>
          <div>
            <span>Products With Margin Targets</span>
            <strong>
              {isLoading ? "Loading..." : kpis.productsWithMarginData}
            </strong>
            <small>{kpis.ingredientRows} ingredient rows loaded</small>
          </div>
        </article>
      </section>

      <div className="costing-overview-grid">
        <section className="costing-overview-panel">
          <div className="costing-overview-panel__head">
            <h2>
              <TrendingUp size={16} /> Top Variance Drivers
            </h2>
            <Link to="/costing/variance-analysis">Open variance analysis</Link>
          </div>
          <table className="costing-overview-table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Total Variance</th>
                <th>Avg Variance %</th>
              </tr>
            </thead>
            <tbody>
              {topVarianceDrivers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="costing-overview-empty">
                    No variance summary data
                  </td>
                </tr>
              ) : (
                topVarianceDrivers.map((item) => (
                  <tr key={`${item.group_by}-${item.group_id}`}>
                    <td>{item.group_name}</td>
                    <td>{money(toNumber(item.total_variance))}</td>
                    <td>{pct(toNumber(item.avg_variance_percentage))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="costing-overview-panel">
          <div className="costing-overview-panel__head">
            <h2>
              <Percent size={16} /> Margin Snapshot
            </h2>
            <Link to="/costing/reports">Open reports</Link>
          </div>
          <table className="costing-overview-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Target Margin</th>
                <th>Recommended Price</th>
              </tr>
            </thead>
            <tbody>
              {topMarginTargets.length === 0 ? (
                <tr>
                  <td colSpan={3} className="costing-overview-empty">
                    No margin report data
                  </td>
                </tr>
              ) : (
                topMarginTargets.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_name}</td>
                    <td>
                      {pct(toNumber(item.target_gross_margin_percentage))}
                    </td>
                    <td>{money(toNumber(item.recommended_selling_price))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="costing-overview-panel">
          <div className="costing-overview-panel__head">
            <h2>
              <BarChart3 size={16} /> Variance Analysis Highlights
            </h2>
            <Link to="/costing/variance-analysis">Investigate</Link>
          </div>
          <table className="costing-overview-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Total Variance</th>
              </tr>
            </thead>
            <tbody>
              {recentVarianceItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="costing-overview-empty">
                    No variance analysis data
                  </td>
                </tr>
              ) : (
                recentVarianceItems.map((item) => (
                  <tr key={`${item.product_id}-${item.warehouse_id}`}>
                    <td>{item.product_name}</td>
                    <td>{item.warehouse_name}</td>
                    <td>{money(toNumber(item.total_variance))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="costing-overview-panel">
          <div className="costing-overview-panel__head">
            <h2>
              <Calculator size={16} /> Quick Actions
            </h2>
          </div>
          <div className="costing-overview-actions">
            <Link to="/costing/entries">Open Costing Entries</Link>
            <Link to="/costing/standard-costs">Open Standard Costs</Link>
            <Link to="/costing/overhead-rates">Open Overhead Rates</Link>
            <Link to="/costing/product-costing">Open Product Costing</Link>
            <Link to="/costing/pricing-rules">Open Pricing Rules</Link>
            <Link to="/costing/reports">Open Reports</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CostingOverview;
