import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, AlertCircle, Search, UserPlus, ChevronDown } from 'lucide-react';
import { useOrdersStore } from '../../stores/ordersStore';
import { useCustomersStore } from '../../stores/customersStore';
import { useProductStore } from '../../../../core/products/stores/productStore';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type { Warehouse } from '../../../../core/warehouses/types/models';
import type { product } from '../../../../core/products/types/models';
import type { Customer, CustomerDetail, CreateCustomerDTO } from '../../types/customers_models';
import type { CustomerType } from '../../types/shared';
import '../../../procurement/styles/procurement.css';
import '../../styles/sales.css';

// ══════════════════════════════════════════════
// CustomerSearchSelect — searchable combobox
// ══════════════════════════════════════════════
interface CustomerSearchSelectProps {
  customers: Customer[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  onCreateNew: (query: string) => void;
  error?: string;
}

const CustomerSearchSelect: React.FC<CustomerSearchSelectProps> = ({
  customers,
  value,
  onChange,
  disabled,
  onCreateNew,
  error,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Display label for the selected customer
  const selected = customers.find((c) => c.id === value);
  const displayLabel = selected
    ? `${selected.name}${selected.company_name ? ` (${selected.company_name})` : ''}`
    : '';

  // Filter list
  const filtered = query.trim()
    ? customers.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.company_name && c.company_name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q))
        );
      })
    : customers;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  return (
    <div className="css-combobox" ref={containerRef}>
      {/* Trigger */}
      <div
        className={`css-trigger${open ? ' open' : ''}${error ? ' error' : ''}${disabled ? ' disabled' : ''}`}
        onClick={handleOpen}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}
      >
        {open ? (
          <input
            ref={inputRef}
            className="css-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company, phone…"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`css-value${!value ? ' placeholder' : ''}`}>
            {value ? displayLabel : 'Select customer'}
          </span>
        )}
        <div className="css-trigger-icons">
          {value && !open && (
            <button type="button" className="css-clear-btn" onClick={handleClear} tabIndex={-1}>
              <X size={13} />
            </button>
          )}
          {open ? <Search size={14} className="css-icon" /> : <ChevronDown size={14} className="css-icon" />}
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="css-dropdown" role="listbox">
          {filtered.length > 0 ? (
            <>
              {filtered.slice(0, 50).map((c) => (
                <div
                  key={c.id}
                  className={`css-option${c.id === value ? ' selected' : ''}`}
                  role="option"
                  aria-selected={c.id === value}
                  onMouseDown={() => handleSelect(c.id)}
                >
                  <span className="css-option-name">{c.name}</span>
                  {c.company_name && (
                    <span className="css-option-meta">{c.company_name}</span>
                  )}
                  <span className={`css-option-badge badge-${c.customer_type}`}>
                    {c.customer_type}
                  </span>
                </div>
              ))}
              {filtered.length > 50 && (
                <div className="css-overflow-hint">
                  {filtered.length - 50} more — refine your search
                </div>
              )}
            </>
          ) : (
            <div className="css-no-results">
              <span>No customers match "{query}"</span>
            </div>
          )}
          {/* Always show create link at the bottom */}
          <div
            className="css-create-option"
            onMouseDown={() => { onCreateNew(query); setOpen(false); }}
          >
            <UserPlus size={14} />
            <span>
              {query.trim() ? `Create "${query.trim()}" as new customer` : 'Create new customer'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════
// CreateCustomerPanel — slide-in side drawer
// ══════════════════════════════════════════════
interface CreateCustomerPanelProps {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onCreated: (customer: CustomerDetail) => void;
}

const CreateCustomerPanel: React.FC<CreateCustomerPanelProps> = ({
  open,
  initialName,
  onClose,
  onCreated,
}) => {
  const { create, isSubmitting, error, clearError } = useCustomersStore();

  const [customerType, setCustomerType] = useState<CustomerType>('retail');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Pre-fill name when panel opens
  useEffect(() => {
    if (open) {
      setName(initialName);
      setPhone('');
      setEmail('');
      setAddress('');
      setCompanyName('');
      setPaymentTerms('');
      setCreditLimit('');
      setTaxNumber('');
      setCustomerType('retail');
      setFieldErrors({});
      clearError();
    }
  }, [open, initialName]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Required';
    if (!phone.trim()) errors.phone = 'Required';
    if (!email.trim()) errors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email';
    if (!address.trim()) errors.address = 'Required';
    if (customerType === 'business' && !paymentTerms.trim())
      errors.paymentTerms = 'Required for business';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      const dto: CreateCustomerDTO = {
        customer_type: customerType,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      };
      if (companyName.trim()) dto.company_name = companyName.trim();
      if (paymentTerms.trim()) dto.payment_terms = paymentTerms.trim();
      if (creditLimit.trim()) dto.credit_limit = creditLimit.trim();
      if (taxNumber.trim()) dto.tax_number = taxNumber.trim();
      const created = await create(dto);
      onCreated(created);
    } catch {
      // error shown via store
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && <div className="panel-backdrop" onClick={onClose} />}

      {/* Drawer */}
      <div className={`create-customer-panel${open ? ' open' : ''}`}>
        <div className="panel-header">
          <h2>New Customer</h2>
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

          <form onSubmit={handleSubmit} id="panel-customer-form">
            {/* Type pills */}
            <div className="form-group">
              <label>Customer Type</label>
              <div className="customer-type-pills">
                <button
                  type="button"
                  className={`customer-type-pill${customerType === 'retail' ? ' active' : ''}`}
                  onClick={() => setCustomerType('retail')}
                >Retail</button>
                <button
                  type="button"
                  className={`customer-type-pill${customerType === 'business' ? ' active' : ''}`}
                  onClick={() => setCustomerType('business')}
                >Business</button>
              </div>
            </div>

            <div className="form-group">
              <label>Name <span className="required">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" />
              {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
            </div>

            <div className="form-group">
              <label>Phone <span className="required">*</span></label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+263 77 123 4567" />
              {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
            </div>

            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>

            <div className="form-group">
              <label>Address <span className="required">*</span></label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address, city" />
              {fieldErrors.address && <p className="field-error">{fieldErrors.address}</p>}
            </div>

            {customerType === 'business' && (
              <>
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
                </div>
                <div className="form-group">
                  <label>Payment Terms <span className="required">*</span></label>
                  <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
                    <option value="">Select payment terms</option>
                    <option value="cash">Cash</option>
                    <option value="net_30">Net 30</option>
                    <option value="net_60">Net 60</option>
                  </select>
                  {fieldErrors.paymentTerms && <p className="field-error">{fieldErrors.paymentTerms}</p>}
                </div>
                <div className="form-group">
                  <label>Credit Limit</label>
                  <input type="number" min="0" step="0.01" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Tax Number</label>
                  <input type="text" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} placeholder="VAT/TIN number" />
                </div>
              </>
            )}
          </form>
        </div>

        <div className="panel-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="panel-customer-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Customer'}
          </button>
        </div>
      </div>
    </>
  );
};

// ──────────────────────────────────────────────
// Line item shape (internal form state)
// ──────────────────────────────────────────────
interface LineItemForm {
  product_id: string;
  quantity: string;
  resolved_price?: string;
  product_name?: string;
}

const emptyLine = (): LineItemForm => ({
  product_id: '',
  quantity: '',
});

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
interface CreateSalesOrderPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const CreateSalesOrderPage: React.FC<CreateSalesOrderPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();

  // Stores
  const { create, resolvePrice, isSubmitting, error: orderError } = useOrdersStore();
  const { items: customers, fetchAll: fetchCustomers, fetchById: fetchCustomerById, detailMap } = useCustomersStore();
  const { products, fetchProducts } = useProductStore();

  // Ensure customers and products are arrays
  const customersList = Array.isArray(customers) ? customers : [];
  const productsList = Array.isArray(products) ? products : [];

  // Reference data
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [refLoading, setRefLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setRefLoading(true);
      try {
        await Promise.all([fetchProducts(), fetchCustomers()]);
        // Fetch warehouses
        const savedUser = localStorage.getItem('erp_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          const companyId =
            typeof user.company === 'string' ? user.company : user.company?.id;
          if (companyId) {
            const whs = await warehouseService.getWarehousesByCompany(companyId);
            setWarehouses(whs);
          }
        }
      } catch (err) {
        console.error('Failed to load reference data:', err);
      } finally {
        setRefLoading(false);
      }
    };
    load();
  }, [fetchProducts, fetchCustomers]);

  // ─── Form state ─────────────────────────────
  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState(activeWarehouse?.id ?? '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItemForm[]>([emptyLine()]);

  // Credit check result
  const [creditCheck, setCreditCheck] = useState<{
    outstanding: string;
    limit: string | null;
    over_limit: boolean;
  } | null>(null);

  // ─── Submission state ───────────────────────
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ─── Create customer panel ──────────────────
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelInitialName, setPanelInitialName] = useState('');

  // ─── Fetch credit check when customer changes ─
  useEffect(() => {
    if (!customerId) {
      setCreditCheck(null);
      return;
    }
    // In a real implementation, fetch from customersService.fetchOutstanding(customerId)
    // For now, placeholder
    setCreditCheck({
      outstanding: '0.00',
      limit: null,
      over_limit: false,
    });
  }, [customerId]);

  // ─── Auto-fill delivery address from customer detail ─
  useEffect(() => {
    if (!customerId) {
      setDeliveryAddress('');
      return;
    }
    // If we already have the detail cached, use it immediately
    const cached = detailMap[customerId];
    if (cached?.address) {
      setDeliveryAddress(cached.address);
      return;
    }
    // Otherwise fetch the detail — address lives on CustomerDetail, not Customer
    fetchCustomerById(customerId).then(() => {
      const detail = useCustomersStore.getState().detailMap[customerId];
      if (detail?.address) setDeliveryAddress(detail.address);
    });
  }, [customerId]);

  // ─── Resolve price when product + customer + warehouse selected ─
  const handleProductChange = async (index: number, productId: string) => {
    const updated = [...lines];
    updated[index].product_id = productId;

    const selected = productsList.find((p: product) => p.id === productId);
    if (selected) {
      updated[index].product_name = selected.name;
    }

    // Resolve price
    if (productId && customerId && warehouseId) {
      try {
        const resolved = await resolvePrice({
          customer_id: customerId,
          product_id: productId,
          warehouse_id: warehouseId,
        });
        updated[index].resolved_price = resolved.resolved_price;
      } catch (err) {
        console.error('Failed to resolve price:', err);
      }
    }

    setLines(updated);
  };

  // ─── Line item helpers ──────────────────────
  const updateLine = (index: number, field: keyof LineItemForm, value: string) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const addLine = () => setLines([...lines, emptyLine()]);

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // ─── Computed line total ────────────────────
  const getLineTotal = (line: LineItemForm): number => {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.resolved_price || '0') || 0;
    return qty * price;
  };

  const orderTotal = lines.reduce((sum, line) => sum + getLineTotal(line), 0);

  // ─── Validate ───────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerId) errors.customerId = 'Customer is required';
    if (!warehouseId) errors.warehouseId = 'Warehouse is required';

    lines.forEach((line, i) => {
      if (!line.product_id) errors[`line_${i}_product`] = 'Product is required';
      if (!line.quantity || parseFloat(line.quantity) <= 0)
        errors[`line_${i}_quantity`] = 'Valid quantity is required';
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Submit ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    try {
      const dto = {
        customer_id: customerId,
        warehouse_id: warehouseId,
        expected_delivery_date: expectedDeliveryDate || undefined,
        delivery_address: deliveryAddress.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const createdOrder = await create(dto);

      // Add lines
      for (const line of lines) {
        if (line.product_id && line.quantity) {
          await useOrdersStore.getState().addLine(createdOrder.id, {
            product_id: line.product_id,
            quantity: line.quantity,
          });
        }
      }

      navigate(`/sales/orders/${createdOrder.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create sales order');
    }
  };

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        {/* Header */}
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <button
              className="btn btn-outline"
              onClick={() => navigate('/sales/orders')}
              type="button"
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1>New Sales Order</h1>
            <p className="procurement-page-header__breadcrumb">Sales / Orders / New</p>
          </div>
        </div>
      </div>

      <div className="procurement-content">
        <div className="create-requisition-page">
          {(formError || orderError) && (
            <div className="error-banner">
              {formError || orderError}
              <button onClick={() => setFormError(null)} type="button">
                Dismiss
              </button>
            </div>
          )}

          {/* Credit Check Banner */}
          {creditCheck && creditCheck.over_limit && (
            <div className="credit-check-banner credit-check-banner--warning">
              <AlertCircle size={18} />
              <div>
                <strong>Credit Limit Exceeded</strong>
                <p>
                  Customer has ${parseFloat(creditCheck.outstanding).toLocaleString()} outstanding
                  of ${creditCheck.limit ? parseFloat(creditCheck.limit).toLocaleString() : '∞'}{' '}
                  limit
                </p>
              </div>
            </div>
          )}

          {creditCheck && !creditCheck.over_limit && creditCheck.limit && (
            <div className="credit-check-banner credit-check-banner--success">
              <AlertCircle size={18} />
              <div>
                <strong>Credit Check OK</strong>
                <p>
                  Customer has ${parseFloat(creditCheck.outstanding).toLocaleString()} outstanding
                  of ${parseFloat(creditCheck.limit).toLocaleString()} limit
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-form">
            {/* ─── Order Details Card ──────────── */}
            <div className="form-card">
              <h2 className="form-card__title">Order Details</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Customer <span className="required">*</span>
                  </label>
                  <CustomerSearchSelect
                    customers={customersList}
                    value={customerId}
                    onChange={setCustomerId}
                    disabled={refLoading}
                    onCreateNew={(query) => {
                      setPanelInitialName(query);
                      setPanelOpen(true);
                    }}
                    error={fieldErrors.customerId}
                  />
                  {fieldErrors.customerId && (
                    <p className="field-error">{fieldErrors.customerId}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Warehouse <span className="required">*</span>
                  </label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    disabled={refLoading}
                  >
                    <option value="">
                      {refLoading ? 'Loading warehouses…' : 'Select warehouse'}
                    </option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.warehouseId && (
                    <p className="field-error">{fieldErrors.warehouseId}</p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Auto-filled from customer"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Order Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this order…"
                  rows={3}
                />
              </div>
            </div>

            {/* ─── Line Items Card ─────────────── */}
            <div className="form-card">
              <div className="line-items-header">
                <h2 className="form-card__title" style={{ margin: 0 }}>
                  Items
                </h2>
                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                  {lines.length} {lines.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {lines.map((line, index) => (
                <div key={index} className="line-item-card">
                  <div className="line-item-number">Item {index + 1}</div>

                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="remove-line-btn"
                      onClick={() => removeLine(index)}
                      aria-label={`Remove item ${index + 1}`}
                      title="Remove item"
                    >
                      <X size={16} />
                    </button>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Product <span className="required">*</span>
                      </label>
                      <select
                        value={line.product_id}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        disabled={refLoading || !customerId || !warehouseId}
                      >
                        <option value="">
                          {refLoading
                            ? 'Loading products…'
                            : !customerId || !warehouseId
                            ? 'Select customer & warehouse first'
                            : 'Select product'}
                        </option>
                        {productsList.map((p: product) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                      {fieldErrors[`line_${index}_product`] && (
                        <p className="field-error">{fieldErrors[`line_${index}_product`]}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>
                        Quantity <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={line.quantity}
                        onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                        placeholder="0"
                      />
                      {fieldErrors[`line_${index}_quantity`] && (
                        <p className="field-error">{fieldErrors[`line_${index}_quantity`]}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Resolved Price</label>
                      <div className="resolved-price-display">
                        {line.resolved_price
                          ? `$${parseFloat(line.resolved_price).toFixed(2)}`
                          : '—'}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Line Total</label>
                      <div className="line-total-display">
                        ${getLineTotal(line).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="add-line-btn" onClick={addLine}>
                <Plus size={16} />
                Add Another Item
              </button>
            </div>

            {/* ─── Order Summary ────────────────── */}
            <div className="form-card po-summary-card">
              <div className="po-summary-row">
                <span className="po-summary-label">Total Items</span>
                <span className="po-summary-value">{lines.length}</span>
              </div>
              <div className="po-summary-row po-summary-total">
                <span className="po-summary-label">Order Total</span>
                <span className="po-summary-value">${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* ─── Actions ──────────────────────── */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/sales/orders')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || refLoading}
              >
                {isSubmitting ? 'Creating…' : 'Create Sales Order'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── Create Customer Side Panel ─────── */}
      <CreateCustomerPanel
        open={panelOpen}
        initialName={panelInitialName}
        onClose={() => setPanelOpen(false)}
        onCreated={(newCustomer) => {
          setPanelOpen(false);
          setCustomerId(newCustomer.id);
        }}
      />
    </div>
  );
};

export default CreateSalesOrderPage;
