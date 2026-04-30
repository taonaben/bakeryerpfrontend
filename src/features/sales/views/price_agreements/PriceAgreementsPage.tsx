import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Tag, Plus, X, Search } from 'lucide-react';
import { useCustomersStore } from '../../stores/customersStore';
import { useProductStore } from '../../../../core/products/stores/productStore';
import type { PricingAgreement, CreatePricingAgreementDTO } from '../../types/customers_models';
import type { product } from '../../../../core/products/types/models';
import '../../../procurement/styles/procurement.css';
import '../../styles/sales.css';

// ── helpers ───────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const isExpired = (agreement: PricingAgreement): boolean => {
  if (!agreement.valid_until) return false;
  return new Date(agreement.valid_until) < new Date();
};

// ── status badge ──────────────────────────────
const AgreementStatus: React.FC<{ agreement: PricingAgreement }> = ({ agreement }) => {
  if (!agreement.is_active)
    return <span className="badge badge-inactive">Inactive</span>;
  if (isExpired(agreement))
    return <span className="badge badge-overdue">Expired</span>;
  return <span className="badge badge-active">Active</span>;
};

// ══════════════════════════════════════════════
// New Agreement Panel
// ══════════════════════════════════════════════
interface NewAgreementPanelProps {
  open: boolean;
  onClose: () => void;
  customers: { id: string; name: string; company_name: string }[];
  products: product[];
  onSaved: () => void;
}

const NewAgreementPanel: React.FC<NewAgreementPanelProps> = ({
  open,
  onClose,
  customers,
  products,
  onSaved,
}) => {
  const { createPricingAgreement, isSubmitting, error, clearError } = useCustomersStore();

  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [minQty, setMinQty] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setCustomerId(''); setProductId(''); setUnitPrice('');
      setMinQty(''); setValidFrom(''); setValidUntil('');
      setFieldErrors({}); clearError();
    }
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!customerId) e.customerId = 'Required';
    if (!productId) e.productId = 'Required';
    if (!unitPrice || parseFloat(unitPrice) <= 0) e.unitPrice = 'Must be > 0';
    if (!validFrom) e.validFrom = 'Required';
    if (validUntil && validFrom && validUntil < validFrom)
      e.validUntil = 'Must be after start date';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      const dto: CreatePricingAgreementDTO = {
        product: productId,
        unit_price: unitPrice,
        valid_from: validFrom,
      };
      if (minQty) dto.min_order_quantity = minQty;
      if (validUntil) dto.valid_until = validUntil;
      await createPricingAgreement(customerId, dto);
      onSaved();
      onClose();
    } catch {
      // error shown via store
    }
  };

  return (
    <>
      {open && <div className="panel-backdrop" onClick={onClose} />}
      <div className={`create-customer-panel${open ? ' open' : ''}`}>
        <div className="panel-header">
          <h2>New Price Agreement</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="panel-body">
          {error && (
            <div className="error-banner" style={{ marginBottom: 16 }}>
              {error}
              <button onClick={clearError} type="button">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} id="new-agreement-form">
            <div className="form-group">
              <label>Customer <span className="required">*</span></label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company_name ? ` (${c.company_name})` : ''}
                  </option>
                ))}
              </select>
              {fieldErrors.customerId && <p className="field-error">{fieldErrors.customerId}</p>}
            </div>

            <div className="form-group">
              <label>Product <span className="required">*</span></label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
              {fieldErrors.productId && <p className="field-error">{fieldErrors.productId}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Agreed Unit Price <span className="required">*</span></label>
                <input
                  type="number" min="0" step="0.01"
                  value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                />
                {fieldErrors.unitPrice && <p className="field-error">{fieldErrors.unitPrice}</p>}
              </div>
              <div className="form-group">
                <label>Min Order Qty</label>
                <input
                  type="number" min="0" step="any"
                  value={minQty} onChange={(e) => setMinQty(e.target.value)}
                  placeholder="—"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Valid From <span className="required">*</span></label>
                <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                {fieldErrors.validFrom && <p className="field-error">{fieldErrors.validFrom}</p>}
              </div>
              <div className="form-group">
                <label>Valid Until</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                {fieldErrors.validUntil && <p className="field-error">{fieldErrors.validUntil}</p>}
              </div>
            </div>
          </form>
        </div>

        <div className="panel-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="new-agreement-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Agreement'}
          </button>
        </div>
      </div>
    </>
  );
};

// ══════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════
const PriceAgreementsPage: React.FC = () => {
  const {
    items: customers,
    pricingMap,
    fetchAll: fetchCustomers,
    fetchPricingAgreements,
    deactivatePricingAgreement,
    isLoading,
    error,
  } = useCustomersStore();

  const { products, fetchProducts } = useProductStore();

  const customersList = Array.isArray(customers) ? customers : [];
  const productsList = Array.isArray(products) ? products : [];

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
  const [customerFilter, setCustomerFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);

  // Load all customers + their pricing agreements
  const loadAll = useCallback(async () => {
    await fetchCustomers(undefined, false);
    const list = useCustomersStore.getState().items;
    if (Array.isArray(list)) {
      await Promise.all(list.map((c) => fetchPricingAgreements(c.id)));
    }
  }, [fetchCustomers, fetchPricingAgreements]);

  useEffect(() => {
    fetchProducts();
    loadAll();
  }, []);

  // Flatten all agreements from pricingMap, attach customer name
  const allAgreements = useMemo(() => {
    const result: (PricingAgreement & { customer_name: string; customer_company: string })[] = [];
    for (const customer of customersList) {
      const agreements = pricingMap[customer.id];
      if (Array.isArray(agreements)) {
        for (const a of agreements) {
          result.push({
            ...a,
            customer_name: customer.name,
            customer_company: customer.company_name || '',
          });
        }
      }
    }
    return result;
  }, [customersList, pricingMap]);

  // Apply filters
  const filtered = useMemo(() => {
    return allAgreements.filter((a) => {
      // Status filter
      if (statusFilter === 'active' && (!a.is_active || isExpired(a))) return false;
      if (statusFilter === 'expired' && !isExpired(a)) return false;
      if (statusFilter === 'inactive' && a.is_active) return false;

      // Customer filter
      if (customerFilter && a.customer !== customerFilter) return false;

      // Product filter
      if (productFilter && a.product !== productFilter) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !a.customer_name.toLowerCase().includes(q) &&
          !a.product_name.toLowerCase().includes(q)
        ) return false;
      }

      return true;
    });
  }, [allAgreements, statusFilter, customerFilter, productFilter, search]);

  const handleDeactivate = async (customerId: string, agreementId: string) => {
    if (!window.confirm('Deactivate this pricing agreement?')) return;
    try {
      await deactivatePricingAgreement(customerId, agreementId);
    } catch { /* store holds error */ }
  };

  const STATUS_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Expired', value: 'expired' },
    { label: 'Inactive', value: 'inactive' },
  ] as const;

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        {/* Header */}
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <h1>Price Agreements</h1>
            <p className="procurement-page-header__breadcrumb">Sales / Price Agreements</p>
          </div>
          <div className="procurement-page-header__actions">
            <button
              className="btn btn-primary"
              onClick={() => setPanelOpen(true)}
              type="button"
            >
              <Plus size={16} /> New Agreement
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="procurement-toolbar">
          <div className="procurement-toolbar__tabs">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                className={`status-tab${statusFilter === t.value ? ' active' : ''}`}
                onClick={() => setStatusFilter(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filters row */}
          <div className="pa-filters">
            {/* Search */}
            <div className="pa-search">
              <Search size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer or product…"
              />
            </div>

            {/* Customer filter */}
            <select
              className="pa-filter-select"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <option value="">All Customers</option>
              {customersList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Product filter */}
            <select
              className="pa-filter-select"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option value="">All Products</option>
              {productsList.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="procurement-content">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={loadAll} type="button">Retry</button>
          </div>
        )}

        {isLoading && allAgreements.length === 0 ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading agreements…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state-card" style={{ marginTop: 24 }}>
            <Tag size={36} style={{ marginBottom: 12, color: '#94a3b8' }} />
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>No pricing agreements found</p>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              {search || customerFilter || productFilter || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create customer-specific prices that override default pricing rules'}
            </p>
          </div>
        ) : (
          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Min Qty</th>
                  <th>Valid From</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.customer_name}</div>
                      {a.customer_company && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{a.customer_company}</div>
                      )}
                    </td>
                    <td>{a.product_name}</td>
                    <td className="table-amount">
                      ${parseFloat(a.unit_price).toLocaleString('en-US', {
                        minimumFractionDigits: 2, maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="table-amount">
                      {a.min_order_quantity && parseFloat(a.min_order_quantity) > 0
                        ? parseFloat(a.min_order_quantity).toLocaleString()
                        : '—'}
                    </td>
                    <td>{fmtDate(a.valid_from)}</td>
                    <td>{a.valid_until ? fmtDate(a.valid_until) : <span style={{ color: '#94a3b8' }}>No expiry</span>}</td>
                    <td><AgreementStatus agreement={a} /></td>
                    <td>
                      {a.is_active && (
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '0.78rem', padding: '4px 10px', color: '#ef4444', borderColor: '#fecaca' }}
                          onClick={() => handleDeactivate(a.customer, a.id)}
                          type="button"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Agreement Panel */}
      <NewAgreementPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        customers={customersList}
        products={productsList}
        onSaved={loadAll}
      />
    </div>
  );
};

export default PriceAgreementsPage;
