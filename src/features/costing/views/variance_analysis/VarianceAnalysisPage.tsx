import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Search, AlertCircle,
  Package, Warehouse, Calendar, Filter,
} from 'lucide-react';
import { useVariancesStore } from '../../stores/variancesStore';
import useVarianceFilters from '../../hooks/useVarianceFilters';
import type { Variance } from '../../types/variances_models';
import '../../styles/costing.css';

// ── Formatters ────────────────────────────────────

const fmt = (v: string | number, currency = 'USD') => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 2, maximumFractionDigits: 4,
  }).format(n);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtPct = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
};

const fmtAmt = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return `${n >= 0 ? '+' : ''}${Math.abs(n).toFixed(2)}`;
};

// ── Inline sparkline (SVG) ────────────────────────

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ values, width = 80, height = 24 }) => {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lastVal = values[values.length - 1];
  const color = lastVal <= 0 ? '#10b981' : '#ef4444';
  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
};

// ── KPI Card ──────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: 'green' | 'red' | 'neutral' | 'blue';
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, color = 'neutral', icon }) => {
  const colors = {
    green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#065f46', iconBg: '#dcfce7' },
    red:   { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', iconBg: '#fee2e2' },
    blue:  { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', iconBg: '#dbeafe' },
    neutral: { bg: '#f8fafc', border: '#e2e8f0', text: '#1e293b', iconBg: '#f1f5f9' },
  };
  const c = colors[color];
  return (
    <div className="va-kpi-card" style={{ background: c.bg, borderColor: c.border }}>
      <div className="va-kpi-card__icon" style={{ background: c.iconBg, color: c.text }}>
        {icon}
      </div>
      <div className="va-kpi-card__body">
        <div className="va-kpi-card__label">{label}</div>
        <div className="va-kpi-card__value" style={{ color: c.text }}>{value}</div>
        {sub && <div className="va-kpi-card__sub">{sub}</div>}
      </div>
    </div>
  );
};

// ── Variance row sparkline data ───────────────────
// Group variances by product to build per-product trend lines
const buildSparklines = (items: Variance[]): Record<string, number[]> => {
  const map: Record<string, { at: string; val: number }[]> = {};
  for (const v of items) {
    if (!map[v.product]) map[v.product] = [];
    map[v.product].push({ at: v.computed_at, val: parseFloat(v.total_variance) || 0 });
  }
  const result: Record<string, number[]> = {};
  for (const [pid, entries] of Object.entries(map)) {
    result[pid] = entries
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((e) => e.val);
  }
  return result;
};

// ── Main page ─────────────────────────────────────

const FAVOUR_TABS = [
  { label: 'All', value: '' },
  { label: 'Favourable', value: 'true' },
  { label: 'Adverse', value: 'false' },
];

const VarianceAnalysisPage: React.FC = () => {
  const { items, isLoading, error, totalPages, fetchAll } = useVariancesStore();
  const filters = useVarianceFilters();

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favourFilter, setFavourFilter] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => filters.setFilter('search', searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(() => {
    fetchAll(filters.getApiParams(), true);
  }, [filters.filters]);

  useEffect(() => { load(); }, [load]);

  // KPI derivations from current page
  const totalFav = items
    .filter((v) => v.is_favourable)
    .reduce((s, v) => s + Math.abs(parseFloat(v.total_variance) || 0), 0);

  const totalAdv = items
    .filter((v) => !v.is_favourable)
    .reduce((s, v) => s + Math.abs(parseFloat(v.total_variance) || 0), 0);

  const worstProduct = (() => {
    const map: Record<string, { name: string; total: number }> = {};
    for (const v of items) {
      if (!map[v.product]) map[v.product] = { name: v.product_name, total: 0 };
      if (!v.is_favourable) map[v.product].total += Math.abs(parseFloat(v.total_variance) || 0);
    }
    const sorted = Object.values(map).sort((a, b) => b.total - a.total);
    return sorted[0] ?? null;
  })();

  const sparklines = buildSparklines(items);

  const handleFavourChange = (val: string) => {
    setFavourFilter(val);
    if (val === '') filters.setFilter('is_favourable', undefined);
    else filters.setFilter('is_favourable', val === 'true');
  };

  return (
    <div className="costing-page">
      <div className="costing-sticky-stack">
        <div className="costing-page-header">
          <div className="costing-page-header__left">
            <h1>Variance Analysis</h1>
            <p className="costing-page-header__breadcrumb">Costing / Variance Analysis</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="costing-toolbar">
          <div className="costing-toolbar__left">
            <div className="status-tabs">
              {FAVOUR_TABS.map((tab) => (
                <button
                  key={tab.value}
                  className={`status-tab${favourFilter === tab.value ? ' active' : ''}`}
                  onClick={() => handleFavourChange(tab.value)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="costing-toolbar__right">
            <button
              className={`va-filter-btn${showFilters ? ' va-filter-btn--active' : ''}`}
              onClick={() => setShowFilters((v) => !v)}
              type="button"
            >
              <Filter size={14} />
              Filters
            </button>
            <div className="search-bar">
              <Search size={15} color="#64748b" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search product, batch…"
                aria-label="Search variances"
              />
            </div>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="va-filter-panel">
            <div className="va-filter-panel__field">
              <label><Warehouse size={13} /> Warehouse ID</label>
              <input
                type="text"
                placeholder="Warehouse UUID…"
                value={filters.filters.warehouse_id ?? ''}
                onChange={(e) => filters.setFilter('warehouse_id', e.target.value)}
              />
            </div>
            <div className="va-filter-panel__field">
              <label><Package size={13} /> Product ID</label>
              <input
                type="text"
                placeholder="Product UUID…"
                value={filters.filters.product_id ?? ''}
                onChange={(e) => filters.setFilter('product_id', e.target.value)}
              />
            </div>
            <div className="va-filter-panel__field">
              <label><Calendar size={13} /> From</label>
              <input
                type="date"
                value={filters.filters.date_from ?? ''}
                onChange={(e) => filters.setFilter('date_from', e.target.value)}
              />
            </div>
            <div className="va-filter-panel__field">
              <label><Calendar size={13} /> To</label>
              <input
                type="date"
                value={filters.filters.date_to ?? ''}
                onChange={(e) => filters.setFilter('date_to', e.target.value)}
              />
            </div>
            <button
              className="va-filter-clear"
              onClick={() => { filters.clearFilters(); setFavourFilter(''); setSearchInput(''); }}
              type="button"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="costing-content">
        {error && (
          <div className="costing-error-banner" style={{ marginBottom: '0.75rem' }}>
            <AlertCircle size={18} />{error}
            <button onClick={load} type="button">Retry</button>
          </div>
        )}

        {/* KPI cards */}
        {!isLoading && items.length > 0 && (
          <div className="va-kpi-row">
            <KpiCard
              label="Favourable Variance"
              value={`+${totalFav.toFixed(2)}`}
              sub={`${items.filter((v) => v.is_favourable).length} batches`}
              color="green"
              icon={<TrendingDown size={18} />}
            />
            <KpiCard
              label="Adverse Variance"
              value={`-${totalAdv.toFixed(2)}`}
              sub={`${items.filter((v) => !v.is_favourable).length} batches`}
              color="red"
              icon={<TrendingUp size={18} />}
            />
            <KpiCard
              label="Most Over-Budget"
              value={worstProduct?.name ?? '—'}
              sub={worstProduct ? `${worstProduct.total.toFixed(2)} adverse` : undefined}
              color="neutral"
              icon={<Package size={18} />}
            />
            <KpiCard
              label="Batches Analysed"
              value={String(items.length)}
              sub="on this page"
              color="blue"
              icon={<TrendingUp size={18} />}
            />
          </div>
        )}

        {isLoading ? (
          <div className="costing-loading">
            <div className="costing-spinner" />
            <span>Loading variance data…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="costing-table-container">
            <div className="costing-empty">
              <div className="costing-empty__icon"><TrendingUp size={48} /></div>
              <h3 className="costing-empty__title">No variance records found</h3>
              <p className="costing-empty__desc">
                Variances are generated automatically when a costing entry is computed for a completed batch.
              </p>
            </div>
          </div>
        ) : (
          <div className="costing-table-container">
            <table className="costing-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Batch</th>
                  <th>Warehouse</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Total Variance</th>
                  <th style={{ textAlign: 'right' }}>Variance %</th>
                  <th>Breakdown</th>
                  <th style={{ textAlign: 'center' }}>Trend</th>
                  <th style={{ textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => {
                  const totalVar = parseFloat(v.total_variance) || 0;
                  const varPct = parseFloat(v.variance_percentage) || 0;
                  const isFav = v.is_favourable;
                  const spark = sparklines[v.product] ?? [];

                  return (
                    <tr key={v.id} style={{ cursor: 'default' }}>
                      <td>
                        <div className="costing-product-cell">{v.product_name}</div>
                      </td>
                      <td>
                        <span className="costing-batch-cell">{v.batch_number}</span>
                      </td>
                      <td>
                        <span className="costing-warehouse-badge">{v.warehouse_name}</span>
                      </td>
                      <td className="costing-date-cell">{fmtDate(v.computed_at)}</td>

                      {/* Total variance */}
                      <td style={{ textAlign: 'right' }}>
                        <span className={`va-amount ${isFav ? 'va-amount--fav' : 'va-amount--adv'}`}>
                          {isFav ? '▼' : '▲'} {Math.abs(totalVar).toFixed(2)}
                        </span>
                      </td>

                      {/* Variance % */}
                      <td style={{ textAlign: 'right' }}>
                        <span className={`va-pct ${isFav ? 'va-pct--fav' : 'va-pct--adv'}`}>
                          {fmtPct(varPct)}
                        </span>
                      </td>

                      {/* Breakdown mini-pills */}
                      <td>
                        <div className="va-breakdown">
                          <BreakdownPill label="Mat. Price" value={v.material_price_variance} />
                          <BreakdownPill label="Mat. Usage" value={v.material_usage_variance} />
                          <BreakdownPill label="Yield" value={v.yield_variance} />
                          <BreakdownPill label="Overhead" value={v.overhead_variance} />
                        </div>
                      </td>

                      {/* Sparkline */}
                      <td style={{ textAlign: 'center' }}>
                        {spark.length >= 2 ? (
                          <Sparkline values={spark} />
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>

                      {/* Badge */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isFav ? 'va-badge--fav' : 'va-badge--adv'}`}>
                          {isFav ? 'Favourable' : 'Adverse'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '0.5rem' }}>
            <button
              className="pagination-btn pagination-btn--prev"
              onClick={() => filters.setFilter('page', (filters.filters.page ?? 1) - 1)}
              disabled={(filters.filters.page ?? 1) <= 1}
              type="button"
            >
              Previous
            </button>
            <span style={{ padding: '0 0.75rem', lineHeight: '36px', fontSize: '0.88rem', color: '#64748b' }}>
              Page {filters.filters.page} of {totalPages}
            </span>
            <button
              className="pagination-btn pagination-btn--next"
              onClick={() => filters.setFilter('page', (filters.filters.page ?? 1) + 1)}
              disabled={(filters.filters.page ?? 1) >= totalPages}
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Breakdown pill ────────────────────────────────

const BreakdownPill: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const n = parseFloat(value) || 0;
  if (Math.abs(n) < 0.001) return null;
  const isFav = n <= 0;
  return (
    <span className={`va-breakdown-pill ${isFav ? 'va-breakdown-pill--fav' : 'va-breakdown-pill--adv'}`}>
      {label}: {isFav ? '▼' : '▲'}{Math.abs(n).toFixed(2)}
    </span>
  );
};

export default VarianceAnalysisPage;
