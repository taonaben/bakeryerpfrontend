import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSupplierDetailStore } from '../../stores/supplierDetailStore';
import type {
  UpdateSupplierDTO,
  SupplierType,
  PaymentTerms,
  DeliveryDay,
  DeliveryMethod,
  SupplierRating,
  Supplier,
} from '../../types/models';
import '../../styles/procurement.css';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const SUPPLIER_TYPE_OPTIONS: { value: SupplierType; label: string }[] = [
  { value: 'MANUFACTURER', label: 'Manufacturer' },
  { value: 'WHOLESALER', label: 'Wholesaler' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'RETAILER', label: 'Retailer' },
  { value: 'SERVICE_PROVIDER', label: 'Service Provider' },
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
  { value: 'THIRD_PARTY', label: 'Third-Party Courier' },
  { value: 'PICKUP', label: 'Pickup' },
];

const DELIVERY_DAYS: DeliveryDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const DAY_LABELS: Record<DeliveryDay, string> = {
  MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu',
  FRI: 'Fri', SAT: 'Sat', SUN: 'Sun',
};

// ─────────────────────────────────────────────
// Form state (all string values for controlled inputs)
// ─────────────────────────────────────────────

interface FormState {
  name: string;
  supplier_type: SupplierType | '';
  registration_number: string;
  tax_number: string;
  primary_email: string;
  secondary_email: string;
  primary_phone: string;
  alternate_phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  payment_terms: PaymentTerms | '';
  credit_limit: string;
  minimum_order_value: string;
  can_supply_on_credit: boolean;
  bank_name: string;
  bank_branch: string;
  bank_account_number: string;
  default_lead_time_days: string;
  delivery_days: DeliveryDay[];
  delivery_method: DeliveryMethod | '';
  delivery_radius_km: string;
  internal_notes: string;
  rating: number;
}

const supplierToForm = (s: Supplier): FormState => ({
  name: s.name ?? '',
  supplier_type: (s.supplier_type as SupplierType) ?? '',
  registration_number: s.registration_number ?? '',
  tax_number: s.tax_number ?? '',
  primary_email: s.primary_email ?? '',
  secondary_email: s.secondary_email ?? '',
  primary_phone: s.primary_phone ?? '',
  alternate_phone: s.alternate_phone ?? '',
  website: s.website ?? '',
  address: s.address ?? '',
  city: s.city ?? '',
  country: s.country ?? '',
  currency: s.currency ?? '',
  payment_terms: (s.payment_terms as PaymentTerms) ?? '',
  credit_limit: s.credit_limit != null ? String(s.credit_limit) : '',
  minimum_order_value: s.minimum_order_value != null ? String(s.minimum_order_value) : '',
  can_supply_on_credit: s.can_supply_on_credit ?? false,
  bank_name: s.bank_name ?? '',
  bank_branch: s.bank_branch ?? '',
  bank_account_number: s.bank_account_number ?? '',
  default_lead_time_days: s.default_lead_time_days != null ? String(s.default_lead_time_days) : '',
  delivery_days: Array.isArray(s.delivery_days) ? [...s.delivery_days] : [],
  delivery_method: (s.delivery_method as DeliveryMethod) ?? '',
  delivery_radius_km: s.delivery_radius_km != null ? String(s.delivery_radius_km) : '',
  internal_notes: s.internal_notes ?? '',
  rating: s.rating ?? 0,
});

// Only send fields that actually changed
const buildPatch = (original: Supplier, form: FormState): UpdateSupplierDTO => {
  const patch: UpdateSupplierDTO = {};

  if (form.name.trim() !== original.name) patch.name = form.name.trim();
  if (form.supplier_type !== original.supplier_type)
    patch.supplier_type = (form.supplier_type as SupplierType) || undefined;
  if (form.registration_number !== (original.registration_number ?? ''))
    patch.registration_number = form.registration_number;
  if (form.tax_number !== (original.tax_number ?? ''))
    patch.tax_number = form.tax_number;
  if (form.primary_email.trim() !== original.primary_email)
    patch.primary_email = form.primary_email.trim();
  if (form.secondary_email !== (original.secondary_email ?? ''))
    patch.secondary_email = form.secondary_email;
  if (form.primary_phone.trim() !== original.primary_phone)
    patch.primary_phone = form.primary_phone.trim();
  if (form.alternate_phone !== (original.alternate_phone ?? ''))
    patch.alternate_phone = form.alternate_phone;
  if (form.website !== (original.website ?? '')) patch.website = form.website;
  if (form.address !== (original.address ?? '')) patch.address = form.address;
  if (form.city !== (original.city ?? '')) patch.city = form.city;
  if (form.country !== (original.country ?? '')) patch.country = form.country;
  if (form.currency.trim().toUpperCase() !== original.currency)
    patch.currency = form.currency.trim().toUpperCase();
  if (form.payment_terms !== (original.payment_terms ?? ''))
    patch.payment_terms = (form.payment_terms as PaymentTerms) || undefined;
  if (form.credit_limit !== String(original.credit_limit ?? ''))
    patch.credit_limit = form.credit_limit;
  if (form.minimum_order_value !== String(original.minimum_order_value ?? ''))
    patch.minimum_order_value = form.minimum_order_value;
  if (form.can_supply_on_credit !== original.can_supply_on_credit)
    patch.can_supply_on_credit = form.can_supply_on_credit;
  if (form.bank_name !== (original.bank_name ?? '')) patch.bank_name = form.bank_name;
  if (form.bank_branch !== (original.bank_branch ?? '')) patch.bank_branch = form.bank_branch;
  if (form.bank_account_number !== (original.bank_account_number ?? ''))
    patch.bank_account_number = form.bank_account_number;
  if (form.default_lead_time_days !== String(original.default_lead_time_days ?? ''))
    patch.default_lead_time_days = form.default_lead_time_days
      ? parseInt(form.default_lead_time_days, 10)
      : undefined;
  const sortedForm = [...form.delivery_days].sort().join(',');
  const sortedOrig = [...(original.delivery_days ?? [])].sort().join(',');
  if (sortedForm !== sortedOrig) patch.delivery_days = form.delivery_days;
  if (form.delivery_method !== (original.delivery_method ?? ''))
    patch.delivery_method = (form.delivery_method as DeliveryMethod) || undefined;
  if (form.delivery_radius_km !== String(original.delivery_radius_km ?? ''))
    patch.delivery_radius_km = form.delivery_radius_km;
  if (form.internal_notes !== (original.internal_notes ?? ''))
    patch.internal_notes = form.internal_notes;
  if (form.rating !== original.rating && form.rating > 0)
    patch.rating = form.rating as SupplierRating;

  return patch;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const EditSupplierPage: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();

  const supplier = useSupplierDetailStore((s) => s.supplier);
  const isLoading = useSupplierDetailStore((s) => s.isLoading);
  const isUpdating = useSupplierDetailStore((s) => s.isUpdating);
  const updateError = useSupplierDetailStore((s) => s.updateError);
  const fetchSupplier = useSupplierDetailStore((s) => s.fetchSupplier);
  const patchSupplier = useSupplierDetailStore((s) => s.patchSupplier);

  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialise form from store; fetch if not loaded yet
  useEffect(() => {
    if (!supplierId) { navigate('/procurement/suppliers'); return; }
    if (supplier && supplier.id === supplierId) {
      setForm(supplierToForm(supplier));
    } else {
      fetchSupplier(supplierId);
    }
  }, [supplierId, supplier, fetchSupplier, navigate]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const toggleDeliveryDay = (day: DeliveryDay) => {
    setForm((prev) => {
      if (!prev) return prev;
      const days = prev.delivery_days.includes(day)
        ? prev.delivery_days.filter((d) => d !== day)
        : [...prev.delivery_days, day];
      return { ...prev, delivery_days: days };
    });
  };

  const validate = (): boolean => {
    if (!form) return false;
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Supplier name is required.';
    if (!form.primary_email.trim()) errs.primary_email = 'Primary email is required.';
    if (!form.primary_phone.trim()) errs.primary_phone = 'Primary phone is required.';
    if (!form.currency.trim()) errs.currency = 'Currency is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !supplier || !supplierId) return;
    if (!validate()) return;

    const patch = buildPatch(supplier, form);
    // Nothing changed — just navigate back
    if (Object.keys(patch).length === 0) {
      navigate(`/procurement/suppliers/${supplierId}`);
      return;
    }

    try {
      await patchSupplier(supplierId, patch);
      navigate(`/procurement/suppliers/${supplierId}`);
    } catch {
      // updateError shown via banner
    }
  };

  const handleCancel = () => navigate(`/procurement/suppliers/${supplierId}`);

  // ── Loading state ──
  if (isLoading || !form) {
    return (
      <div className="procurement-page">
        <div style={{ padding: '40px', color: '#6b7280' }}>Loading supplier…</div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="procurement-page" style={{ overflowY: 'auto' }}>
      <div style={{ maxWidth: 800, padding: '0 0 40px 0' }}>

        {/* Header */}
        <div className="procurement-page-header" style={{ marginBottom: '1.5rem' }}>
          <div className="procurement-page-header__left">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back to Supplier
            </button>
            <h1>Edit Supplier</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Suppliers / {supplier?.name ?? '…'} / Edit
            </p>
          </div>
        </div>

        {updateError && (
          <div className="error-banner" style={{ marginBottom: '1rem', padding: '12px 16px', borderRadius: 8 }}>
            {updateError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="create-form">

            {/* ── Card 1: Basic Info ── */}
            <div className="form-card">
              <h2 className="form-card__title">Basic Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-name">
                    Supplier Name <span className="required">*</span>
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                  {errors.name && <div className="field-error">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-supplier-type">Supplier Type</label>
                  <select
                    id="edit-supplier-type"
                    value={form.supplier_type}
                    onChange={(e) => setField('supplier_type', e.target.value as SupplierType | '')}
                  >
                    <option value="">— Select type —</option>
                    {SUPPLIER_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Card 2: Registration ── */}
            <div className="form-card">
              <h2 className="form-card__title">Registration Details</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-reg">Registration Number</label>
                  <input
                    id="edit-reg"
                    type="text"
                    value={form.registration_number}
                    onChange={(e) => setField('registration_number', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-tax">Tax / VAT Number</label>
                  <input
                    id="edit-tax"
                    type="text"
                    value={form.tax_number}
                    onChange={(e) => setField('tax_number', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ── Card 3: Contact Details ── */}
            <div className="form-card">
              <h2 className="form-card__title">Contact Details</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-email">
                    Primary Email <span className="required">*</span>
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    value={form.primary_email}
                    onChange={(e) => setField('primary_email', e.target.value)}
                  />
                  {errors.primary_email && <div className="field-error">{errors.primary_email}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-email2">Secondary Email</label>
                  <input
                    id="edit-email2"
                    type="email"
                    value={form.secondary_email}
                    onChange={(e) => setField('secondary_email', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-phone">
                    Primary Phone <span className="required">*</span>
                  </label>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={form.primary_phone}
                    onChange={(e) => setField('primary_phone', e.target.value)}
                  />
                  {errors.primary_phone && <div className="field-error">{errors.primary_phone}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-phone2">Alternate Phone</label>
                  <input
                    id="edit-phone2"
                    type="tel"
                    value={form.alternate_phone}
                    onChange={(e) => setField('alternate_phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-website">Website</label>
                <input
                  id="edit-website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setField('website', e.target.value)}
                />
              </div>
            </div>

            {/* ── Card 4: Address ── */}
            <div className="form-card">
              <h2 className="form-card__title">Address</h2>
              <div className="form-group">
                <label htmlFor="edit-address">Street Address</label>
                <input
                  id="edit-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-city">City</label>
                  <input
                    id="edit-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-country">Country</label>
                  <input
                    id="edit-country"
                    type="text"
                    value={form.country}
                    onChange={(e) => setField('country', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ── Card 5: Financial ── */}
            <div className="form-card">
              <h2 className="form-card__title">Financial</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-currency">
                    Currency <span className="required">*</span>
                  </label>
                  <input
                    id="edit-currency"
                    type="text"
                    value={form.currency}
                    onChange={(e) => setField('currency', e.target.value.toUpperCase())}
                    maxLength={3}
                  />
                  {errors.currency && <div className="field-error">{errors.currency}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-payment-terms">Payment Terms</label>
                  <select
                    id="edit-payment-terms"
                    value={form.payment_terms}
                    onChange={(e) => setField('payment_terms', e.target.value as PaymentTerms | '')}
                  >
                    <option value="">— Select terms —</option>
                    {PAYMENT_TERMS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-credit-limit">Credit Limit</label>
                  <input
                    id="edit-credit-limit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.credit_limit}
                    onChange={(e) => setField('credit_limit', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-min-order">Minimum Order Value</label>
                  <input
                    id="edit-min-order"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minimum_order_value}
                    onChange={(e) => setField('minimum_order_value', e.target.value)}
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
                  <label htmlFor="edit-bank">Bank Name</label>
                  <input
                    id="edit-bank"
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => setField('bank_name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-branch">Bank Branch</label>
                  <input
                    id="edit-branch"
                    type="text"
                    value={form.bank_branch}
                    onChange={(e) => setField('bank_branch', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-account">Bank Account Number</label>
                <input
                  id="edit-account"
                  type="text"
                  value={form.bank_account_number}
                  onChange={(e) => setField('bank_account_number', e.target.value)}
                />
              </div>
            </div>

            {/* ── Card 6: Delivery & Logistics ── */}
            <div className="form-card">
              <h2 className="form-card__title">Delivery &amp; Logistics</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-lead-time">Default Lead Time (days)</label>
                  <input
                    id="edit-lead-time"
                    type="number"
                    min="0"
                    value={form.default_lead_time_days}
                    onChange={(e) => setField('default_lead_time_days', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-delivery-method">Delivery Method</label>
                  <select
                    id="edit-delivery-method"
                    value={form.delivery_method}
                    onChange={(e) => setField('delivery_method', e.target.value as DeliveryMethod | '')}
                  >
                    <option value="">— Select method —</option>
                    {DELIVERY_METHOD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-radius">Delivery Radius (km)</label>
                <input
                  id="edit-radius"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.delivery_radius_km}
                  onChange={(e) => setField('delivery_radius_km', e.target.value)}
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

            {/* ── Card 7: Notes & Rating ── */}
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
                <label htmlFor="edit-notes">Internal Notes</label>
                <textarea
                  id="edit-notes"
                  rows={4}
                  value={form.internal_notes}
                  onChange={(e) => setField('internal_notes', e.target.value)}
                />
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSupplierPage;
