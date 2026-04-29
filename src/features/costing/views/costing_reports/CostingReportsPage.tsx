import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie,
} from 'recharts';
import { TrendingUp, BarChart3, DollarSign, Package, RefreshCw, Download, ChevronDown } from 'lucide-react';
import { costingReportsService } from '../../services/costingReportsService';
import { useProductStore } from '../../../../core/products/stores/productStore';
import { useUserStore } from '../../../auth/stores/userStore';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type {
  CostTrendDataPoint, VarianceAnalysisReport,
  MarginReportItem, IngredientCostBreakdownItem,
} from '../../types/reports_models';
import '../../styles/costing.css';

// ── Palette ───────────────────────────────────────
const P = {
  primary:   '#6366f1',
  secondary: '#a5b4fc',
  green:     '#10b981',
  red:       '#f43f5e',
  amber:     '#f59e0b',
  slate:     '#94a3b8',
  ghost:     '#e2e8f0',
  ghostDark: '#cbd5e1',
  bg:        '#f8fafc',
  PIE: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
  BAR: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'],
};

// ── Formatters ────────────────────────────────────
const fmt = (v: number | string, currency = 'USD') => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(n);
};
const fmtShort = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toFixed(2);
};
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// ── Ghost skeleton chart ──────────────────────────
// Shows a greyed-out chart shape with legend dots when there's no data

const GhostAreaChart: React.FC<{ legend?: string[] }> = ({ legend = ['Cost / Unit'] }) => {
  const ghostPoints = [0.4, 0.55, 0.45, 0.65, 0.5, 0.7, 0.6, 0.8, 0.65, 0.75].map((y, i) => ({ x: i, y }));
  return (
    <div className="rpt-ghost-wrap">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={ghostPoints} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ghostGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={P.ghost} stopOpacity={0.6} />
              <stop offset="95%" stopColor={P.ghost} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={P.ghostDark} strokeWidth={2} fill="url(#ghostGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="rpt-ghost-legend">
        {legend.map((l, i) => (
          <span key={i} className="rpt-ghost-legend__item">
            <span className="rpt-ghost-legend__dot" style={{ background: P.ghost }} />
            {l}
          </span>
        ))}
      </div>
      <div className="rpt-ghost-hint">Select filters above to load data</div>
    </div>
  );
};

const GhostBarChart: React.FC<{ legend?: string[] }> = ({ legend = ['Variance'] }) => {
  const ghostBars = [0.3, 0.6, 0.45, 0.8, 0.5, 0.7, 0.4].map((y, i) => ({ x: i, y }));
  return (
    <div className="rpt-ghost-wrap">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={ghostBars} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barSize={24}>
          <Bar dataKey="y" radius={[4, 4, 0, 0]}>
            {ghostBars.map((_, i) => <Cell key={i} fill={P.ghost} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="rpt-ghost-legend">
        {legend.map((l, i) => (
          <span key={i} className="rpt-ghost-legend__item">
            <span className="rpt-ghost-legend__dot" style={{ background: P.ghost }} />
            {l}
          </span>
        ))}
      </div>
      <div className="rpt-ghost-hint">Select filters above to load data</div>
    </div>
  );
};

const GhostPieChart: React.FC<{ legend?: string[] }> = ({ legend = ['Ingredient A', 'Ingredient B', 'Ingredient C', 'Other'] }) => {
  const ghostSlices = legend.map((_, i) => ({ value: 1 }));
  return (
    <div className="rpt-ghost-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={ghostSlices} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" stroke="none">
              {ghostSlices.map((_, i) => <Cell key={i} fill={P.ghost} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="rpt-ghost-legend rpt-ghost-legend--col">
          {legend.map((l, i) => (
            <span key={i} className="rpt-ghost-legend__item">
              <span className="rpt-ghost-legend__dot" style={{ background: P.ghost }} />
              {l}
            </span>
          ))}
        </div>
      </div>
      <div className="rpt-ghost-hint">Select filters above to load data</div>
    </div>
  );
};

// ── Custom tooltip ────────────────────────────────
const ChartTooltip: React.FC<any> = ({ active, payload, label, currency = 'USD' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rpt-tooltip">
      <div className="rpt-tooltip__label">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="rpt-tooltip__row">
          <span className="rpt-tooltip__dot" style={{ background: p.color }} />
          <span className="rpt-tooltip__name">{p.name}</span>
          <span className="rpt-tooltip__value">{fmt(p.value, currency)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Filter bar ────────────────────────────────────
interface ReportFilters { product_id: string; warehouse_id: string; date_from: string; date_to: string; }

interface FilterBarProps {
  filters: ReportFilters;
  onChange: (f: Partial<ReportFilters>) => void;
  products: { id: string; name: string }[];
  warehouses: { id: string; name: string }[];
  onRefresh: () => void;
  isLoading: boolean;
  showProduct?: boolean;
  showWarehouse?: boolean;
  onExport?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters, onChange, products, warehouses, onRefresh, isLoading,
  showProduct = true, showWarehouse = true, onExport,
}) => (
  <div className="rpt2-filter-bar">
    {showProduct && (
      <div className="rpt2-select-wrap">
        <select value={filters.product_id} onChange={(e) => onChange({ product_id: e.target.value })}>
          <option value="">All products</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <ChevronDown size={13} className="rpt2-select-icon" />
      </div>
    )}
    {showWarehouse && (
      <div className="rpt2-select-wrap">
        <select value={filters.warehouse_id} onChange={(e) => onChange({ warehouse_id: e.target.value })}>
          <option value="">All warehouses</option>
          {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <ChevronDown size={13} className="rpt2-select-icon" />
      </div>
    )}
    <input
      type="date" value={filters.date_from}
      onChange={(e) => onChange({ date_from: e.target.value })}
      className="rpt2-date-input"
    />
    <input
      type="date" value={filters.date_to}
      onChange={(e) => onChange({ date_to: e.target.value })}
      className="rpt2-date-input"
    />
    <button className="rpt2-icon-btn" onClick={onRefresh} disabled={isLoading} type="button" title="Refresh">
      <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
    </button>
    {onExport && (
      <button className="rpt2-icon-btn rpt2-icon-btn--export" onClick={onExport} type="button" title="Export CSV">
        <Download size={14} />
      </button>
    )}
  </div>
);

// ── Report card ───────────────────────────────────
interface ReportCardProps {
  title: string;
  icon: React.ReactNode;
  kpi?: { label: string; value: string; delta?: string; deltaUp?: boolean };
  filterBar: React.ReactNode;
  children: React.ReactNode;
  isLoading: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, icon, kpi, filterBar, children, isLoading }) => (
  <div className="rpt2-card">
    <div className="rpt2-card__top">
      <div className="rpt2-card__title-row">
        <span className="rpt2-card__icon">{icon}</span>
        <span className="rpt2-card__title">{title}</span>
      </div>
      {kpi && (
        <div className="rpt2-card__kpi">
          <div className="rpt2-card__kpi-value">{kpi.value}</div>
          {kpi.delta && (
            <div className={`rpt2-card__kpi-delta ${kpi.deltaUp ? 'rpt2-card__kpi-delta--up' : 'rpt2-card__kpi-delta--down'}`}>
              {kpi.deltaUp ? '▲' : '▼'} {kpi.delta}
            </div>
          )}
          <div className="rpt2-card__kpi-label">{kpi.label}</div>
        </div>
      )}
    </div>
    <div className="rpt2-card__filters">{filterBar}</div>
    <div className="rpt2-card__body">
      {isLoading ? (
        <div className="rpt2-loading"><div className="costing-spinner" /></div>
      ) : children}
    </div>
  </div>
);

// ── CSV export ────────────────────────────────────
const exportCsv = (rows: Record<string, any>[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const defaultFilters = (): ReportFilters => {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
  return { product_id: '', warehouse_id: '', date_from: from, date_to: to };
};

// ── Main ──────────────────────────────────────────
const CostingReportsPage: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const { products, fetchProducts } = useProductStore();
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);

  const [trendF, setTrendF] = useState<ReportFilters>(defaultFilters());
  const [trendData, setTrendData] = useState<CostTrendDataPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const [varF, setVarF] = useState<ReportFilters>(defaultFilters());
  const [varData, setVarData] = useState<VarianceAnalysisReport[]>([]);
  const [varLoading, setVarLoading] = useState(false);

  const [marginF, setMarginF] = useState<ReportFilters>(defaultFilters());
  const [marginData, setMarginData] = useState<MarginReportItem[]>([]);
  const [marginLoading, setMarginLoading] = useState(false);

  const [ingF, setIngF] = useState<ReportFilters>(defaultFilters());
  const [ingData, setIngData] = useState<IngredientCostBreakdownItem[]>([]);
  const [ingLoading, setIngLoading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => {
    const cid = typeof user?.company === 'string' ? user.company : null;
    if (!cid) return;
    warehouseService.getWarehousesByCompany(cid)
      .then((whs) => setWarehouses(whs.map((w) => ({ id: w.id, name: w.name }))))
      .catch(() => {});
  }, [user?.company]);

  const productList = products.map((p) => ({ id: p.id, name: p.name }));

  const loadTrend = useCallback(async () => {
    if (!trendF.product_id) { setTrendData([]); return; }
    setTrendLoading(true);
    try { setTrendData(await costingReportsService.getCostTrend(trendF.product_id, { warehouse_id: trendF.warehouse_id || undefined, limit: 20 })); }
    catch { setTrendData([]); } finally { setTrendLoading(false); }
  }, [trendF]);

  const loadVariance = useCallback(async () => {
    setVarLoading(true);
    try { setVarData(await costingReportsService.getVarianceAnalysis({ product_id: varF.product_id || undefined, warehouse_id: varF.warehouse_id || undefined, date_from: varF.date_from || undefined, date_to: varF.date_to || undefined })); }
    catch { setVarData([]); } finally { setVarLoading(false); }
  }, [varF]);

  const loadMargin = useCallback(async () => {
    setMarginLoading(true);
    try { setMarginData(await costingReportsService.getMarginReport({ product_id: marginF.product_id || undefined })); }
    catch { setMarginData([]); } finally { setMarginLoading(false); }
  }, [marginF]);

  const loadIng = useCallback(async () => {
    setIngLoading(true);
    try { setIngData(await costingReportsService.getIngredientCostBreakdown({ product_id: ingF.product_id || undefined })); }
    catch { setIngData([]); } finally { setIngLoading(false); }
  }, [ingF]);

  useEffect(() => { loadTrend(); }, [loadTrend]);
  useEffect(() => { loadVariance(); }, [loadVariance]);
  useEffect(() => { loadMargin(); }, [loadMargin]);
  useEffect(() => { loadIng(); }, [loadIng]);

  // ── Derived ───────────────────────────────────────

  // Cost trend chart data
  const trendChartData = (Array.isArray(trendData) ? trendData : []).map((d) => ({
    name: d.computed_at ? fmtDate(d.computed_at) : '—',
    'Cost / Unit': parseFloat(d.cost_per_unit) || 0,
    batch: d.batch_number ?? '',
  }));
  const trendKpi = (() => {
    if (!Array.isArray(trendData) || trendData.length < 2) return undefined;
    const first = parseFloat(trendData[0].cost_per_unit) || 0;
    const last = parseFloat(trendData[trendData.length - 1].cost_per_unit) || 0;
    const pct = first > 0 ? Math.abs(((last - first) / first) * 100) : null;
    return {
      label: 'latest cost / unit',
      value: fmt(last),
      delta: pct != null && isFinite(pct) ? `${pct.toFixed(1)}%` : undefined,
      deltaUp: last > first,
    };
  })();

  // Variance bar chart
  const varChartData = (Array.isArray(varData) ? varData : []).slice(0, 8).map((d) => {
    const name = d.product_name ?? d.product_id ?? '—';
    return {
      name: name.length > 12 ? name.slice(0, 12) + '…' : name,
      Favourable: parseFloat(d.total_variance) <= 0 ? Math.abs(parseFloat(d.total_variance) || 0) : 0,
      Adverse: parseFloat(d.total_variance) > 0 ? (parseFloat(d.total_variance) || 0) : 0,
    };
  });

  // Margin bar chart
  const marginChartData = (Array.isArray(marginData) ? marginData : []).slice(0, 8).map((d) => {
    const name = d.product_name ?? d.product_id ?? '—';
    return {
      name: name.length > 12 ? name.slice(0, 12) + '…' : name,
      'Std Cost': parseFloat(d.standard_cost_per_unit) || 0,
      'Rec. Price': parseFloat(d.recommended_selling_price) || 0,
    };
  });

  // Ingredient donut
  const safeIngData = Array.isArray(ingData) ? ingData : [];
  const ingTotal = safeIngData.reduce((s, d) => s + (parseFloat(d.cost_per_unit) || 0), 0);
  const ingPieData = safeIngData
    .map((d) => {
      const raw = d as any;
      // Try every field name the server might use for the ingredient name
      const name: string =
        raw.ingredient_name ??
        raw.product_name ??
        raw.name ??
        raw.ingredient ??
        raw.material_name ??
        raw.item_name ??
        raw.product_id ??
        '—';

      const value = parseFloat(d.cost_per_unit) || 0;

      // Prefer server-computed percentage; fall back to calculating it
      const serverPct = parseFloat(raw.cost_percentage ?? raw.percentage ?? '');
      const pct = isFinite(serverPct) && serverPct > 0
        ? serverPct
        : ingTotal > 0 ? (value / ingTotal) * 100 : 0;

      return { name, value, pct: isFinite(pct) ? pct : 0 };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const ingKpi = ingPieData[0] && ingPieData[0].name !== '—'
    ? {
        label: 'top ingredient',
        value: ingPieData[0].name,
        delta: `${ingPieData[0].pct.toFixed(1)}% of cost`,
        deltaUp: false,
      }
    : undefined;

  return (
    <div className="costing-page">
      <div className="costing-sticky-stack">
        <div className="costing-page-header">
          <div className="costing-page-header__left">
            <h1>Reports & Analytics</h1>
            <p className="costing-page-header__breadcrumb">Costing / Reports & Analytics</p>
          </div>
        </div>
      </div>

      <div className="costing-content">
        <div className="rpt2-grid">

          {/* ── 1. Cost Trend ── */}
          <ReportCard
            title="Cost Trend"
            icon={<TrendingUp size={15} />}
            kpi={trendKpi}
            isLoading={trendLoading}
            filterBar={
              <FilterBar filters={trendF} onChange={(f) => setTrendF((p) => ({ ...p, ...f }))}
                products={productList} warehouses={warehouses} onRefresh={loadTrend} isLoading={trendLoading}
                onExport={() => exportCsv(trendData, 'cost-trend.csv')}
              />
            }
          >
            {trendChartData.length === 0 ? (
              <GhostAreaChart legend={['Cost / Unit']} />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={P.primary} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={P.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: P.slate }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10, fill: P.slate }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="Cost / Unit" stroke={P.primary} strokeWidth={2.5}
                      fill="url(#trendGrad)" dot={{ r: 3, fill: P.primary, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: P.primary }} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="rpt2-legend">
                  <span className="rpt2-legend__item"><span style={{ background: P.primary }} />Cost / Unit</span>
                </div>
              </>
            )}
          </ReportCard>

          {/* ── 2. Variance Analysis ── */}
          <ReportCard
            title="Variance Analysis"
            icon={<BarChart3 size={15} />}
            isLoading={varLoading}
            filterBar={
              <FilterBar filters={varF} onChange={(f) => setVarF((p) => ({ ...p, ...f }))}
                products={productList} warehouses={warehouses} onRefresh={loadVariance} isLoading={varLoading}
                onExport={() => exportCsv(varData, 'variance-analysis.csv')}
              />
            }
          >
            {varChartData.length === 0 ? (
              <GhostBarChart legend={['Favourable', 'Adverse']} />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={varChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barSize={18} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: P.slate }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10, fill: P.slate }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Favourable" fill={P.green} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Adverse" fill={P.red} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="rpt2-legend">
                  <span className="rpt2-legend__item"><span style={{ background: P.green }} />Favourable</span>
                  <span className="rpt2-legend__item"><span style={{ background: P.red }} />Adverse</span>
                </div>
              </>
            )}
          </ReportCard>

          {/* ── 3. Margin Report ── */}
          <ReportCard
            title="Margin Report"
            icon={<DollarSign size={15} />}
            isLoading={marginLoading}
            filterBar={
              <FilterBar filters={marginF} onChange={(f) => setMarginF((p) => ({ ...p, ...f }))}
                products={productList} warehouses={warehouses} onRefresh={loadMargin} isLoading={marginLoading}
                showWarehouse={false} onExport={() => exportCsv(marginData, 'margin-report.csv')}
              />
            }
          >
            {marginChartData.length === 0 ? (
              <GhostBarChart legend={['Std Cost', 'Rec. Price']} />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={marginChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barSize={16} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: P.slate }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10, fill: P.slate }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Std Cost" fill={P.secondary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Rec. Price" fill={P.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="rpt2-legend">
                  <span className="rpt2-legend__item"><span style={{ background: P.secondary }} />Std Cost</span>
                  <span className="rpt2-legend__item"><span style={{ background: P.primary }} />Rec. Price</span>
                </div>
                {/* Margin squeeze alerts */}
                {(Array.isArray(marginData) ? marginData : []).some((d) => {
                  const cost = parseFloat(d.standard_cost_per_unit) || 0;
                  const price = parseFloat(d.recommended_selling_price) || 0;
                  const target = parseFloat(d.target_gross_margin_percentage) || 0;
                  const implied = price > 0 ? ((price - cost) / price) * 100 : 0;
                  return Math.abs(implied - target) > 5;
                }) && (
                  <div className="rpt2-alert">
                    Some products have drifted more than 5% from their target margin — consider recalculating pricing rules.
                  </div>
                )}
              </>
            )}
          </ReportCard>

          {/* ── 4. Ingredient Cost Breakdown ── */}
          <ReportCard
            title="Ingredient Cost Breakdown"
            icon={<Package size={15} />}
            kpi={ingKpi}
            isLoading={ingLoading}
            filterBar={
              <FilterBar filters={ingF} onChange={(f) => setIngF((p) => ({ ...p, ...f }))}
                products={productList} warehouses={warehouses} onRefresh={loadIng} isLoading={ingLoading}
                showWarehouse={false} onExport={() => exportCsv(ingData, 'ingredient-breakdown.csv')}
              />
            }
          >
            {ingPieData.length === 0 ? (
              <GhostPieChart legend={['Ingredient A', 'Ingredient B', 'Ingredient C', 'Other']} />
            ) : (
              <div className="rpt2-donut-wrap">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={ingPieData} cx="50%" cy="50%"
                      innerRadius={52} outerRadius={82}
                      dataKey="value" paddingAngle={2}
                    >
                      {ingPieData.map((_, i) => <Cell key={i} fill={P.PIE[i % P.PIE.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="rpt2-donut-legend">
                  {ingPieData.map((item, i) => (
                    <div key={i} className="rpt2-donut-legend__row">
                      <span className="rpt2-donut-legend__dot" style={{ background: P.PIE[i % P.PIE.length] }} />
                      <span className="rpt2-donut-legend__name">{item.name}</span>
                      <span className="rpt2-donut-legend__pct">{item.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ReportCard>

        </div>
      </div>
    </div>
  );
};

export default CostingReportsPage;
