import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, FlaskConical } from 'lucide-react';
import { useStandardCostsStore } from '../../stores/standardCostsStore';
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
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const fmtQty = (v: string | number) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 4 });
};

const StandardCostDetailPage: React.FC = () => {
  const { costId } = useParams<{ costId: string }>();
  const navigate = useNavigate();

  const detailMap = useStandardCostsStore((s) => s.detailMap);
  const isLoading = useStandardCostsStore((s) => s.isLoading);
  const error = useStandardCostsStore((s) => s.error);
  const fetchById = useStandardCostsStore((s) => s.fetchById);

  const record = costId ? detailMap[costId] : undefined;

  useEffect(() => {
    if (costId) fetchById(costId);
  }, [costId]);

  // ── Loading ──────────────────────────────────
  if (isLoading && !record) {
    return (
      <div className="costing-detail-page">
        <div className="costing-detail-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} /><span>Back</span>
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
  if (error && !record) {
    return (
      <div className="costing-detail-page">
        <div className="costing-detail-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} /><span>Back</span>
          </button>
        </div>
        <div className="costing-error-banner" role="alert">
          <AlertCircle size={18} />{error}
          <button onClick={() => costId && fetchById(costId, true)} type="button">Retry</button>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="costing-detail-page">
        <div className="costing-detail-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} /><span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Standard Cost Not Found</h2>
          <p>This record doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const currency = record.currency || 'USD';
  const lines = record.lines ?? [];
  const totalMaterial = parseFloat(record.material_cost_per_unit) || 0;
  const totalOverhead = parseFloat(record.overhead_cost_per_unit) || 0;
  const totalStd = parseFloat(record.total_standard_cost_per_unit) || 0;
  const batchSize = parseFloat(record.batch_size_used) || 0;
  const yieldPct = parseFloat(record.yield_percentage_used) || 0;

  return (
    <div className="costing-detail-page">
      {/* Header bar */}
      <div className="costing-detail-header">
        <button
          className="back-button"
          onClick={() => navigate('/costing/standard-costs')}
          aria-label="Back to standard costs"
        >
          <ArrowLeft size={18} /><span>Back</span>
        </button>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <span>Costing</span>
          <span className="sep">/</span>
          <span>Standard Costs</span>
          <span className="sep">/</span>
          <span className="active">{record.product_name} — Rev. {record.formula_revision}</span>
        </nav>
      </div>

      <div className="costing-detail-container">
        {/* ── Side Panel ─────────────────────── */}
        <aside className="costing-side-panel">
          <div className="costing-side-panel__header">
            <h2 className="costing-side-panel__title">{record.product_name}</h2>
            <p className="costing-side-panel__sub">Formula Rev. {record.formula_revision}</p>
          </div>

          {/* Std Cost Hero */}
          <div className="costing-cpu-hero">
            <div className="costing-cpu-hero__label">Standard Cost / Unit</div>
            <div className="costing-cpu-hero__value">
              {fmt(totalStd, currency, 4)}
              <span className="costing-cpu-hero__currency">{currency}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="costing-meta-list">
            <div className="costing-meta-item">
              <label>Status</label>
              {/* The list page determines active/superseded; here we just show the record */}
              <span className="badge sc-active">Active</span>
            </div>
            <div className="costing-meta-item">
              <label>Computed</label>
              <span className="costing-meta-value">{fmtDate(record.computed_at)}</span>
            </div>
            {record.computed_by_name && (
              <div className="costing-meta-item">
                <label>Computed By</label>
                <span className="costing-meta-value">{record.computed_by_name}</span>
              </div>
            )}
            {batchSize > 0 && (
              <div className="costing-meta-item">
                <label>Batch Size Used</label>
                <span className="costing-meta-value">{fmtQty(batchSize)}</span>
              </div>
            )}
            {yieldPct > 0 && (
              <div className="costing-meta-item">
                <label>Yield %</label>
                <span className="costing-meta-value">{yieldPct.toFixed(2)}%</span>
              </div>
            )}
          </div>
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
                <div className="costing-summary-stat__label">Material / Unit</div>
                <div className="costing-summary-stat__value">
                  {fmt(totalMaterial, currency)}
                </div>
              </div>
              <div className="costing-summary-stat">
                <div className="costing-summary-stat__label">Overhead / Unit</div>
                <div className="costing-summary-stat__value">
                  {fmt(totalOverhead, currency)}
                </div>
              </div>
              <div className="costing-summary-stat">
                <div className="costing-summary-stat__label">Total Std Cost / Unit</div>
                <div className="costing-summary-stat__value highlight">
                  {fmt(totalStd, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Ingredient Breakdown */}
          <div className="costing-section-card">
            <div className="costing-section-card__header">
              <h3 className="costing-section-card__title">
                <FlaskConical size={16} />
                Ingredient Breakdown
                <span className="costing-section-card__count">{lines.length}</span>
              </h3>
            </div>

            {lines.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>
                No ingredient lines available for this standard cost.
              </div>
            ) : (
              <table className="costing-lines-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ingredient</th>
                    <th>Supplier</th>
                    <th className="right">Qty / Batch</th>
                    <th className="right">Qty / Unit</th>
                    <th className="right">Unit Price</th>
                    <th className="right">Cost / Unit</th>
                    <th className="right">% of Material</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => {
                    const costPct = parseFloat(line.cost_percentage) || 0;
                    return (
                      <tr key={line.id}>
                        <td style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{i + 1}</td>
                        <td className="line-product">{line.product_name}</td>
                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {line.supplier_name || '—'}
                        </td>
                        <td className="right line-qty">{fmtQty(line.quantity_per_batch)}</td>
                        <td className="right line-qty">{fmtQty(line.quantity_per_unit)}</td>
                        <td className="right">{fmt(line.unit_price_used, currency, 4)}</td>
                        <td className="right line-cost">{fmt(line.cost_per_unit, currency, 4)}</td>
                        <td className="right" style={{ color: '#64748b', fontSize: '0.82rem' }}>
                          {costPct.toFixed(1)}%
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

export default StandardCostDetailPage;
