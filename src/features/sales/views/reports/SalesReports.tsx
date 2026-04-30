import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  RefreshCw, Download, ChevronDown,
  TrendingUp, Package, Warehouse,
} from 'lucide-react';
import { reportsApi } from '../../api/reports_client';
import { useUserStore } from '../../../auth/stores/userStore';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type {
  DailySummary,
  RevenueByProduct,
  MarginByProduct,
  SalesByWarehouse,
} from '../../types/reports_models';
import '../../../costing/styles/costing.css';
import '../../styles/sales.css';

// ── Palette (matches costing reports) ────────────
const P = {
  primary:   '#566d7e',
  secondary: '#8fa8b8',
  green:     '#10b981',
  amber:     '#f59e0b',
  slate:     '#94a3b8',
  ghost:     '#e2e8f0',
  ghostDark: '#cbd5e1',
  BAR: ['#566d7e', '#7a9aac', '#9db8c6', '#c0d5de', '#ddeaf0'],
};

// ── Formatters ────────────────────────────────────
const fmt = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
};
const fmtShort = (v: number) =>
  Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;
const fmtPct = (v: string | number | null) => {
  if (v === null || v === undefined) return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? '—' : `${n.toFixed(1)}%`;
};
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

// ── Ghost charts ──────────────────────────────────
const GhostBarChart: React.FC<{ legend?: string[] }> = ({ legend = ['Revenue'] }) => {
  const bars = [0.4, 0.7, 0.5, 0.85, 0.6, 0.75, 0.45].map((y, i) => ({ x: i, y }));
  return (
    <div className="rpt-ghost-wrap">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={bars} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barSize={24}>
          <Bar dataKey="y" radius={[4, 4, 0, 0]}>
            {bars.map((_, i) => <Cell key={i} fill={P.ghost} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="rpt-ghost-legend">
        {legend.map((l, i) => (
          <span key={i} className="rpt-ghost-legend__item">
            <span className="rpt-ghost-legend__dot" style={{ background: P.ghost }} />{l}
          </span>
        ))}
      </div>
      <div className="rpt-ghost-hint">Select a date range above to load data</div>
    </div>
  );
};

// ── Custom tooltip ────────────────────────────────
const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rpt-tooltip">
      <div className="rpt-tooltip__label">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="rpt-tooltip__row">
          <span className="rpt-tooltip__dot" style={{ background: p.color }} />
          <span className="rpt-tooltip__name">{p.name}</span>
          <span className="rpt-tooltip__value">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Shared filter bar ─────────────────────────────
interface Filters { date_from: string; date_to: string; warehouse_id: string; }

interface FilterBarProps {
  filters: Filters;
  warehouses: { id: string; name: string }[];
  onChange: (f: Partial<Filters>) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onExport?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters, warehouses, onChange, onRefresh, isLoading, onExport,
}) => (
  <div className="rpt2-filter-bar">
    <div className="rpt2-select-wrap">
      <select
        value={filters.warehouse_id}
        onChange={(e) => onChange({ warehouse_id: e.target.value })}
      >
        <option value="">All warehouses</option>
        {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
      <ChevronDown size={13} className="rpt2-select-icon" />
    </div>
    <input
      type="date" value={filters.date_from}
      onChange={(e) => onChange({ date_from: e.target.value })}
      className="rpt2-date-input"
    />
    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>to</span>
    <input
      type="date" value={filters.date_to}
      onChange={(e) => onChange({ date_to: e.target.value })}
      className="rpt2-date-input"
    />
    <button
      className="rpt2-icon-btn" onClick={onRefresh}
      disabled={isLoading} type="button" title="Refresh"
    >
      <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
    </button>
    {onExport && (
      <button
        className="rpt2-icon-btn rpt2-icon-btn--export"
        onClick={onExport} type="button" title="Export CSV"
      >
        <Download size={14} />
      </button>
    )}
  </div>
);

// ── CSV export ────────────────────────────────────
const exportCsv = (rows: Record<string, any>[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ── Default date range: last 30 days ─────────────
const defaultFilters = (): Filters => {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  return { date_from: from, date_to: to, warehouse_id: '' };
};

// ══════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════
const SalesReportsPage: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters());

  // Section data
  const [dailyData, setDailyData] = useState<DailySummary[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);

  const [revenueData, setRevenueData] = useState<RevenueByProduct[]>([]);
  const [marginData, setMarginData] = useState<MarginByProduct[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);

  const [warehouseData, setWarehouseData] = useState<SalesByWarehouse[]>([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);

  // Load warehouses
  useEffect(() => {
    const cid = typeof user?.company === 'string' ? user.company : null;
    if (!cid) return;
    warehouseService.getWarehousesByCompany(cid)
      .then((whs) => setWarehouses(whs.map((w) => ({ id: w.id, name: w.name }))))
      .catch(() => {});
  }, [user?.company]);

  const params = {
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    warehouse_id: filters.warehouse_id || undefined,
  };

  // ── Loaders ───────────────────────────────────────
  const loadDaily = useCallback(async () => {
    setDailyLoading(true);
    try {
      // getDailySummary returns a single object; we need to iterate over the date range
      // The API accepts a single date — we call it for each day in range
      const from = new Date(filters.date_from);
      const to = new Date(filters.date_to);
      const days: DailySummary[] = [];
      const cur = new Date(from);
      while (cur <= to) {
        try {
          const result = await reportsApi.getDailySummary({
            date: cur.toISOString().slice(0, 10),
            warehouse_id: filters.warehouse_id || undefined,
          });
          if (result) days.push(result);
        } catch { /* skip days with no data */ }
        cur.setDate(cur.getDate() + 1);
      }
      setDailyData(days);
    } catch { setDailyData([]); }
    finally { setDailyLoading(false); }
  }, [filters]);

  const loadRevenue = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const [rev, margin] = await Promise.all([
        reportsApi.getRevenueByProduct(params),
        reportsApi.getMarginByProduct(params),
      ]);
      setRevenueData(Array.isArray(rev) ? rev : (rev as any)?.results ?? []);
      setMarginData(Array.isArray(margin) ? margin : (margin as any)?.results ?? []);
    } catch { setRevenueData([]); setMarginData([]); }
    finally { setRevenueLoading(false); }
  }, [filters]);

  const loadWarehouse = useCallback(async () => {
    setWarehouseLoading(true);
    try {
      const data = await reportsApi.getSalesByWarehouse(params);
      setWarehouseData(Array.isArray(data) ? data : (data as any)?.results ?? []);
    } catch { setWarehouseData([]); }
    finally { setWarehouseLoading(false); }
  }, [filters]);

  const loadAll = useCallback(() => {
    loadDaily();
    loadRevenue();
    loadWarehouse();
  }, [loadDaily, loadRevenue, loadWarehouse]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const updateFilters = (f: Partial<Filters>) => setFilters((p) => ({ ...p, ...f }));

  // ── Derived chart data ────────────────────────────

  // Daily bar chart — revenue per day
  const dailyChartData = dailyData.map((d) => ({
    name: fmtDate(d.date),
    Revenue: parseFloat(d.total_revenue) || 0,
    'Gross Profit': parseFloat(d.gross_profit) || 0,
  }));

  // Revenue by product — sorted descending, top 10
  const revenueChartData = [...revenueData]
    .sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue))
    .slice(0, 10)
    .map((d) => ({
      name: d.product_name.length > 18 ? d.product_name.slice(0, 18) + '…' : d.product_name,
      Revenue: parseFloat(d.total_revenue) || 0,
    }));

  // Merge revenue + margin for the product table
  const productTableData = revenueData.map((r) => {
    const m = marginData.find((x) => x.product_id === r.product_id);
    return {
      product_name: r.product_name,
      units_sold: parseFloat(r.total_quantity_sold) || 0,
      revenue: parseFloat(r.total_revenue) || 0,
      cogs: m ? parseFloat(m.total_cogs) || 0 : null,
      gross_profit: m ? parseFloat(m.gross_profit) || 0 : null,
      margin_pct: m?.margin_percentage ?? null,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Daily totals for KPI strip
  const totalRevenue = dailyData.reduce((s, d) => s + (parseFloat(d.total_revenue) || 0), 0);
  const totalProfit = dailyData.reduce((s, d) => s + (parseFloat(d.gross_profit) || 0), 0);
  const totalTx = dailyData.reduce((s, d) => s + (d.total_transactions || 0), 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="costing-page">
      <div className="costing-sticky-stack">
        <div className="costing-page-header">
          <div className="costing-page-header__left">
            <h1>Sales Reports</h1>
            <p className="costing-page-header__breadcrumb">Sales / Reports</p>
          </div>
        </div>

        {/* ── Shared filter bar ── */}
        <div className="costing-toolbar" style={{ padding: '10px 20px' }}>
          <FilterBar
            filters={filters}
            warehouses={warehouses}
            onChange={updateFilters}
            onRefresh={loadAll}
            isLoading={dailyLoading || revenueLoading || warehouseLoading}
          />
        </div>
      </div>

      <div className="costing-content">

        {/* ── KPI strip ── */}
        <div className="sr-kpi-strip">
          <div className="sr-kpi">
            <span className="sr-kpi__label">Total Revenue</span>
            <span className="sr-kpi__value">{fmt(totalRevenue)}</span>
          </div>
          <div className="sr-kpi">
            <span className="sr-kpi__label">Gross Profit</span>
            <span className="sr-kpi__value" style={{ color: P.green }}>{fmt(totalProfit)}</span>
          </div>
          <div className="sr-kpi">
            <span className="sr-kpi__label">Avg Gross Margin</span>
            <span className="sr-kpi__value">{fmtPct(avgMargin)}</span>
          </div>
          <div className="sr-kpi">
            <span className="sr-kpi__label">Transactions</span>
            <span className="sr-kpi__value">{totalTx.toLocaleString()}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 1 — Daily Summary
        ══════════════════════════════════════════ */}
        <div className="sr-section">
          <div className="sr-section__header">
            <div className="sr-section__title-row">
              <TrendingUp size={16} />
              <h2>Daily Summary</h2>
            </div>
            <button
              className="rpt2-icon-btn rpt2-icon-btn--export"
              onClick={() => exportCsv(dailyData, 'daily-summary.csv')}
              type="button" title="Export CSV"
            >
              <Download size={14} />
            </button>
          </div>

          {/* Bar chart */}
          <div className="rpt2-card" style={{ marginBottom: 16 }}>
            <div className="rpt2-card__body">
              {dailyLoading ? (
                <div className="rpt2-loading"><div className="costing-spinner" /></div>
              ) : dailyChartData.length === 0 ? (
                <GhostBarChart legend={['Revenue', 'Gross Profit']} />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barSize={14} barGap={3}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: P.slate }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10, fill: P.slate }} axisLine={false} tickLine={false} width={52} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="Revenue" fill={P.primary} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Gross Profit" fill={P.green} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="rpt2-legend">
                    <span className="rpt2-legend__item"><span style={{ background: P.primary }} />Revenue</span>
                    <span className="rpt2-legend__item"><span style={{ background: P.green }} />Gross Profit</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Daily table */}
          {!dailyLoading && dailyData.length > 0 && (
            <div className="sales-table-container">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Transactions</th>
                    <th style={{ textAlign: 'right' }}>Revenue</th>
                    <th style={{ textAlign: 'right' }}>COGS</th>
                    <th style={{ textAlign: 'right' }}>Gross Profit</th>
                    <th style={{ textAlign: 'right' }}>Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.map((d) => {
                    const rev = parseFloat(d.total_revenue) || 0;
                    const profit = parseFloat(d.gross_profit) || 0;
                    const margin = rev > 0 ? (profit / rev) * 100 : null;
                    return (
                      <tr key={d.date}>
                        <td style={{ fontWeight: 500 }}>{fmtDate(d.date)}</td>
                        <td className="table-amount">{d.total_transactions}</td>
                        <td className="table-amount">{fmt(d.total_revenue)}</td>
                        <td className="table-amount">{fmt(d.total_cogs)}</td>
                        <td className="table-amount" style={{ color: profit >= 0 ? P.green : '#ef4444' }}>
                          {fmt(profit)}
                        </td>
                        <td className="table-amount">
                          <span className={`sr-margin-badge ${margin !== null && margin < 20 ? 'low' : ''}`}>
                            {fmtPct(margin)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            SECTION 2 — Revenue by Product
        ══════════════════════════════════════════ */}
        <div className="sr-section">
          <div className="sr-section__header">
            <div className="sr-section__title-row">
              <Package size={16} />
              <h2>Revenue by Product</h2>
            </div>
            <button
              className="rpt2-icon-btn rpt2-icon-btn--export"
              onClick={() => exportCsv(productTableData, 'revenue-by-product.csv')}
              type="button" title="Export CSV"
            >
              <Download size={14} />
            </button>
          </div>

          {/* Horizontal bar chart */}
          <div className="rpt2-card" style={{ marginBottom: 16 }}>
            <div className="rpt2-card__body">
              {revenueLoading ? (
                <div className="rpt2-loading"><div className="costing-spinner" /></div>
              ) : revenueChartData.length === 0 ? (
                <GhostBarChart legend={['Revenue']} />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={Math.max(200, revenueChartData.length * 36)}>
                    <BarChart
                      data={revenueChartData}
                      layout="vertical"
                      margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                      barSize={18}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tickFormatter={fmtShort} tick={{ fontSize: 10, fill: P.slate }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="Revenue" radius={[0, 4, 4, 0]}>
                        {revenueChartData.map((_, i) => (
                          <Cell key={i} fill={P.BAR[i % P.BAR.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>

          {/* Product table */}
          {!revenueLoading && productTableData.length > 0 && (
            <div className="sales-table-container">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>Units Sold</th>
                    <th style={{ textAlign: 'right' }}>Revenue</th>
                    <th style={{ textAlign: 'right' }}>COGS</th>
                    <th style={{ textAlign: 'right' }}>Gross Profit</th>
                    <th style={{ textAlign: 'right' }}>Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {productTableData.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{p.product_name}</td>
                      <td className="table-amount">{p.units_sold.toLocaleString()}</td>
                      <td className="table-amount">{fmt(p.revenue)}</td>
                      <td className="table-amount">{p.cogs !== null ? fmt(p.cogs) : '—'}</td>
                      <td className="table-amount" style={{ color: p.gross_profit !== null && p.gross_profit >= 0 ? P.green : '#ef4444' }}>
                        {p.gross_profit !== null ? fmt(p.gross_profit) : '—'}
                      </td>
                      <td className="table-amount">
                        <span className={`sr-margin-badge ${p.margin_pct !== null && parseFloat(String(p.margin_pct)) < 20 ? 'low' : ''}`}>
                          {fmtPct(p.margin_pct)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            SECTION 3 — Sales by Warehouse
        ══════════════════════════════════════════ */}
        <div className="sr-section">
          <div className="sr-section__header">
            <div className="sr-section__title-row">
              <Warehouse size={16} />
              <h2>Sales by Warehouse</h2>
            </div>
            <button
              className="rpt2-icon-btn rpt2-icon-btn--export"
              onClick={() => exportCsv(warehouseData, 'sales-by-warehouse.csv')}
              type="button" title="Export CSV"
            >
              <Download size={14} />
            </button>
          </div>

          {warehouseLoading ? (
            <div className="rpt2-loading" style={{ padding: 40 }}><div className="costing-spinner" /></div>
          ) : warehouseData.length === 0 ? (
            <div className="empty-state-card">
              <Warehouse size={32} style={{ marginBottom: 10, color: '#94a3b8' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No warehouse data for this period</p>
            </div>
          ) : (
            <div className="sales-table-container">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Warehouse</th>
                    <th style={{ textAlign: 'right' }}>Orders</th>
                    <th style={{ textAlign: 'right' }}>Revenue</th>
                    <th style={{ textAlign: 'right' }}>COGS</th>
                    <th style={{ textAlign: 'right' }}>Gross Profit</th>
                    <th style={{ textAlign: 'right' }}>Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseData.map((w) => {
                    const rev = parseFloat(w.total_revenue) || 0;
                    const avg = w.total_orders > 0 ? rev / w.total_orders : 0;
                    const profit = parseFloat(w.gross_profit) || 0;
                    return (
                      <tr key={w.warehouse_id}>
                        <td style={{ fontWeight: 600 }}>{w.warehouse_name}</td>
                        <td className="table-amount">{w.total_orders.toLocaleString()}</td>
                        <td className="table-amount">{fmt(rev)}</td>
                        <td className="table-amount">{fmt(w.total_cogs)}</td>
                        <td className="table-amount" style={{ color: profit >= 0 ? P.green : '#ef4444' }}>
                          {fmt(profit)}
                        </td>
                        <td className="table-amount">{fmt(avg)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                {warehouseData.length > 1 && (
                  <tfoot>
                    <tr style={{ fontWeight: 700 }}>
                      <td>Total</td>
                      <td className="table-amount">
                        {warehouseData.reduce((s, w) => s + w.total_orders, 0).toLocaleString()}
                      </td>
                      <td className="table-amount">
                        {fmt(warehouseData.reduce((s, w) => s + (parseFloat(w.total_revenue) || 0), 0))}
                      </td>
                      <td className="table-amount">
                        {fmt(warehouseData.reduce((s, w) => s + (parseFloat(w.total_cogs) || 0), 0))}
                      </td>
                      <td className="table-amount">
                        {fmt(warehouseData.reduce((s, w) => s + (parseFloat(w.gross_profit) || 0), 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SalesReportsPage;
