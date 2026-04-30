import React, { useEffect, useCallback, useState } from 'react';
import { Search, Pencil, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import { usePricingRulesStore } from '../../stores/pricingRulesStore';
import usePricingRuleFilters from '../../hooks/usePricingRuleFilters';
import PricingRuleModal from '../../components/PricingRuleModal';
import type { PricingRule, UpdatePricingRuleDTO } from '../../types/pricing_rules_models';
import '../../styles/costing.css';

// ── Formatters ────────────────────────────────────

const fmt = (v: string | number, currency = 'USD') => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n) || n === 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 2, maximumFractionDigits: 4,
  }).format(n);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtPct = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? '—' : `${n.toFixed(1)}%`;
};

// Compute implied margin from price and cost
const impliedMargin = (price: string, cost: string): number | null => {
  const p = parseFloat(price);
  const c = parseFloat(cost);
  if (!p || !c || p <= 0) return null;
  return ((p - c) / p) * 100;
};

// ── Price context string ──────────────────────────
// "$2.40 (42% margin on $1.69 cost)"
const priceContext = (rule: PricingRule): string => {
  const price = parseFloat(rule.recommended_selling_price);
  const cost = parseFloat(rule.standard_cost_reference ? '0' : '0');
  if (!price || price === 0) return '—';
  const margin = impliedMargin(rule.recommended_selling_price, rule.minimum_selling_price);
  const target = parseFloat(rule.target_gross_margin_percentage);
  if (margin !== null && !isNaN(target)) {
    return `${fmtPct(target)} margin`;
  }
  return '';
};

// ── Component ─────────────────────────────────────

const PricingRulesPage: React.FC = () => {
  const { items, isLoading, isSubmitting, error, totalPages, fetchAll, patch, recalculate } =
    usePricingRulesStore();
  const filters = usePricingRuleFilters();

  const [searchInput, setSearchInput] = useState('');
  const [editTarget, setEditTarget] = useState<PricingRule | null>(null);
  const [recalculating, setRecalculating] = useState<string | null>(null);
  const [recalcError, setRecalcError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => filters.setFilter('search', searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(() => {
    fetchAll(filters.getApiParams(), true);
  }, [filters.filters]);

  useEffect(() => { load(); }, [load]);

  const handlePatch = async (dto: UpdatePricingRuleDTO) => {
    if (!editTarget) return;
    await patch(editTarget.id, dto);
    setEditTarget(null);
  };

  const handleRecalculate = async (rule: PricingRule) => {
    setRecalculating(rule.id);
    setRecalcError(null);
    try {
      await recalculate(rule.id);
    } catch (e: any) {
      setRecalcError(`Failed to recalculate ${rule.product_name}: ${e.message}`);
    } finally {
      setRecalculating(null);
    }
  };

  return (
    <div className="costing-page">
      <div className="costing-sticky-stack">
        <div className="costing-page-header">
          <div className="costing-page-header__left">
            <h1>Product Pricing Rules</h1>
            <p className="costing-page-header__breadcrumb">Costing / Product Pricing Rules</p>
          </div>
        </div>

        <div className="costing-toolbar">
          <div className="costing-toolbar__left" />
          <div className="costing-toolbar__right">
            <div className="search-bar">
              <Search size={15} color="#64748b" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search product…"
                aria-label="Search pricing rules"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="costing-content">
        {(error || recalcError) && (
          <div className="costing-error-banner" style={{ marginBottom: '0.75rem' }}>
            <AlertCircle size={18} />
            {error || recalcError}
            <button onClick={() => { load(); setRecalcError(null); }} type="button">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="costing-loading">
            <div className="costing-spinner" />
            <span>Loading pricing rules…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="costing-table-container">
            <div className="costing-empty">
              <div className="costing-empty__icon"><Plus size={40} /></div>
              <h3 className="costing-empty__title">No pricing rules defined</h3>
              <p className="costing-empty__desc">
                Pricing rules are created per product. Set a target margin and the system will compute the recommended selling price from the latest standard cost.
              </p>
            </div>
          </div>
        ) : (
          <div className="costing-table-container">
            <table className="costing-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Target Margin</th>
                  <th style={{ textAlign: 'center' }}>Min Margin</th>
                  <th style={{ textAlign: 'right' }}>Std Cost / Unit</th>
                  <th>Recommended Price</th>
                  <th>Last Recalculated</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((rule) => {
                  const recPrice = parseFloat(rule.recommended_selling_price) || 0;
                  const minPrice = parseFloat(rule.minimum_selling_price) || 0;
                  const target = parseFloat(rule.target_gross_margin_percentage) || 0;
                  const isRecalc = recalculating === rule.id;

                  // We don't have std cost directly on the rule — show min price as cost proxy
                  // The context string uses target margin for clarity
                  const hasPrice = recPrice > 0;

                  return (
                    <tr key={rule.id} style={{ cursor: 'default' }}>
                      <td>
                        <div className="costing-product-cell">{rule.product_name}</div>
                      </td>

                      {/* Target margin with visual bar */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="pr-margin-pill pr-margin-pill--target">
                          {fmtPct(rule.target_gross_margin_percentage)}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div className="pr-margin-pill pr-margin-pill--min">
                          {fmtPct(rule.minimum_margin_percentage)}
                        </div>
                      </td>

                      {/* Std cost — not directly on rule, show dash until we have it */}
                      <td style={{ textAlign: 'right' }}>
                        <span className="costing-date-cell">—</span>
                      </td>

                      {/* Recommended price with context */}
                      <td>
                        {hasPrice ? (
                          <div>
                            <span className="pr-rec-price">
                              {fmt(rule.recommended_selling_price, rule.currency)}
                            </span>
                            <span className="pr-rec-price__context">
                              {target > 0 ? `${target.toFixed(1)}% margin` : ''}
                              {minPrice > 0 ? ` · min ${fmt(rule.minimum_selling_price, rule.currency)}` : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="costing-date-cell">Not yet calculated</span>
                        )}
                      </td>

                      <td className="costing-date-cell">
                        {rule.last_updated ? fmtDate(rule.last_updated) : '—'}
                        {rule.updated_by_name && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                            by {rule.updated_by_name}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="pr-actions">
                          {/* Edit margins */}
                          <button
                            className="or-edit-btn"
                            onClick={() => setEditTarget(rule)}
                            type="button"
                            title="Edit margins"
                            aria-label={`Edit margins for ${rule.product_name}`}
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Recalculate */}
                          <button
                            className={`pr-recalc-btn${isRecalc ? ' pr-recalc-btn--spinning' : ''}`}
                            onClick={() => handleRecalculate(rule)}
                            disabled={isRecalc || isSubmitting}
                            type="button"
                            title="Recalculate against latest standard cost"
                            aria-label={`Recalculate price for ${rule.product_name}`}
                          >
                            <RefreshCw size={14} className={isRecalc ? 'spin' : ''} />
                            <span>{isRecalc ? 'Recalculating…' : 'Recalculate'}</span>
                          </button>
                        </div>
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
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              className="pagination-btn"
              onClick={() => filters.setFilter('page', (filters.filters.page ?? 1) - 1)}
              disabled={(filters.filters.page ?? 1) <= 1}
              type="button"
            >
              Previous
            </button>
            <span style={{ padding: '0 1rem', lineHeight: '36px', fontSize: '0.88rem', color: '#64748b' }}>
              Page {filters.filters.page} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => filters.setFilter('page', (filters.filters.page ?? 1) + 1)}
              disabled={(filters.filters.page ?? 1) >= totalPages}
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {editTarget && (
        <PricingRuleModal
          rule={editTarget}
          isSubmitting={isSubmitting}
          onSubmit={handlePatch}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
};

export default PricingRulesPage;
