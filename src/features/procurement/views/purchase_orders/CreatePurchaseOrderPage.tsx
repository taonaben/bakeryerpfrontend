import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Tag } from 'lucide-react';
import { purchaseOrderService } from '../../services/purchase_orders_services';
import { requisitionService } from '../../services/procurement_services';
import { supplierProductsApi } from '../../api/supplier_products';
import { useProductStore } from '../../../../core/products/stores/productStore';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type { Warehouse } from '../../../../core/warehouses/types/models';
import type { product } from '../../../../core/products/types/models';
import type { Supplier } from '../../types/models';
import type { CreatePurchaseOrderLineDTO } from '../../types/purchase_orders_models';
import '../../styles/procurement.css';

// ──────────────────────────────────────────────
// Line item shape (internal form state)
// ──────────────────────────────────────────────
interface LineItemForm {
  product_id: string;
  supplier_id: string;    // per-line supplier — can differ from the order's primary supplier
  quantity: string;
  unit_of_measure: string;
  quoted_price: string;   // from supplier catalogue — shown read-only
  unit_price: string;     // editable — what we're actually paying today
  description: string;
  isLoadingPrice: boolean;
}

const emptyLine = (): LineItemForm => ({
  product_id: '',
  supplier_id: '',
  quantity: '',
  unit_of_measure: '',
  quoted_price: '',
  unit_price: '',
  description: '',
  isLoadingPrice: false,
});

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
interface CreatePurchaseOrderPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const CreatePurchaseOrderPage: React.FC<CreatePurchaseOrderPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();

  // ─── Reference data ─────────────────────────
  const { products, fetchProducts } = useProductStore();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companyId, setCompanyId] = useState<string>('');
  const [refLoading, setRefLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setRefLoading(true);
      try {
        await fetchProducts();
        const supplierList = await requisitionService.fetchSuppliers();
        setSuppliers(supplierList);
        const savedUser = localStorage.getItem('erp_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          const cid = typeof user.company === 'string' ? user.company : user.company?.id;
          if (cid) {
            setCompanyId(cid);
            const whs = await warehouseService.getWarehousesByCompany(cid);
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
  }, [fetchProducts]);

  // ─── Form state ─────────────────────────────
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState(activeWarehouse?.id ?? '');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [lines, setLines] = useState<LineItemForm[]>([emptyLine()]);

  // ─── Submission state ───────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ─── Re-fetch prices when order-level supplier changes ──
  // Pre-fill supplier_id on all empty lines and refresh prices for filled ones
  useEffect(() => {
    if (!supplierId || !companyId) return;

    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        // Only pre-fill supplier on lines that haven't been manually set
        supplier_id: line.supplier_id || supplierId,
        isLoadingPrice: !!(line.product_id && (line.supplier_id || supplierId)),
      })),
    );

    const refreshPrices = async () => {
      const updated = await Promise.all(
        lines.map(async (line) => {
          const sid = line.supplier_id || supplierId;
          if (!line.product_id || !sid) return { ...line, isLoadingPrice: false };
          try {
            const results = await supplierProductsApi.list({
              product_id: line.product_id,
              supplier_id: sid,
              company_id: companyId,
            });
            const match = results[0];
            return match
              ? { ...line, supplier_id: sid, quoted_price: match.price, unit_price: match.price, isLoadingPrice: false }
              : { ...line, supplier_id: sid, isLoadingPrice: false };
          } catch {
            return { ...line, supplier_id: sid, isLoadingPrice: false };
          }
        }),
      );
      setLines(updated);
    };

    refreshPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId]);

  // ─── Line supplier changed ───────────────────
  const handleLineSupplierChange = async (index: number, sid: string) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        supplier_id: sid,
        quoted_price: '',
        unit_price: '',
        isLoadingPrice: !!(updated[index].product_id && sid),
      };
      return updated;
    });

    if (!sid || !lines[index].product_id || !companyId) return;

    try {
      const results = await supplierProductsApi.list({
        product_id: lines[index].product_id,
        supplier_id: sid,
        company_id: companyId,
      });
      const match = results[0];
      setLines((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          quoted_price: match?.price ?? '',
          unit_price: match?.price ?? '',
          isLoadingPrice: false,
        };
        return updated;
      });
    } catch {
      setLines((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], isLoadingPrice: false };
        return updated;
      });
    }
  };

  // ─── Product selected on a line ─────────────
  const handleProductChange = async (index: number, productId: string) => {
    const selected = products.find((p: product) => p.id === productId);
    const sid = lines[index].supplier_id || supplierId;

    setLines((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        product_id: productId,
        supplier_id: updated[index].supplier_id || supplierId,
        unit_of_measure: selected?.unit_of_measure || '',
        quoted_price: '',
        unit_price: '',
        isLoadingPrice: !!(productId && sid),
      };
      return updated;
    });

    if (!productId || !sid || !companyId) return;

    try {
      const results = await supplierProductsApi.list({
        product_id: productId,
        supplier_id: sid,
        company_id: companyId,
      });
      const match = results[0];
      setLines((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          quoted_price: match?.price ?? '',
          unit_price: match?.price ?? '',
          isLoadingPrice: false,
        };
        return updated;
      });
    } catch {
      setLines((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], isLoadingPrice: false };
        return updated;
      });
    }
  };

  // ─── Line item helpers ──────────────────────
  const updateLine = (index: number, field: keyof LineItemForm, value: string) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Computed line total ────────────────────
  const getLineTotal = (line: LineItemForm): number => {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.unit_price) || 0;
    return qty * price;
  };

  const orderTotal = lines.reduce((sum, line) => sum + getLineTotal(line), 0);

  // ─── Validate ───────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!supplierId) errors.supplierId = 'Supplier is required';
    if (!warehouseId) errors.warehouseId = 'Warehouse is required';
    if (!currency.trim()) errors.currency = 'Currency is required';

    lines.forEach((line, i) => {
      if (!line.supplier_id) errors[`line_${i}_supplier`] = 'Supplier is required';
      if (!line.product_id) errors[`line_${i}_product`] = 'Product is required';
      if (!line.quantity || parseFloat(line.quantity) <= 0)
        errors[`line_${i}_quantity`] = 'Valid quantity is required';
      if (!line.unit_price || parseFloat(line.unit_price) <= 0)
        errors[`line_${i}_unit_price`] = 'Valid unit price is required';
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Submit ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const dto = {
        supplier_id: supplierId,
        warehouse_id: warehouseId,
        currency: currency.trim(),
        description: description.trim() || undefined,
        expected_delivery_date: expectedDeliveryDate || undefined,
        lines: lines.map(
          (l): CreatePurchaseOrderLineDTO => ({
            product_id: l.product_id,
            supplier_id: l.supplier_id || supplierId,
            quantity: l.quantity,
            unit_of_measure: l.unit_of_measure,
            quoted_price: l.quoted_price || l.unit_price,
            unit_price: l.unit_price,
            description: l.description || undefined,
          }),
        ),
      };

      await purchaseOrderService.createOrder(dto);
      navigate('/procurement/purchase-orders');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <button
              className="btn btn-outline"
              onClick={() => navigate('/procurement/purchase-orders')}
              type="button"
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1>New Purchase Order</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Purchase Orders / New
            </p>
          </div>
        </div>
      </div>

      <div className="procurement-content">
        <div className="create-requisition-page">
          {formError && (
            <div className="error-banner">
              {formError}
              <button onClick={() => setFormError(null)} type="button">Dismiss</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-form">
            {/* ─── Order Details ───────────────── */}
            <div className="form-card">
              <h2 className="form-card__title">Order Details</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Supplier <span className="required">*</span></label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    disabled={refLoading}
                  >
                    <option value="">{refLoading ? 'Loading suppliers…' : 'Select supplier'}</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {fieldErrors.supplierId && <p className="field-error">{fieldErrors.supplierId}</p>}
                </div>

                <div className="form-group">
                  <label>Warehouse <span className="required">*</span></label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    disabled={refLoading}
                  >
                    <option value="">{refLoading ? 'Loading warehouses…' : 'Select warehouse'}</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                  {fieldErrors.warehouseId && <p className="field-error">{fieldErrors.warehouseId}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Currency <span className="required">*</span></label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD — US Dollar</option>
                    <option value="ZWG">ZWG — Zimbabwe Gold</option>
                    <option value="ZAR">ZAR — South African Rand</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                  {fieldErrors.currency && <p className="field-error">{fieldErrors.currency}</p>}
                </div>

                <div className="form-group">
                  <label>Expected Delivery</label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes about this purchase order…"
                  rows={3}
                />
              </div>
            </div>

            {/* ─── Line Items ──────────────────── */}
            <div className="form-card">
              <div className="line-items-header">
                <h2 className="form-card__title" style={{ margin: 0 }}>Items</h2>
                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                  {lines.length} {lines.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {!supplierId && (
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '8px 0 4px', fontStyle: 'italic' }}>
                  Select a supplier first — prices will auto-fill from the supplier catalogue.
                </p>
              )}

              {lines.map((line, index) => (
                <div key={index} className="line-item-card">
                  <div className="line-item-number">Item {index + 1}</div>

                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="remove-line-btn"
                      onClick={() => removeLine(index)}
                      aria-label={`Remove item ${index + 1}`}
                    >
                      <X size={16} />
                    </button>
                  )}

                  {/* Row 1: Supplier (per-line) */}
                  <div className="form-row">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>
                        Supplier <span className="required">*</span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400, marginLeft: 4 }}>
                          (can differ per line)
                        </span>
                      </label>
                      <select
                        value={line.supplier_id}
                        onChange={(e) => handleLineSupplierChange(index, e.target.value)}
                        disabled={refLoading}
                      >
                        <option value="">{refLoading ? 'Loading suppliers…' : 'Select supplier for this line'}</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      {fieldErrors[`line_${index}_supplier`] && (
                        <p className="field-error">{fieldErrors[`line_${index}_supplier`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Product + Quantity */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product <span className="required">*</span></label>
                      <select
                        value={line.product_id}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        disabled={refLoading}
                      >
                        <option value="">{refLoading ? 'Loading products…' : 'Select product'}</option>
                        {products.map((p: product) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                      {fieldErrors[`line_${index}_product`] && (
                        <p className="field-error">{fieldErrors[`line_${index}_product`]}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Quantity <span className="required">*</span></label>
                      <input
                        type="number" min="0" step="any"
                        value={line.quantity}
                        onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                        placeholder="0"
                      />
                      {fieldErrors[`line_${index}_quantity`] && (
                        <p className="field-error">{fieldErrors[`line_${index}_quantity`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: UOM + Quoted Price (read-only) */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Unit of Measure</label>
                      <input
                        type="text"
                        value={line.unit_of_measure}
                        onChange={(e) => updateLine(index, 'unit_of_measure', e.target.value)}
                        placeholder="e.g. kg, litres, bags"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Tag size={12} style={{ color: '#94a3b8' }} />
                        Quoted Price
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>
                          (from catalogue)
                        </span>
                      </label>
                      <div className={`line-total-display${line.isLoadingPrice ? ' po-price-loading' : ''}`}>
                        {line.isLoadingPrice
                          ? 'Fetching…'
                          : line.quoted_price
                          ? parseFloat(line.quoted_price).toLocaleString('en-US', {
                              style: 'currency', currency: currency || 'USD',
                              minimumFractionDigits: 2,
                            })
                          : supplierId && line.product_id
                          ? 'No catalogue price'
                          : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Unit Price (editable) + Line Total */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Unit Price <span className="required">*</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400, marginLeft: 4 }}>
                          (today's agreed price)
                        </span>
                      </label>
                      <input
                        type="number" min="0" step="0.01"
                        value={line.unit_price}
                        onChange={(e) => updateLine(index, 'unit_price', e.target.value)}
                        placeholder="0.00"
                        disabled={line.isLoadingPrice}
                      />
                      {fieldErrors[`line_${index}_unit_price`] && (
                        <p className="field-error">{fieldErrors[`line_${index}_unit_price`]}</p>
                      )}
                      {/* Show discount/markup hint if unit price differs from quoted */}
                      {line.quoted_price && line.unit_price &&
                        line.quoted_price !== line.unit_price && (
                        <p className="po-price-diff-hint">
                          {parseFloat(line.unit_price) < parseFloat(line.quoted_price)
                            ? `↓ ${(((parseFloat(line.quoted_price) - parseFloat(line.unit_price)) / parseFloat(line.quoted_price)) * 100).toFixed(1)}% below catalogue`
                            : `↑ ${(((parseFloat(line.unit_price) - parseFloat(line.quoted_price)) / parseFloat(line.quoted_price)) * 100).toFixed(1)}% above catalogue`}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Line Total</label>
                      <div className="line-total-display">
                        {getLineTotal(line).toLocaleString('en-US', {
                          style: 'currency', currency: currency || 'USD',
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Description */}
                  <div className="form-row">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Description</label>
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                        placeholder="Optional note for this line"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="add-line-btn" onClick={addLine}>
                <Plus size={16} /> Add Another Item
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
                <span className="po-summary-value">
                  {orderTotal.toLocaleString('en-US', {
                    style: 'currency', currency: currency || 'USD',
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* ─── Actions ──────────────────────── */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/procurement/purchase-orders')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || refLoading}
              >
                {submitting ? 'Creating…' : 'Create Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderPage;