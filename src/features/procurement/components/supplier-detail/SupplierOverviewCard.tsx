import React from 'react';
import type { Supplier, DeliveryMethod, PaymentTerms } from '../../types/models';

const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  NET_30: 'Net 30',
  NET_60: 'Net 60',
  COD: 'Cash on Delivery',
  EOM: 'End of Month',
  PREPAID: 'Prepaid',
  IMMEDIATE: 'Immediate',
};

const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  OWN_TRANSPORT: 'Own Transport',
  COURIER: 'Courier',
  COLLECT: 'Collect',
};

const DELIVERY_DAY_LABELS: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  MANUFACTURER: 'Manufacturer',
  WHOLESALER: 'Wholesaler',
  DISTRIBUTOR: 'Distributor',
  RETAILER: 'Retailer',
  SERVICE_PROVIDER: 'Service Provider',
};

interface SupplierOverviewCardProps {
  supplier: Supplier;
}

// Helper to render a single overview field
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="overview-item">
    <label className="overview-label">{label}</label>
    <div className="overview-value">{children || '—'}</div>
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="line-items-heading"
    style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}
  >
    {children}
  </h3>
);

const SupplierOverviewCard: React.FC<SupplierOverviewCardProps> = ({ supplier }) => {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null || amount === 0) return '—';
    return `${supplier.currency || ''} ${Number(amount).toLocaleString()}`.trim();
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span style={{ color: '#94a3b8' }}>—</span>;
    return (
      <span>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ color: i < rating ? '#f59e0b' : '#d1d5db' }}>
            ★
          </span>
        ))}
        <span style={{ marginLeft: '6px', fontSize: '0.8rem', color: '#64748b' }}>
          ({rating}/5)
        </span>
      </span>
    );
  };

  return (
    <div className="overview-card">
      {/* ── Identity ── */}
      <h3 className="line-items-heading" style={{ marginTop: 0 }}>
        Identity
      </h3>
      <div className="overview-grid">
        <Field label="Company">{supplier.company_name}</Field>
        <Field label="Supplier Type">
          {SUPPLIER_TYPE_LABELS[supplier.supplier_type] ?? supplier.supplier_type}
        </Field>
        <Field label="Registration Number">{supplier.registration_number}</Field>
        <Field label="Tax Number">{supplier.tax_number}</Field>
        {supplier.website && (
          <Field label="Website">
            <a
              href={supplier.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#566d7e' }}
            >
              {supplier.website}
            </a>
          </Field>
        )}
      </div>

      {/* ── Contact Info ── */}
      <SectionHeading>Contact Information</SectionHeading>
      <div className="overview-grid">
        <Field label="Primary Email">{supplier.primary_email}</Field>
        <Field label="Secondary Email">{supplier.secondary_email}</Field>
        <Field label="Primary Phone">{supplier.primary_phone}</Field>
        <Field label="Alternate Phone">{supplier.alternate_phone}</Field>
      </div>

      {/* ── Address ── */}
      <SectionHeading>Address</SectionHeading>
      <div className="overview-grid">
        <Field label="Address">{supplier.address}</Field>
        <Field label="City">{supplier.city}</Field>
        <Field label="Country">{supplier.country}</Field>
      </div>

      {/* ── Banking & Payment ── */}
      <SectionHeading>Banking &amp; Payment</SectionHeading>
      <div className="overview-grid">
        <Field label="Payment Terms">
          {supplier.payment_terms
            ? (PAYMENT_TERMS_LABELS[supplier.payment_terms] ?? supplier.payment_terms)
            : null}
        </Field>
        <Field label="Currency">{supplier.currency}</Field>
        <Field label="Credit Limit">{formatCurrency(supplier.credit_limit)}</Field>
        <Field label="Credit Supplied">{supplier.can_supply_on_credit ? 'Yes' : 'No'}</Field>
        <Field label="Minimum Order Value">{formatCurrency(supplier.minimum_order_value)}</Field>
        <Field label="Bank Name">{supplier.bank_name}</Field>
        <Field label="Bank Branch">{supplier.bank_branch}</Field>
        <Field label="Bank Account">{supplier.bank_account_number}</Field>
      </div>

      {/* ── Delivery ── */}
      <SectionHeading>Delivery</SectionHeading>
      <div className="overview-grid">
        <Field label="Delivery Method">
          {supplier.delivery_method
            ? (DELIVERY_METHOD_LABELS[supplier.delivery_method] ?? supplier.delivery_method)
            : null}
        </Field>
        <Field label="Default Lead Time">
          {supplier.default_lead_time_days ? `${supplier.default_lead_time_days} days` : null}
        </Field>
        <Field label="Delivery Radius">
          {supplier.delivery_radius_km ? `${supplier.delivery_radius_km} km` : null}
        </Field>

        <div className="overview-item full-width">
          <label className="overview-label">Delivery Days</label>
          <div className="overview-value">
            {supplier.delivery_days && supplier.delivery_days.length > 0 ? (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {supplier.delivery_days.map((day) => (
                  <span
                    key={day}
                    style={{
                      padding: '2px 10px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    {DELIVERY_DAY_LABELS[day] ?? day}
                  </span>
                ))}
              </div>
            ) : (
              '—'
            )}
          </div>
        </div>
      </div>

      {/* ── Internal ── */}
      <SectionHeading>Internal</SectionHeading>
      <div className="overview-grid">
        <Field label="Rating">{renderStars(supplier.rating)}</Field>

        {supplier.internal_notes && (
          <div className="overview-item full-width">
            <label className="overview-label">Internal Notes</label>
            <div className="overview-value" style={{ whiteSpace: 'pre-wrap' }}>
              {supplier.internal_notes}
            </div>
          </div>
        )}
      </div>

      {/* ── Audit ── */}
      <div className="overview-audit">
        <div className="audit-item">
          <span className="audit-label">Created:</span>
          <span className="audit-value">{formatDate(supplier.created_at)}</span>
        </div>
        {supplier.updated_at && (
          <div className="audit-item">
            <span className="audit-label">Last Updated:</span>
            <span className="audit-value">{formatDate(supplier.updated_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierOverviewCard;
