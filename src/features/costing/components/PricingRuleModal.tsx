import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { PricingRule, UpdatePricingRuleDTO } from '../types/pricing_rules_models';

interface Props {
  rule: PricingRule;
  isSubmitting: boolean;
  onSubmit: (dto: UpdatePricingRuleDTO) => void;
  onClose: () => void;
}

const PricingRuleModal: React.FC<Props> = ({ rule, isSubmitting, onSubmit, onClose }) => {
  const [target, setTarget] = useState(rule.target_gross_margin_percentage);
  const [minimum, setMinimum] = useState(rule.minimum_margin_percentage);
  const [errors, setErrors] = useState<{ target?: string; minimum?: string }>({});

  // Live price preview
  const stdCost = parseFloat(rule.standard_cost_reference ? '0' : '0'); // cost comes from the table row
  const targetN = parseFloat(target) || 0;
  const minimumN = parseFloat(minimum) || 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = () => {
    const e: typeof errors = {};
    if (!target || isNaN(parseFloat(target))) e.target = 'Required';
    else if (targetN < 0 || targetN > 100) e.target = 'Must be 0–100';
    if (!minimum || isNaN(parseFloat(minimum))) e.minimum = 'Required';
    else if (minimumN < 0) e.minimum = 'Must be ≥ 0';
    else if (minimumN > targetN) e.minimum = 'Cannot exceed target margin';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        target_gross_margin_percentage: target,
        minimum_margin_percentage: minimum,
      });
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="pr-modal-title">
      <div className="modal-content" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div>
            <h2 id="pr-modal-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Edit Pricing Margins
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {rule.product_name}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label>Target Gross Margin % <span className="required">*</span></label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={target}
                  onChange={(e) => { setTarget(e.target.value); setErrors((v) => ({ ...v, target: undefined })); }}
                  className={errors.target ? 'input-error' : ''}
                  placeholder="e.g. 40"
                />
                {errors.target && <span className="field-error">{errors.target}</span>}
              </div>
              <div className="form-group">
                <label>Minimum Margin % <span className="required">*</span></label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={minimum}
                  onChange={(e) => { setMinimum(e.target.value); setErrors((v) => ({ ...v, minimum: undefined })); }}
                  className={errors.minimum ? 'input-error' : ''}
                  placeholder="e.g. 25"
                />
                {errors.minimum && <span className="field-error">{errors.minimum}</span>}
              </div>
            </div>

            {/* Margin band visual */}
            {targetN > 0 && minimumN >= 0 && minimumN <= targetN && (
              <div className="pr-margin-band">
                <div className="pr-margin-band__label">
                  <span>Minimum {minimumN.toFixed(1)}%</span>
                  <span>Target {targetN.toFixed(1)}%</span>
                </div>
                <div className="pr-margin-band__track">
                  <div
                    className="pr-margin-band__fill"
                    style={{ width: `${targetN}%` }}
                  />
                  <div
                    className="pr-margin-band__min-marker"
                    style={{ left: `${minimumN}%` }}
                  />
                </div>
              </div>
            )}

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
              After saving, click <strong>Recalculate</strong> on the row to update the recommended selling price against the latest standard cost.
            </p>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Margins'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PricingRuleModal;
