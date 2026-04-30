import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supplierService } from '../../services/suppliers_services';
import type {
  CreateSupplierDTO,
  SupplierType,
  PaymentTerms,
  DeliveryDay,
  DeliveryMethod,
  SupplierRating,
} from '../../types/models';
import '../../styles/procurement.css';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const SUPPLIER_TYPE_OPTIONS: { value: SupplierType; label: string }[] = [
  { value: 'MANUFACTURER', label: 'Manufacturer' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'AGENT', label: 'Agent' },
  { value: 'INDIVIDUAL', label: 'Individual' },
];

const PAYMENT_TERMS_OPTIONS: { value: PaymentTerms; label: string }[] = [
  { value: 'NET_30', label: 'Net 30' },
  { value: 'NET_60', label: 'Net 60' },
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'EOM', label: 'End of Month' },
  { value: 'PREPAID', label: 'Prepaid' },
  { value: 'IMMEDIATE', label: 'Immediate' },
];

const DELIVERY_METHOD_OPTIONS: { value: DeliveryMethod; label: string }[] = [
  { value: 'OWN_TRANSPORT', label: 'Own Transport' },
  { value: 'COURIER', label: 'Courier' },
  { value: 'COLLECT', label: 'Collect' },
];

const DELIVERY_DAYS: DeliveryDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const DAY_LABELS: Record<DeliveryDay, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

// ──────────────────────────────────────────────
// Form state shape
// ──────────────────────────────────────────────

interface FormState {
  // Basic Info
  name: string;
  supplier_type: SupplierType | '';
  // Registration
  registration_number: string;
  tax_number: string;
  // Contact Details
  primary_email: string;
  secondary_email: string;
  primary_phone: string;
  alternate_phone: string;
  website: string;
  // Address
  address: string;
  city: string;
  country: string;
  // Financial
  currency: string;
  payment_terms: PaymentTerms | '';
  credit_limit: string;
  minimum_order_value: string;
  can_supply_on_credit: boolean;
  bank_name: string;
  bank_branch: string;
  bank_account_number: string;
  // Delivery & Logistics
  default_lead_time_days: string;
  delivery_days: DeliveryDay[];
  delivery_method: DeliveryMethod | '';
  delivery_radius_km: string;
  // Notes
  internal_notes: string;
  rating: number;
}

const INITIAL_FORM: FormState = {
  name: '',
  supplier_type: '',
  registration_number: '',
  tax_number: '',
  primary_email: '',
  secondary_email: '',
  primary_phone: '',
  alternate_phone: '',
  website: '',
  address: '',
  city: '',
  country: '',
  currency: '',
  payment_terms: '',
  credit_limit: '',
  minimum_order_value: '',
  can_supply_on_credit: false,
  bank_name: '',
  bank_branch: '',
  bank_account_number: '',
  default_lead_time_days: '',
  delivery_days: [],
  delivery_method: '',
  delivery_radius_km: '',
  internal_notes: '',
  rating: 0,
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const CreateSupplierPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ─── Field helpers ────────────────────────────

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleDeliveryDay = (day: DeliveryDay) => {
    setForm((prev) => {
      const days = prev.delivery_days.includes(day)
        ? prev.delivery_days.filter((d) => d !== day)
        : [...prev.delivery_days, day];
      return { ...prev, delivery_days: days };
    });
  };

  // ─── Validation ───────────────────────────────

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Supplier name is required.';
    if (!form.primary_email.trim()) newErrors.primary_email = 'Primary email is required.';
    if (!form.primary_phone.trim()) newErrors.primary_phone = 'Primary phone is required.';
    if (!form.currency.trim()) newErrors.currency = 'Currency is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ───────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Read company from localStorage
      const savedUser = localStorage.getItem('erp_user');
      if (!savedUser) throw new Error('User session not found. Please log in again.');
      const user = JSON.parse(savedUser);
      const companyId: string =
        typeof user.company === 'string' ? user.company : user.company?.id;
      if (!companyId) throw new Error('Company not found in user session.');

      const dto: CreateSupplierDTO = {
        company: companyId,
        name: form.name.trim(),
        primary_email: form.primary_email.trim(),
        primary_phone: form.primary_phone.trim(),
        currency: form.currency.trim(),
      };

      // Optional fields — only include when non-empty
      if (form.supplier_type) dto.supplier_type = form.supplier_type as SupplierType;
      if (form.registration_number) dto.registration_number = form.registration_number.trim();
      if (form.tax_number) dto.tax_number = form.tax_number.trim();
      if (form.secondary_email) dto.secondary_email = form.secondary_email.trim();
      if (form.alternate_phone) dto.alternate_phone = form.alternate_phone.trim();
      if (form.website) dto.website = form.website.trim();
      if (form.address) dto.address = form.address.trim();
      if (form.city) dto.city = form.city.trim();
      if (form.country) dto.country = form.country.trim();
      if (form.payment_terms) dto.payment_terms = form.payment_terms as PaymentTerms;
      if (form.credit_limit) dto.credit_limit = form.credit_limit;
      if (form.minimum_order_value) dto.minimum_order_value = form.minimum_order_value;
      if (form.bank_name) dto.bank_name = form.bank_name.trim();
      if (form.bank_branch) dto.bank_branch = form.bank_branch.trim();
      if (form.bank_account_number) dto.bank_account_number = form.bank_account_number.trim();
      if (form.default_lead_time_days)
        dto.default_lead_time_days = parseInt(form.default_lead_time_days, 10);
      if (form.delivery_days.length > 0) dto.delivery_days = form.delivery_days;
      if (form.delivery_method) dto.delivery_method = form.delivery_method as DeliveryMethod;
      if (form.delivery_radius_km) dto.delivery_radius_km = form.delivery_radius_km;
      if (form.internal_notes) dto.internal_notes = form.internal_notes.trim();
      if (form.rating > 0) dto.rating = form.rating as SupplierRating;
      dto.can_supply_on_credit = form.can_supply_on_credit;

      await supplierService.createSupplier(dto);
      navigate('/procurement/suppliers');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create supplier. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────

  return (
    <div className="procurement-page" style={{ overflowY: 'auto' }}>
      <div style={{ maxWidth: 800, padding: '0 0 40px 0' }}>
        {/* Page Header */}
        <div className="procurement-page-header" style={{ marginBottom: '1.5rem' }}>
          <div className="procurement-page-header__left">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/procurement/suppliers')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back to Suppliers
            </button>
            <h1>Add Supplier</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Suppliers / New
            </p>
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <div
            className="error-banner"
            style={{ marginBottom: '1rem', padding: '12px 16px', borderRadius: 8 }}
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="create-form">

            {/* ── Card 1: Basic Info ─────────────────── */}
            <div className="form-card">
              <h2 className="form-card__title">Basic Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    Supplier Name <span className="required">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. Acme Bakery Supplies Ltd"
                  />
                  {errors.name && <div className="field-error">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="supplier_type">Supplier Type</label>
                  <select
                    id="supplier_type"
                    value={form.supplier_type}
                    onChange={(e) => setField('supplier_type', e.target.value as SupplierType | '')}
                  >
                    <option value="">— Select type —</option>
                    {SUPPLIER_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Card 2: Registration ──────────────── */}
            <div className="form-card">
              <h2 className="form-card__title">Registration Details</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="registration_number">Registration Number</label>
                  <input
                    id="registration_number"
                    type="text"
                    value={form.registration_number}
                    onChange={(e) => setField('registration_number', e.target.value)}
                    placeholder="e.g. COMP-12345"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tax_number">Tax / VAT Number</label>
                  <input
                    id="tax_number"
                    type="text"
                    value={form.tax_number}
                    onChange={(e) => setField('tax_number', e.target.value)}
                    placeholder="e.g. TAX-98765"
                  />
                </div>
              </div>
            </div>

            {/* ── Card 3: Contact Details ───────────── */}
            <div className="form-card">
              <h2 className="form-card__title">Contact Details</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="primary_email">
                    Primary Email <span className="required">*</span>
                  </label>
                  <input
                    id="primary_email"
                    type="email"
                    value={form.primary_email}
                    onChange={(e) => setField('primary_email', e.target.value)}
                    placeholder="orders@supplier.com"
                  />
                  {errors.primary_email && (
                    <div className="field-error">{errors.primary_email}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="secondary_email">Secondary Email</label>
                  <input
                    id="secondary_email"
                    type="email"
                    value={form.secondary_email}
                    onChange={(e) => setField('secondary_email', e.target.value)}
                    placeholder="accounts@supplier.com"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="primary_phone">
                    Primary Phone <span className="required">*</span>
                  </label>
                  <input
                    id="primary_phone"
                    type="tel"
                    value={form.primary_phone}
                    onChange={(e) => setField('primary_phone', e.target.value)}
                    placeholder="+263 77 123 4567"
                  />
                  {errors.primary_phone && (
                    <div className="field-error">{errors.primary_phone}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="alternate_phone">Alternate Phone</label>
                  <input
                    id="alternate_phone"
                    type="tel"
                    value={form.alternate_phone}
                    onChange={(e) => setField('alternate_phone', e.target.value)}
                    placeholder="+263 71 765 4321"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setField('website', e.target.value)}
                  placeholder="https://www.supplier.com"
                />
              </div>
            </div>

            {/* ── Card 4: Address ───────────────────── */}
            <div className="form-card">
              <h2 className="form-card__title">Address</h2>
              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="123 Industrial Road"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                    placeholder="Harare"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    type="text"
                    value={form.country}
                    onChange={(e) => setField('country', e.target.value)}
                    placeholder="Zimbabwe"
                  />
                </div>
              </div>
            </div>

            {/* ── Card 5: Financial ─────────────────── */}
            <div className="form-card">
              <h2 className="form-card__title">Financial</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currency">
                    Currency <span className="required">*</span>
                  </label>
                  <input
                    id="currency"
                    type="text"
                    value={form.currency}
                    onChange={(e) => setField('currency', e.target.value.toUpperCase())}
                    placeholder="USD"
                    maxLength={3}
                  />
                  {errors.currency && <div className="field-error">{errors.currency}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="payment_terms">Payment Terms</label>
                  <select
                    id="payment_terms"
                    value={form.payment_terms}
                    onChange={(e) =>
                      setField('payment_terms', e.target.value as PaymentTerms | '')
                    }
                  >
                    <option value="">— Select terms —</option>
                    {PAYMENT_TERMS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="credit_limit">Credit Limit</label>
                  <input
                    id="credit_limit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.credit_limit}
                    onChange={(e) => setField('credit_limit', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="minimum_order_value">Minimum Order Value</label>
                  <input
                    id="minimum_order_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minimum_order_value}
                    onChange={(e) => setField('minimum_order_value', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.can_supply_on_credit}
                    onChange={(e) => setField('can_supply_on_credit', e.target.checked)}
                  />
                  Can supply on credit
                </label>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bank_name">Bank Name</label>
                  <input
                    id="bank_name"
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => setField('bank_name', e.target.value)}
                    placeholder="FBC Bank"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bank_branch">Bank Branch</label>
                  <input
                    id="bank_branch"
                    type="text"
                    value={form.bank_branch}
                    onChange={(e) => setField('bank_branch', e.target.value)}
                    placeholder="Harare CBD"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="bank_account_number">Bank Account Number</label>
                <input
                  id="bank_account_number"
                  type="text"
                  value={form.bank_account_number}
                  onChange={(e) => setField('bank_account_number', e.target.value)}
                  placeholder="1234567890"
                />
              </div>
            </div>

            {/* ── Card 6: Delivery & Logistics ─────── */}
            <div className="form-card">
              <h2 className="form-card__title">Delivery &amp; Logistics</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="default_lead_time_days">Default Lead Time (days)</label>
                  <input
                    id="default_lead_time_days"
                    type="number"
                    min="0"
                    value={form.default_lead_time_days}
                    onChange={(e) => setField('default_lead_time_days', e.target.value)}
                    placeholder="7"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="delivery_method">Delivery Method</label>
                  <select
                    id="delivery_method"
                    value={form.delivery_method}
                    onChange={(e) =>
                      setField('delivery_method', e.target.value as DeliveryMethod | '')
                    }
                  >
                    <option value="">— Select method —</option>
                    {DELIVERY_METHOD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="delivery_radius_km">Delivery Radius (km)</label>
                <input
                  id="delivery_radius_km"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.delivery_radius_km}
                  onChange={(e) => setField('delivery_radius_km', e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="form-group">
                <label>Delivery Days</label>
                <div className="delivery-day-pills">
                  {DELIVERY_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`delivery-day-pill${form.delivery_days.includes(day) ? ' selected' : ''}`}
                      onClick={() => toggleDeliveryDay(day)}
                      aria-pressed={form.delivery_days.includes(day)}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Card 7: Notes & Rating ────────────── */}
            <div className="form-card">
              <h2 className="form-card__title">Notes &amp; Rating</h2>
              <div className="form-group">
                <label>Supplier Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`rating-star${form.rating >= star ? ' filled' : ''}`}
                      onClick={() => setField('rating', form.rating === star ? 0 : star)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <span style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: 4 }}>
                      {form.rating} / 5
                    </span>
                  )}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="internal_notes">Internal Notes</label>
                <textarea
                  id="internal_notes"
                  rows={4}
                  value={form.internal_notes}
                  onChange={(e) => setField('internal_notes', e.target.value)}
                  placeholder="Any internal notes about this supplier…"
                />
              </div>
            </div>

            {/* ── Form Actions ──────────────────────── */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/procurement/suppliers')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving…' : 'Create Supplier'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplierPage;
