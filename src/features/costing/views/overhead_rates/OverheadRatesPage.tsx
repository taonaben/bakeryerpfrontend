import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, AlertTriangle, AlertCircle } from 'lucide-react';
import { useOverheadRatesStore } from '../../stores/overheadRatesStore';
import OverheadRateModal from '../../components/OverheadRateModal';
import type { OverheadRate, CreateOverheadRateDTO } from '../../types/overhead_rates_models';
import '../../styles/costing.css';

// ── Helpers ───────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtCurrency = (v: string | number, currency = 'USD') => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 2, maximumFractionDigits: 4,
  }).format(n);
};

// Derive status from period dates
const deriveStatus = (rate: OverheadRate): 'active' | 'upcoming' | 'expired' => {
  const today = new Date().toISOString().slice(0, 10);
  if (rate.period_end < today) return 'expired';
  if (rate.period_start > today) return 'upcoming';
  return 'active';
};

// ── Component ─────────────────────────────────────

const OverheadRatesPage: React.FC = () => {
  const { items, isLoading, isSubmitting, error, fetchAll, create, patch } =
    useOverheadRatesStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OverheadRate | null>(null);
  // Track which rate the user tried to edit but is locked
  const [lockedWarning, setLockedWarning] = useState<string | null>(null);

  const load = useCallback(() => fetchAll(undefined, true), []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setLockedWarning(null);
    setModalOpen(true);
  };

  const openEdit = (rate: OverheadRate) => {
    // In a real app you'd check if any costing entries reference this rate.
    // We simulate: expired rates are considered "used" and locked.
    const status = deriveStatus(rate);
    if (status === 'expired') {
      setLockedWarning(rate.id);
      return;
    }
    setLockedWarning(null);
    setEditTarget(rate);
    setModalOpen(true);
  };

  const handleSubmit = async (dto: CreateOverheadRateDTO) => {
    try {
      if (editTarget) {
        await patch(editTarget.id, dto);
      } else {
        await create(dto);
      }
      setModalOpen(false);
      setEditTarget(null);
    } catch {
      // error surfaced via store
    }
  };

  // Group: active first, then upcoming, then expired
  const sorted = [...items].sort((a, b) => {
    const order = { active: 0, upcoming: 1, expired: 2 };
    return order[deriveStatus(a)] - order[deriveStatus(b)];
  });

  return (
    <div className="costing-page">
      <div className="costing-sticky-stack">
        {/* Header */}
        <div className="costing-page-header">
          <div className="costing-page-header__left">
            <h1>Overhead Rates</h1>
            <p className="costing-page-header__breadcrumb">Costing / Overhead Rates</p>
          </div>
          <div className="costing-page-header__actions">
            <button className="btn btn-primary" onClick={openCreate} type="button">
              <Plus size={16} />
              New Rate
            </button>
          </div>
        </div>
      </div>

      <div className="costing-content">
        {error && (
          <div className="costing-error-banner" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            {error}
            <button onClick={load} type="button">Retry</button>
          </div>
        )}

        {/* Info callout */}
        <div className="or-info-callout">
          <AlertTriangle size={16} />
          Only one rate can be active per warehouse at a time. Active rates are highlighted.
          Expired rates that have been applied to costing entries cannot be edited.
        </div>

        {isLoading ? (
          <div className="costing-loading">
            <div className="costing-spinner" />
            <span>Loading overhead rates…</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="costing-table-container">
            <div className="costing-empty">
              <div className="costing-empty__icon">
                <AlertTriangle size={40} />
              </div>
              <h3 className="costing-empty__title">No overhead rates defined</h3>
              <p className="costing-empty__desc">
                Create a rate to start allocating overhead costs to production.
              </p>
              <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }} type="button">
                <Plus size={16} /> New Rate
              </button>
            </div>
          </div>
        ) : (
          <div className="costing-table-container">
            <table className="costing-table">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th>Period</th>
                  <th style={{ textAlign: 'right' }}>Overhead Budgeted</th>
                  <th style={{ textAlign: 'right' }}>Planned Units</th>
                  <th style={{ textAlign: 'right' }}>Rate / Unit</th>
                  <th style={{ textAlign: 'right' }}>Rate / Labor Min.</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((rate) => {
                  const status = deriveStatus(rate);
                  const isLocked = lockedWarning === rate.id;

                  return (
                    <React.Fragment key={rate.id}>
                      <tr className={`or-row or-row--${status}`}>
                        <td>
                          <div className="costing-product-cell">{rate.warehouse_name}</div>
                        </td>
                        <td className="costing-date-cell">
                          {fmtDate(rate.period_start)} — {fmtDate(rate.period_end)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="costing-total-cell">
                            {fmtCurrency(rate.total_overhead_budgeted, rate.currency)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {parseFloat(rate.planned_production_units).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="costing-cpu-cell">
                            {fmtCurrency(rate.rate_per_unit, rate.currency)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="costing-cpu-cell">
                            {rate.rate_per_labor_minute
                              ? fmtCurrency(rate.rate_per_labor_minute, rate.currency)
                              : 'â€”'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge or-badge--${status}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="costing-date-cell">{rate.created_by_name || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className={`or-edit-btn${status === 'expired' ? ' or-edit-btn--locked' : ''}`}
                            onClick={() => openEdit(rate)}
                            type="button"
                            title={status === 'expired' ? 'Cannot edit — rate has been applied' : 'Edit rate'}
                            aria-label={`Edit overhead rate for ${rate.warehouse_name}`}
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>

                      {/* Inline locked warning */}
                      {isLocked && (
                        <tr className="or-locked-row">
                          <td colSpan={9}>
                            <div className="or-locked-warning">
                              <AlertTriangle size={15} />
                              This rate has already been applied to costing entries and cannot be edited.
                              Create a new rate for the next period instead.
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <OverheadRateModal
          rate={editTarget}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
};

export default OverheadRatesPage;
