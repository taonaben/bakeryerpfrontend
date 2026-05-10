import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Package, ExternalLink } from 'lucide-react';
import { useCostingEntriesStore } from '../../stores/costingEntriesStore';
import '../../styles/costing.css';
import '../../../inventory/styles/batch-detail.css';

const fmt = (v: string | number, currency = 'USD', decimals = 2) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals + 2,
  }).format(n);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const fmtQty = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 4 });
};

const allocationLabel = (method?: string) => {
  if (method === 'labor_minutes') return 'Labor minutes';
  if (method === 'unit_rate') return 'Unit rate fallback';
  return 'â€”';
};

const CostingEntryDetailPage: React.FC = () => {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();

  const detailMap = useCostingEntriesStore((s) => s.detailMap);
  const isLoading = useCostingEntriesStore((s) => s.isLoading);
  const error = useCostingEntriesStore((s) => s.error);
  const fetchById = useCostingEntriesStore((s) => s.fetchById);

  const entry = entryId ? detailMap[entryId] : undefined;

  useEffect(() => {
    if (entryId) fetchById(entryId);
  }, [entryId]);

  // ── Loading ──────────────────────────────────
  if (isLoading && !entry) {
    return (
      <div className="costing-detail-page">
        <div className="costing-detail-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="loading-skeleton">
          <div className="skeleton-sidebar" />
          <div className="skeleton-content" />
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────
  if (error && !entry) {
    return (
      <div className="costing-detail-page">
        <div className="costing-detail-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="costing-error-banner" role="alert">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => entryId && fetchById(entryId, true)} type="button">Retry</button>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────
  if (!entry) {
    return (
      <div className="costing-detail-page">
        <div className="costing-detail-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Entry Not Found</h2>
          <p>This costing entry doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const currency = entry.currency || 'USD';
  const lines = entry.lines ?? [];

  // Totals from lines
  const totalMaterial = parseFloat(entry.total_material_cost) || 0;
  const totalOverhead = parseFloat(entry.overhead_cost) || 0;
  const totalCost = parseFloat(entry.total_cost) || 0;
  const costPerUnit = parseFloat(entry.cost_per_unit) || 0;
  const outputQty = parseFloat(entry.actual_output_quantity) || 0;
  const wasteQty = parseFloat(entry.actual_waste_quantity) || 0;

  return (
    <div className="costing-detail-page">
      {/* Header bar */}
      <div className="costing-detail-header">
        <button
          className="back-button"
          onClick={() => navigate('/costing/entries')}
          aria-label="Back to costing entries"
        >
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <span>Costing</span>
          <span className="sep">/</span>
          <span>
            <a href="/costing/entries" style={{ color: 'inherit', textDecoration: 'none' }}>
              Costing Entries
            </a>
          </span>
          <span className="sep">/</span>
          <span className="active">{entry.batch_number}</span>
        </nav>
      </div>

      <div className="costing-detail-container">
        {/* ── Side Panel ─────────────────────── */}
        <aside className="costing-side-panel">
          <div className="costing-side-panel__header">
            <h2 className="costing-side-panel__title">{entry.batch_number}</h2>
            <p className="costing-side-panel__sub">{entry.product_name}</p>
          </div>

          {/* CPU Hero */}
          <div className="costing-cpu-hero">
            <div className="costing-cpu-hero__label">Cost per Unit</div>
            <div className="costing-cpu-hero__value">
              {fmt(costPerUnit, currency, 4)}
              <span className="costing-cpu-hero__currency">{currency}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="costing-meta-list">
            <div className="costing-meta-item">
              <label>Product</label>
              <span className="costing-meta-value">{entry.product_name}</span>
            </div>
            <div className="costing-meta-item">
              <label>Warehouse</label>
              <span className="costing-meta-value">{entry.warehouse_name}</span>
            </div>
            <div className="costing-meta-item">
              <label>Date Computed</label>
              <span className="costing-meta-value">{fmtDate(entry.computed_at)}</span>
            </div>
            <div className="costing-meta-item">
              <label>Output Quantity</label>
              <span className="costing-meta-value">{fmtQty(outputQty)}</span>
            </div>
            {wasteQty > 0 && (
              <div className="costing-meta-item">
                <label>Waste Quantity</label>
                <span className="costing-meta-value" style={{ color: '#b45309' }}>
                  {fmtQty(wasteQty)}
                </span>
              </div>
            )}
            <div className="costing-meta-item">
              <label>Status</label>
              <span className="badge costed">Costed</span>
            </div>
            <div className="costing-meta-item">
              <label>Overhead Method</label>
              <span className="costing-meta-value">
                {allocationLabel(entry.overhead_allocation_method)}
              </span>
            </div>
          </div>

          {/* Link to production batch */}
          {entry.production_batch && (
            <div style={{ padding: '1rem 1.25rem' }}>
              <Link
                to={`/production/orders/${entry.production_batch}/batches`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  color: '#2563eb',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={14} />
                View Production Batch
              </Link>
            </div>
          )}
        </aside>

        {/* ── Main Content ───────────────────── */}
        <main className="costing-main-content">
          {/* Cost Summary */}
          <div className="costing-section-card">
            <div className="costing-section-card__header">
              <h3 className="costing-section-card__title">Cost Summary</h3>
            </div>
            <div className="costing-summary-grid">
              <div className="costing-summary-stat">
                <div className="costing-summary-stat__label">Material Cost</div>
                <div className="costing-summary-stat__value">
                  {fmt(totalMaterial, currency)}
                </div>
              </div>
              <div className="costing-summary-stat">
                <div className="costing-summary-stat__label">Overhead Cost</div>
                <div className="costing-summary-stat__value">
                  {fmt(totalOverhead, currency)}
                </div>
              </div>
              <div className="costing-summary-stat">
                <div className="costing-summary-stat__label">Total Cost</div>
                <div className="costing-summary-stat__value highlight">
                  {fmt(totalCost, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Ingredient Line Breakdown */}
          <div className="costing-section-card">
            <div className="costing-section-card__header">
              <h3 className="costing-section-card__title">
                <Package size={16} />
                Ingredient Breakdown
                <span className="costing-section-card__count">{lines.length}</span>
              </h3>
            </div>

            {lines.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>
                No line items available for this entry.
              </div>
            ) : (
              <table className="costing-lines-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ingredient</th>
                    <th className="right">Qty Used</th>
                    <th className="right">Unit Cost</th>
                    <th className="right">Line Total</th>
                    <th className="right">% of Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => {
                    const lineTotal = parseFloat(line.actual_cost) || 0;
                    const pct = totalMaterial > 0 ? (lineTotal / totalMaterial) * 100 : 0;
                    return (
                      <tr key={line.id}>
                        <td style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{i + 1}</td>
                        <td className="line-product">{line.product_name}</td>
                        <td className="right line-qty">{fmtQty(line.actual_quantity_used)}</td>
                        <td className="right">{fmt(line.unit_price_used, currency, 4)}</td>
                        <td className="right line-cost">{fmt(lineTotal, currency)}</td>
                        <td className="right" style={{ color: '#64748b', fontSize: '0.82rem' }}>
                          {pct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CostingEntryDetailPage;
