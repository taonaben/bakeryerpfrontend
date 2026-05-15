import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { CreateFiscalPeriodDTO, FiscalPeriod } from '../../types/fiscal_periods_models';

interface FiscalPeriodModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  lastPeriod: FiscalPeriod | null;
  onClose: () => void;
  onSubmit: (dto: CreateFiscalPeriodDTO) => Promise<void>;
}

const FiscalPeriodModal: React.FC<FiscalPeriodModalProps> = ({
  isOpen,
  isSubmitting,
  lastPeriod,
  onClose,
  onSubmit,
}) => {
  const expectedStart = lastPeriod ? addDays(lastPeriod.period_end, 1) : '';
  const [form, setForm] = useState({
    name: '',
    period_start: expectedStart,
    period_end: '',
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      name: '',
      period_start: expectedStart,
      period_end: '',
    });
    setValidationError('');
  }, [expectedStart, isOpen]);

  if (!isOpen) return null;

  const validate = (): string => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.period_start || !form.period_end) return 'Start date and end date are required.';
    if (dateToMs(form.period_end) < dateToMs(form.period_start)) return 'End date cannot be before start date.';
    if (expectedStart && form.period_start !== expectedStart) {
      return `New period must start on ${formatDate(expectedStart)} to avoid gaps or overlaps.`;
    }
    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      period_start: form.period_start,
      period_end: form.period_end,
    });
  };

  return (
    <>
      <div className="finance-drawer-backdrop" onClick={onClose} />
      <div className="finance-modal fiscal-period-modal" role="dialog" aria-modal="true" aria-labelledby="fiscal-period-modal-title">
        <div className="finance-drawer__header">
          <div>
            <h2 id="fiscal-period-modal-title">New Fiscal Period</h2>
            <p>Fiscal periods are immutable once created.</p>
          </div>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Close fiscal period modal">
            <X size={17} />
          </button>
        </div>

        <form className="finance-drawer__body" onSubmit={handleSubmit}>
          {lastPeriod && (
            <div className="finance-entry-banner finance-entry-banner--info">
              Last period ended: {formatDate(lastPeriod.period_end)}. New period should start: {formatDate(expectedStart)}.
            </div>
          )}

          {validationError && (
            <div className="finance-entry-banner finance-entry-banner--warning">
              {validationError}
            </div>
          )}

          <div className="finance-form-field">
            <label htmlFor="fiscal-period-name">
              Name <span className="required">*</span>
            </label>
            <input
              id="fiscal-period-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="February 2026"
              required
            />
          </div>

          <div className="finance-form-field">
            <label htmlFor="fiscal-period-start">
              Start Date <span className="required">*</span>
            </label>
            <input
              id="fiscal-period-start"
              type="date"
              value={form.period_start}
              onChange={(event) => {
                if (!expectedStart) {
                  setForm((prev) => ({ ...prev, period_start: event.target.value }));
                }
              }}
              readOnly={Boolean(expectedStart)}
              aria-describedby={expectedStart ? 'fiscal-period-start-note' : undefined}
              required
            />
            {expectedStart && (
              <span id="fiscal-period-start-note" className="finance-field-note">
                Automatically set to the day after the last period ends.
              </span>
            )}
          </div>

          <div className="finance-form-field">
            <label htmlFor="fiscal-period-end">
              End Date <span className="required">*</span>
            </label>
            <input
              id="fiscal-period-end"
              type="date"
              value={form.period_end}
              onChange={(event) => setForm((prev) => ({ ...prev, period_end: event.target.value }))}
              required
            />
          </div>

          <div className="finance-drawer__footer">
            <button className="btn btn-outline" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Period'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

function addDays(value: string, days: number): string {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function dateToMs(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default FiscalPeriodModal;
