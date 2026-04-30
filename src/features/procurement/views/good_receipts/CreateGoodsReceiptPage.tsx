import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { grnService } from '../../services/grn_services';
import type {
  CreateGoodsReceiptDTO,
  GoodsReceiptCreateLineForm,
  GoodsReceiptPurchaseOrderOption,
} from '../../types/grn_models';
import '../../styles/procurement.css';

interface CreateGoodsReceiptPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const CreateGoodsReceiptPage: React.FC<CreateGoodsReceiptPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPoId = searchParams.get('poId') || '';

  const [purchaseOrders, setPurchaseOrders] = useState<GoodsReceiptPurchaseOrderOption[]>([]);
  const [poSearch, setPoSearch] = useState('');
  const [selectedPoId, setSelectedPoId] = useState(preselectedPoId);
  const [selectedPoNumber, setSelectedPoNumber] = useState('');
  const [selectedSupplierName, setSelectedSupplierName] = useState('');
  const [warehouseId, setWarehouseId] = useState(activeWarehouse?.id ?? '');
  const [lines, setLines] = useState<GoodsReceiptCreateLineForm[]>([]);

  const [refLoading, setRefLoading] = useState(true);
  const [loadingLines, setLoadingLines] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const currentUserName = useMemo(() => {
    try {
      const saved = localStorage.getItem('erp_user');
      if (!saved) return 'Current user';
      const parsed = JSON.parse(saved);
      const first = parsed?.first_name || '';
      const last = parsed?.last_name || '';
      return `${first} ${last}`.trim() || parsed?.username || 'Current user';
    } catch {
      return 'Current user';
    }
  }, []);

  useEffect(() => {
    const loadPurchaseOrders = async () => {
      setRefLoading(true);
      try {
        const options = await grnService.fetchPurchaseOrderOptions({
          warehouse_id: activeWarehouse?.id ?? '',
        });
        const allowed = options.filter(
          (po) => po.status === 'Approved' || po.status === 'Partially Received',
        );
        setPurchaseOrders(allowed);
      } catch (err) {
        console.error('Failed to load purchase order options:', err);
      } finally {
        setRefLoading(false);
      }
    };
    loadPurchaseOrders();
  }, [activeWarehouse?.id]);

  useEffect(() => {
    const loadFromPO = async () => {
      if (!selectedPoId) {
        setLines([]);
        return;
      }
      setLoadingLines(true);
      setFormError(null);
      try {
        const payload = await grnService.getCreateFormData(selectedPoId);
        setSelectedPoNumber(payload.purchaseOrderNumber);
        setSelectedSupplierName(payload.supplierName);
        setWarehouseId(payload.warehouseId || activeWarehouse?.id || '');
        setLines(payload.lines);
      } catch (err: any) {
        setFormError(err.message || 'Failed to load purchase order lines');
      } finally {
        setLoadingLines(false);
      }
    };
    loadFromPO();
  }, [selectedPoId, activeWarehouse?.id]);

  const filteredPOs = useMemo(() => {
    const q = poSearch.trim().toLowerCase();
    if (!q) return purchaseOrders;
    return purchaseOrders.filter(
      (po) =>
        po.po_number.toLowerCase().includes(q) ||
        po.supplier_name.toLowerCase().includes(q),
    );
  }, [poSearch, purchaseOrders]);

  const getRemaining = (line: GoodsReceiptCreateLineForm) =>
    Math.max(0, line.quantity_remaining);

  const getOverReceiptError = (line: GoodsReceiptCreateLineForm): string | null => {
    const entered = parseFloat(line.quantity_received || '0');
    const remaining = getRemaining(line);
    if (!line.quantity_received) return null;
    if (Number.isNaN(entered) || entered <= 0) return null;
    if (entered > remaining) {
      return `Cannot receive more than remaining quantity (${remaining}).`;
    }
    return null;
  };

  const hasOverReceipt = lines.some((line) => !!getOverReceiptError(line));

  const updateLine = (
    index: number,
    field: keyof GoodsReceiptCreateLineForm,
    value: string,
  ) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!selectedPoId) errors.purchaseOrder = 'Purchase order is required';
    if (!warehouseId) errors.warehouseId = 'Warehouse is required';
    if (!lines.length) errors.lines = 'At least one line is required';

    const linesForSubmit = lines.filter((line) => parseFloat(line.quantity_received || '0') > 0);
    if (!linesForSubmit.length) errors.lines = 'Enter received quantity for at least one line';

    lines.forEach((line, i) => {
      const entered = parseFloat(line.quantity_received || '0');
      if (line.quantity_received && (Number.isNaN(entered) || entered < 0)) {
        errors[`line_${i}_quantity_received`] = 'Enter a valid quantity';
      }
      if (entered > 0 && !line.unit_of_measure?.trim()) {
        errors[`line_${i}_unit_of_measure`] = 'Unit of measure is required';
      }
      const overError = getOverReceiptError(line);
      if (overError) errors[`line_${i}_quantity_received`] = overError;
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;
    if (hasOverReceipt) return;

    setSubmitting(true);
    try {
      const dto: CreateGoodsReceiptDTO = {
        purchase_order_id: selectedPoId,
        warehouse_id: warehouseId,
        lines: lines
          .filter((line) => parseFloat(line.quantity_received || '0') > 0)
          .map((line) => ({
            po_line_item_id: line.po_line_item_id,
            quantity_received: line.quantity_received,
            unit_of_measure: line.unit_of_measure,
            supplier_batch_ref: line.supplier_batch_ref || undefined,
            expiry_date: line.expiry_date || undefined,
            manufacturing_date: line.manufacturing_date || undefined,
            description: line.description || undefined,
          })),
      };

      await grnService.createReceipt(dto);
      navigate('/procurement/goods-receipts');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create goods receipt');
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeWarehouse?.id) {
    return (
      <div className="procurement-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state__icon">
            <AlertTriangle size={48} color="#f59e0b" />
          </div>
          <h3 className="empty-state__title">No Warehouse Selected</h3>
          <p className="empty-state__description">
            Please select a warehouse from the sidebar to receive goods.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <button
              className="btn btn-outline"
              onClick={() => navigate('/procurement/goods-receipts')}
              type="button"
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1>Receive Goods</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Goods Receipts / New
            </p>
          </div>
        </div>
      </div>

      <div className="procurement-content">
        <div className="create-requisition-page">
          {formError && (
            <div className="error-banner">
              {formError}
              <button onClick={() => setFormError(null)} type="button">
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-card">
              <h2 className="form-card__title">Receipt Details</h2>

              {!preselectedPoId ? (
                <>
                  <div className="form-group">
                    <label>Search Purchase Order</label>
                    <input
                      type="text"
                      value={poSearch}
                      onChange={(e) => setPoSearch(e.target.value)}
                      placeholder="Search by PO number or supplier"
                      disabled={refLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Purchase Order <span className="required">*</span>
                    </label>
                    <select
                      value={selectedPoId}
                      onChange={(e) => setSelectedPoId(e.target.value)}
                      disabled={refLoading}
                    >
                      <option value="">
                        {refLoading ? 'Loading purchase orders…' : 'Select purchase order'}
                      </option>
                      {filteredPOs.map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.po_number} - {po.supplier_name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.purchaseOrder && (
                      <p className="field-error">{fieldErrors.purchaseOrder}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="grn-readonly-box">
                  <div>
                    <strong>Purchase Order:</strong> {selectedPoNumber || preselectedPoId}
                  </div>
                  <div>
                    <strong>Supplier:</strong> {selectedSupplierName || '—'}
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Warehouse <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={activeWarehouse.name}
                    readOnly
                  />
                  {fieldErrors.warehouseId && <p className="field-error">{fieldErrors.warehouseId}</p>}
                </div>
                <div className="form-group">
                  <label>Received By</label>
                  <input type="text" value={currentUserName} readOnly />
                </div>
              </div>
            </div>

            <div className="form-card">
              <div className="line-items-header">
                <h2 className="form-card__title" style={{ margin: 0 }}>
                  Receipt Lines
                </h2>
                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                  {lines.length} {lines.length === 1 ? 'line' : 'lines'}
                </span>
              </div>

              {loadingLines && <p className="text-muted">Loading purchase order lines…</p>}
              {!loadingLines && lines.length === 0 && (
                <p className="text-muted">Select a purchase order to load line items.</p>
              )}
              {fieldErrors.lines && <p className="field-error">{fieldErrors.lines}</p>}

              {lines.map((line, index) => {
                const overError = getOverReceiptError(line);
                return (
                  <div key={line.po_line_item_id} className="line-item-card">
                    <div className="line-item-number">Line {index + 1}</div>
                    <button
                      type="button"
                      className="remove-line-btn"
                      onClick={() => removeLine(index)}
                      aria-label={`Remove line ${index + 1}`}
                      title="Remove line"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Product</label>
                        <input type="text" value={line.product_name} readOnly />
                      </div>
                      <div className="form-group">
                        <label>Quantity Ordered</label>
                        <input type="text" value={String(line.quantity_ordered)} readOnly />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Already Received</label>
                        <input type="text" value={String(line.quantity_already_received)} readOnly />
                      </div>
                      <div className="form-group">
                        <label>Remaining</label>
                        <input type="text" value={String(getRemaining(line))} readOnly />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Quantity Received <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className={overError ? 'input-error' : ''}
                          value={line.quantity_received}
                          onChange={(e) => updateLine(index, 'quantity_received', e.target.value)}
                          placeholder="0"
                        />
                        {fieldErrors[`line_${index}_quantity_received`] && (
                          <p className="field-error">{fieldErrors[`line_${index}_quantity_received`]}</p>
                        )}
                        {overError && <p className="field-warning">{overError}</p>}
                      </div>
                      <div className="form-group">
                        <label>
                          Unit of Measure <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          value={line.unit_of_measure}
                          onChange={(e) => updateLine(index, 'unit_of_measure', e.target.value)}
                          placeholder="e.g. kg, litres"
                        />
                        {fieldErrors[`line_${index}_unit_of_measure`] && (
                          <p className="field-error">{fieldErrors[`line_${index}_unit_of_measure`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Supplier Batch Ref</label>
                        <input
                          type="text"
                          value={line.supplier_batch_ref}
                          onChange={(e) => updateLine(index, 'supplier_batch_ref', e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          placeholder="Optional note"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Manufacturing Date</label>
                        <input
                          type="date"
                          value={line.manufacturing_date}
                          onChange={(e) => updateLine(index, 'manufacturing_date', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="date"
                          value={line.expiry_date}
                          onChange={(e) => updateLine(index, 'expiry_date', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/procurement/goods-receipts')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || loadingLines || hasOverReceipt}
              >
                {submitting ? 'Saving…' : 'Save Goods Receipt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGoodsReceiptPage;
