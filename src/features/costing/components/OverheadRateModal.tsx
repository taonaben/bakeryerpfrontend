import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useUserStore } from '../../auth/stores/userStore';
import { warehouseService } from '../../../core/warehouses/services/warehouseService';
import type { OverheadRate, CreateOverheadRateDTO } from '../types/overhead_rates_models';

interface Props {
  /** null = create mode, OverheadRate = edit mode */
  rate: OverheadRate | null;
  isSubmitting: boolean;
  onSubmit: (dto: CreateOverheadRateDTO) => void;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const OverheadRateModal: React.FC<Props> = ({
  rate,
  isSubmitting,
  onSubmit,
  onClose,
}) => {
  const isEdit = !!rate;
  const user = useUserStore((s) => s.user);

  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);

  const [form, setForm] = useState<CreateOverheadRateDTO>({
    warehouse: rate?.warehouse ?? '',
    period_start: rate?.period_start ?? today(),
    period_end: rate?.period_end ?? '',
    total_overhead_budgeted: rate?.total_overhead_budgeted ?? '',
    planned_production_units: rate?.planned_production_units ?? '',
    currency: rate?.currency ?? 'USD',
    notes: rate?.notes ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateOverheadRateDTO, string>>>({});

  // Fetch warehouses for the current user's company
  useEffect(() => {
    const companyId = typeof user?.company === 'string' ? user.company : user?.company;
    if (!companyId) { setWarehousesLoading(false); return; }
    setWarehousesLoading(true);
    warehouseService
      .getWarehousesByCompany(companyId as string)
      .then((whs) => setWarehouses(whs.map((w) => ({ id: w.id, name: w.name }))))
      .catch(() => setWarehouses([]))
      .finally(() => setWarehousesLoading(false));
  }, [user?.company]);

  // Derived: rate per unit preview
  const ratePreview = (() => {
    const oh = parseFloat(form.total_overhead_budgeted);
    const units = parseFloat(form.planned_production_units);
    if (!isNaN(oh) && !isNaN(units) && units > 0) {
      return (oh / units).toFixed(4);
    }
    return null;
  })();

  const set = (key: keyof CreateOverheadRateDTO, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.warehouse) e.warehouse = 'Warehouse is required';
    if (!form.period_start) e.period_start = 'Start date is required';
    if (!form.period_end) e.period_end = 'End date is required';
    if (form.period_start && form.period_end && form.period_end <= form.period_start)
      e.period_end = 'End date must be after start date';
    if (!form.total_overhead_budgeted || parseFloat(form.total_overhead_budgeted) <= 0)
      e.total_overhead_budgeted = 'Must be greater than 0';
    if (!form.planned_production_units || parseFloat(form.planned_production_units) <= 0)
      e.planned_production_units = 'Must be greater than 0';
    if (!form.currency) e.currency = 'Currency is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  // Trap focus — close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="or-modal-title">
      <div className="modal-content" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="modal-header">
          <h2 id="or-modal-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            {isEdit ? 'Edit Overhead Rate' : 'New Overhead Rate'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal" type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Warehouse */}
            <div className="form-group">
              <label>Warehouse <span className="required">*</span></label>
              <select
                value={form.warehouse}
                onChange={(e) => set('warehouse', e.target.value)}
                className={errors.warehouse ? 'input-error' : ''}
                disabled={isEdit || warehousesLoading}
              >
                <option value="">
                  {warehousesLoading ? 'Loading warehouses…' : 'Select warehouse…'}
                </option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {errors.warehouse && <span className="field-error">{errors.warehouse}</span>}
              {isEdit && (
                <span className="field-warning">Warehouse cannot be changed after creation.</span>
              )}
            </div>

            {/* Period */}
            <div className="form-row">
              <div className="form-group">
                <label>Period Start <span className="required">*</span></label>
                <input
                  type="date"
                  value={form.period_start}
                  onChange={(e) => set('period_start', e.target.value)}
                  className={errors.period_start ? 'input-error' : ''}
                />
                {errors.period_start && <span className="field-error">{errors.period_start}</span>}
              </div>
              <div className="form-group">
                <label>Period End <span className="required">*</span></label>
                <input
                  type="date"
                  value={form.period_end}
                  onChange={(e) => set('period_end', e.target.value)}
                  className={errors.period_end ? 'input-error' : ''}
                />
                {errors.period_end && <span className="field-error">{errors.period_end}</span>}
              </div>
            </div>

            {/* Financials */}
            <div className="form-row">
              <div className="form-group">
                <label>Total Overhead Budgeted <span className="required">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 50000"
                  value={form.total_overhead_budgeted}
                  onChange={(e) => set('total_overhead_budgeted', e.target.value)}
                  className={errors.total_overhead_budgeted ? 'input-error' : ''}
                />
                {errors.total_overhead_budgeted && (
                  <span className="field-error">{errors.total_overhead_budgeted}</span>
                )}
              </div>
              <div className="form-group">
                <label>Planned Production Units <span className="required">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 10000"
                  value={form.planned_production_units}
                  onChange={(e) => set('planned_production_units', e.target.value)}
                  className={errors.planned_production_units ? 'input-error' : ''}
                />
                {errors.planned_production_units && (
                  <span className="field-error">{errors.planned_production_units}</span>
                )}
              </div>
            </div>

            {/* Rate preview */}
            {ratePreview && (
              <div className="or-rate-preview">
                <span className="or-rate-preview__label">Computed Rate / Unit</span>
                <span className="or-rate-preview__value">
                  {form.currency} {ratePreview}
                </span>
              </div>
            )}

            {/* Currency */}
            <div className="form-group" style={{ maxWidth: 160 }}>
              <label>Currency <span className="required">*</span></label>
              <select
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="ZAR">ZAR</option>
              </select>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows={2}
                placeholder="Optional notes…"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Rate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OverheadRateModal;
