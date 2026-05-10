import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Package, TrendingUp, TrendingDown, Minus, AlertCircle, ChevronDown, X } from 'lucide-react';
import { useProductStore } from '../../../../core/products/stores/productStore';
import { productCostingService } from '../../services/productCostingService';
import { costingReportsService } from '../../services/costingReportsService';
import { variancesService } from '../../services/variancesService';
import type { StandardCostDetail } from '../../types/standard_costs_models';
import type { PricingRule } from '../../types/pricing_rules_models';
import type { CostTrendDataPoint } from '../../types/reports_models';
import type { VarianceSummaryItem } from '../../types/variances_models';
import type { product } from '../../../../core/products/types/models';
import '../../styles/costing.css';

// ── Formatters ────────────────────────────────────

const fmt = (v: string | number, currency = 'USD', decimals = 2) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals + 2,
  }).format(n);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtPct = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? '—' : `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
};

// ── Inline sparkline bar ──────────────────────────

const allocationLabel = (method?: string) => {
  if (method === 'labor_minutes') return 'Labor minutes';
  if (method === 'unit_rate') return 'Unit rate fallback';
  return 'â€”';
};

const SparkBar: React.FC<{ value: number; max: number; currency: string }> = ({ value, max, currency }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#566d7e', borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 72, textAlign: 'right' }}>
        {fmt(value, currency, 4)}
      </span>
    </div>
  );
};

// ── Product search combobox ───────────────────────

interface ProductSearchProps {
  products: product[];
  selected: product | null;
  onSelect: (p: product | null) => void;
  isLoading: boolean;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ products, selected, onSelect, isLoading }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()),
      )
    : products;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (p: product) => {
    onSelect(p);
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
  };

  return (
    <div ref={ref} className="pc-search-wrap">
      {selected ? (
        <div className="pc-selected-product">
          <div className="pc-selected-product__icon">
            <Package size={18} color="#566d7e" />
          </div>
          <div className="pc-selected-product__info">
            <span className="pc-selected-product__name">{selected.name}</span>
            <span className="pc-selected-product__sku">{selected.sku}</span>
          </div>
          <button className="pc-selected-product__clear" onClick={handleClear} type="button" aria-label="Clear selection">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="pc-search-input-wrap" onClick={() => setOpen(true)}>
          <Search size={16} color="#64748b" />
          <input
            className="pc-search-input"
            type="text"
            placeholder={isLoading ? 'Loading products…' : 'Search by product name or SKU…'}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            disabled={isLoading}
            aria-label="Search products"
            aria-expanded={open}
            aria-haspopup="listbox"
          />
          <ChevronDown size={16} color="#64748b" />
        </div>
      )}

      {open && !selected && (
        <ul className="pc-search-dropdown" role="listbox">
          {filtered.length === 0 ? (
            <li className="pc-search-dropdown__empty">No products found</li>
          ) : (
            filtered.slice(0, 50).map((p) => (
              <li
                key={p.id}
                className="pc-search-dropdown__item"
                role="option"
                aria-selected={false}
                onMouseDown={() => handleSelect(p)}
              >
                <span className="pc-search-dropdown__name">{p.name}</span>
                <span className="pc-search-dropdown__sku">{p.sku}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────

interface ProductData {
  standardCost: StandardCostDetail | null;
  pricingRule: PricingRule | null;
  costTrend: CostTrendDataPoint[];
  varianceSummary: VarianceSummaryItem | null;
}

const EMPTY: ProductData = { standardCost: null, pricingRule: null, costTrend: [], varianceSummary: null };

const ProductCostingPage: React.FC = () => {
  const { products, loading: productsLoading, fetchProducts } = useProductStore();
  const finishedProducts = products.filter((p) => (p.category ?? '').toLowerCase() === 'finished_good');
  const [selected, setSelected] = useState<product | null>(null);
  const [data, setData] = useState<ProductData>(EMPTY);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const loadProductData = useCallback(async (p: product) => {
    setDataLoading(true);
    setDataError(null);
    setData(EMPTY);

    const [stdCostResult, pricingResult, trendResult, varianceResult] = await Promise.allSettled([
      productCostingService.getLatestStandardCost(p.id),
      productCostingService.getPricingRule(p.id),
      costingReportsService.getCostTrend(p.id, { limit: 10 }),
      variancesService.fetchSummary({ group_by: 'product' }),
    ]);

    const stdCost = stdCostResult.status === 'fulfilled' ? stdCostResult.value : null;
    const pricing = pricingResult.status === 'fulfilled' ? pricingResult.value : null;
    const trend = trendResult.status === 'fulfilled' ? trendResult.value : [];
    const allSummary = varianceResult.status === 'fulfilled' ? varianceResult.value : [];
    const varianceSummary = allSummary.find((s) => s.group_id === p.id) ?? null;

    // Surface a meaningful error only if everything failed
    if (!stdCost && !pricing && trend.length === 0) {
      setDataError('No costing data found for this product yet.');
    }

    setData({ standardCost: stdCost, pricingRule: pricing, costTrend: trend, varianceSummary });
    setDataLoading(false);
  }, []);

  const handleSelect = (p: product | null) => {
    setSelected(p);
    if (p) loadProductData(p);
    else { setData(EMPTY); setDataError(null); }
  };

  const currency = data.standardCost?.currency ?? data.pricingRule?.currency ?? 'USD';
  const stdCostPerUnit = parseFloat(data.standardCost?.total_standard_cost_per_unit ?? '0') || 0;
  const recSellingPrice = parseFloat(data.pricingRule?.recommended_selling_price ?? '0') || 0;
  const minSellingPrice = parseFloat(data.pricingRule?.minimum_selling_price ?? '0') || 0;
  const targetMargin = parseFloat(data.pricingRule?.target_gross_margin_percentage ?? '0') || 0;

  // Margin check: is recommended price still valid given current std cost?
  const impliedMargin = recSellingPrice > 0
    ? ((recSellingPrice - stdCostPerUnit) / recSellingPrice) * 100
    : null;

  const marginDrift = impliedMargin !== null ? impliedMargin - targetMargin : null;

  // Cost trend max for sparkbars
  const trendMax = data.costTrend.reduce((m, d) => Math.max(m, parseFloat(d.cost_per_unit) || 0), 0);

  // Variance direction
  const totalVariance = parseFloat(data.varianceSummary?.total_variance ?? '0') || 0;
  const VarianceIcon = totalVariance < 0 ? TrendingDown : totalVariance > 0 ? TrendingUp : Minus;
  const varianceColor = totalVariance < 0 ? '#065f46' : totalVariance > 0 ? '#991b1b' : '#64748b';

  return (
    <div className="costing-page">
      <div className="costing-sticky-stack">
        <div className="costing-page-header">
          <div className="costing-page-header__left">
            <h1>Product Costing</h1>
            <p className="costing-page-header__breadcrumb">Costing / Product Costing</p>
          </div>
        </div>
      </div>

      <div className="costing-content">
        {/* Product selector */}
        <div className="pc-selector-card">
          <div className="pc-selector-card__label">Select a product to analyse</div>
          <ProductSearch
            products={finishedProducts}
            selected={selected}
            onSelect={handleSelect}
            isLoading={productsLoading}
          />
        </div>

        {/* Empty prompt */}
        {!selected && (
          <div className="costing-empty" style={{ marginTop: '3rem' }}>
            <div className="costing-empty__icon"><Package size={48} /></div>
            <h3 className="costing-empty__title">No product selected</h3>
            <p className="costing-empty__desc">
              Search for a product above to see its cost breakdown, pricing, and variance history.
            </p>
          </div>
        )}

        {/* Loading */}
        {selected && dataLoading && (
          <div className="costing-loading" style={{ marginTop: '2rem' }}>
            <div className="costing-spinner" />
            <span>Loading costing data for {selected.name}…</span>
          </div>
        )}

        {/* Error */}
        {selected && !dataLoading && dataError && (
          <div className="costing-error-banner" style={{ marginTop: '1rem' }}>
            <AlertCircle size={18} />
            {dataError}
            <button onClick={() => loadProductData(selected)} type="button">Retry</button>
          </div>
        )}

        {/* Dashboard */}
        {selected && !dataLoading && (
          <div className="pc-dashboard">

            {/* Row 1: Standard Cost + Pricing */}
            <div className="pc-top-row">

              {/* Standard Cost card */}
              <div className="costing-section-card pc-card">
                <div className="costing-section-card__header">
                  <h3 className="costing-section-card__title">Current Standard Cost</h3>
                  {data.standardCost && (
                    <span className="badge sc-active">Active</span>
                  )}
                </div>
                {data.standardCost ? (
                  <div style={{ padding: '1.25rem' }}>
                    <div className="pc-hero-number">
                      {fmt(stdCostPerUnit, currency, 4)}
                      <span className="pc-hero-number__label">per unit</span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Material</span>
                      <span className="pc-stat-value">{fmt(data.standardCost.material_cost_per_unit, currency)}</span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Overhead</span>
                      <span className="pc-stat-value">{fmt(data.standardCost.overhead_cost_per_unit, currency)}</span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Overhead method</span>
                      <span className="pc-stat-value">
                        {allocationLabel(data.standardCost.overhead_allocation_method)}
                      </span>
                    </div>
                    <div className="pc-stat-row" style={{ borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 8 }}>
                      <span className="pc-stat-label">Formula Rev.</span>
                      <span className="sc-revision-badge">Rev. {data.standardCost.formula_revision}</span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Computed</span>
                      <span className="pc-stat-value">{fmtDate(data.standardCost.computed_at)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pc-no-data">No standard cost computed yet.</div>
                )}
              </div>

              {/* Pricing card */}
              <div className="costing-section-card pc-card">
                <div className="costing-section-card__header">
                  <h3 className="costing-section-card__title">Recommended Selling Price</h3>
                </div>
                {data.pricingRule ? (
                  <div style={{ padding: '1.25rem' }}>
                    <div className="pc-hero-number">
                      {fmt(recSellingPrice, currency)}
                      <span className="pc-hero-number__label">recommended</span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Minimum price</span>
                      <span className="pc-stat-value">{fmt(minSellingPrice, currency)}</span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Target margin</span>
                      <span className="pc-stat-value">{targetMargin.toFixed(1)}%</span>
                    </div>
                    {/* Margin drift alert */}
                    {marginDrift !== null && stdCostPerUnit > 0 && (
                      <div className={`pc-margin-alert ${Math.abs(marginDrift) > 3 ? 'pc-margin-alert--warn' : 'pc-margin-alert--ok'}`}>
                        {Math.abs(marginDrift) > 3 ? (
                          <>
                            <AlertCircle size={14} />
                            Margin has drifted {Math.abs(marginDrift).toFixed(1)}% from target.
                            Consider recalculating pricing.
                          </>
                        ) : (
                          <>
                            <TrendingUp size={14} />
                            Pricing is tracking within {Math.abs(marginDrift).toFixed(1)}% of target margin.
                          </>
                        )}
                      </div>
                    )}
                    <div className="pc-stat-row" style={{ marginTop: 8 }}>
                      <span className="pc-stat-label">Last updated</span>
                      <span className="pc-stat-value">{fmtDate(data.pricingRule.last_updated)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pc-no-data">No pricing rule defined for this product.</div>
                )}
              </div>

              {/* Variance summary card */}
              <div className="costing-section-card pc-card">
                <div className="costing-section-card__header">
                  <h3 className="costing-section-card__title">Variance Summary</h3>
                </div>
                {data.varianceSummary ? (
                  <div style={{ padding: '1.25rem' }}>
                    <div className="pc-hero-number" style={{ color: varianceColor }}>
                      <VarianceIcon size={22} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      {fmtPct(data.varianceSummary.avg_variance_percentage)}
                      <span className="pc-hero-number__label">avg variance</span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Total variance</span>
                      <span className="pc-stat-value" style={{ color: varianceColor, fontWeight: 700 }}>
                        {fmt(totalVariance, currency)}
                      </span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Batches analysed</span>
                      <span className="pc-stat-value">{data.varianceSummary.batch_count}</span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Favourable</span>
                      <span className="pc-stat-value" style={{ color: '#065f46' }}>
                        {data.varianceSummary.favourable_count}
                      </span>
                    </div>
                    <div className="pc-stat-row">
                      <span className="pc-stat-label">Adverse</span>
                      <span className="pc-stat-value" style={{ color: '#991b1b' }}>
                        {data.varianceSummary.adverse_count}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pc-no-data">No variance data available yet.</div>
                )}
              </div>
            </div>

            {/* Row 2: Cost trend table */}
            <div className="costing-section-card">
              <div className="costing-section-card__header">
                <h3 className="costing-section-card__title">
                  <TrendingUp size={16} />
                  Recent Actual Costs
                  <span className="costing-section-card__count">{data.costTrend.length} batches</span>
                </h3>
                {stdCostPerUnit > 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Standard: <strong>{fmt(stdCostPerUnit, currency, 4)}</strong>
                  </span>
                )}
              </div>

              {data.costTrend.length === 0 ? (
                <div className="pc-no-data" style={{ padding: '2rem', textAlign: 'center' }}>
                  No completed batches with costing data yet.
                </div>
              ) : (
                <table className="costing-lines-table">
                  <thead>
                    <tr>
                      <th>Batch</th>
                      <th>Date</th>
                      <th>Output Qty</th>
                      <th>Total Cost</th>
                      <th style={{ minWidth: 220 }}>Cost / Unit vs Standard</th>
                      <th className="right">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.costTrend.map((row) => {
                      const actual = parseFloat(row.cost_per_unit) || 0;
                      const variance = stdCostPerUnit > 0 ? actual - stdCostPerUnit : null;
                      const variancePct = stdCostPerUnit > 0 ? ((actual - stdCostPerUnit) / stdCostPerUnit) * 100 : null;
                      const isFav = variance !== null && variance <= 0;
                      return (
                        <tr key={row.production_batch}>
                          <td>
                            <span className="costing-batch-cell">{row.batch_number}</span>
                          </td>
                          <td className="costing-date-cell">{fmtDate(row.computed_at)}</td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {parseFloat(row.actual_output_quantity).toLocaleString()}
                          </td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {fmt(row.total_cost, currency)}
                          </td>
                          <td>
                            <SparkBar value={actual} max={trendMax} currency={currency} />
                            {stdCostPerUnit > 0 && (
                              <div className="pc-std-line" style={{ '--std-pct': `${Math.min((stdCostPerUnit / trendMax) * 100, 100)}%` } as React.CSSProperties} />
                            )}
                          </td>
                          <td className="right">
                            {variance !== null ? (
                              <span style={{ color: isFav ? '#065f46' : '#991b1b', fontWeight: 700, fontSize: '0.82rem' }}>
                                {isFav ? '▼' : '▲'} {variancePct !== null ? `${Math.abs(variancePct).toFixed(1)}%` : '—'}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCostingPage;
