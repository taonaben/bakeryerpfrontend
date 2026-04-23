import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { requisitionService } from '../../services/procurement_services';
import usePurchaseOrderDetailStore from '../../stores/purchaseOrderDetailStore';
import { purchaseOrderService } from '../../services/purchase_orders_services';
import type { PurchaseOrder } from '../../types/purchase_orders_models';
import type { Supplier } from '../../types/models';
import type { product } from '../../../../core/products/types/models';
import type { Warehouse } from '../../../../core/warehouses/types/models';
import { useProductStore } from '../../../../core/products/stores/productStore';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';

interface EditPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder;
}


// Line state modeling
type LineKind = 'existing' | 'new';
interface EditableLineItem {
  kind: LineKind;
  id?: string; // present for existing lines
  tempKey?: string; // present for new lines
  product_id: string;
  quantity: string;
  unit_of_measure: string;
  unit_price: string;
  description: string;
  dirty?: boolean; // for existing lines, tracks if edited
}

const createEmptyLine = (): EditableLineItem => ({
  kind: 'new',
  tempKey: Math.random().toString(36).slice(2),
  product_id: '',
  quantity: '',
  unit_of_measure: '',
  unit_price: '',
  description: '',
});

const EditPurchaseOrderModal: React.FC<EditPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
}) => {
  const { products, fetchProducts } = useProductStore();
  const fetchOrder = usePurchaseOrderDetailStore((s) => s.fetchOrder);
  const [isSaving, setIsSaving] = useState(false);
  const isUpdating = usePurchaseOrderDetailStore((s) => s.isUpdating);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [lines, setLines] = useState<EditableLineItem[]>([]);
  const [deletedLineIds, setDeletedLineIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    setSupplierId(purchaseOrder.supplier);
    setWarehouseId(purchaseOrder.warehouse);
    setCurrency(purchaseOrder.currency || 'USD');
    setDescription(purchaseOrder.description || '');
    setExpectedDeliveryDate(purchaseOrder.expected_delivery_date?.slice(0, 10) || '');

    // Model lines as existing or new
    setLines(
      purchaseOrder.line_items?.length
        ? purchaseOrder.line_items.map((item) => ({
            kind: 'existing',
            id: item.id,
            product_id: item.product,
            quantity: String(item.quantity ?? ''),
            unit_of_measure: item.unit_of_measure || '',
            unit_price: String(item.unit_price ?? ''),
            description: item.description || '',
            dirty: false,
          }))
        : [createEmptyLine()],
    );
    setDeletedLineIds([]);
    setFieldErrors({});
    setFormError(null);
  }, [isOpen, purchaseOrder]);

  useEffect(() => {
    if (!isOpen) return;

    const loadReferenceData = async () => {
      setReferenceLoading(true);
      setReferenceError(null);

      try {
        await fetchProducts();
        const [supplierList, warehouseList] = await Promise.all([
          requisitionService.fetchSuppliers(),
          (async () => {
            const savedUser = localStorage.getItem('erp_user');
            if (!savedUser) return [];

            const user = JSON.parse(savedUser);
            const companyId =
              typeof user.company === 'string' ? user.company : user.company?.id;

            if (!companyId) return [];
            return warehouseService.getWarehousesByCompany(companyId);
          })(),
        ]);

        setSuppliers(supplierList);
        setWarehouses(warehouseList);
      } catch (error: any) {
        setReferenceError(error.message || 'Failed to load reference data');
      } finally {
        setReferenceLoading(false);
      }
    };

    loadReferenceData();
  }, [isOpen, fetchProducts]);

  const handleClose = () => {
    if (!isUpdating) {
      setFormError(null);
      setFieldErrors({});
      onClose();
    }
  };

  const updateLine = (index: number, field: string, value: string) => {
    setLines((current) => {
      const next = [...current];
      const line = { ...next[index] };
      (line as any)[field] = value;
      // Mark as dirty if existing
      if (line.kind === 'existing') line.dirty = true;
      next[index] = line;
      return next;
    });
  };

  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = products.find((item: product) => item.id === productId);

    setLines((current) => {
      const next = [...current];
      next[index] = {
        ...next[index],
        product_id: productId,
        unit_of_measure: selectedProduct?.unit_of_measure || next[index].unit_of_measure,
      };
      return next;
    });
  };

  const addLine = () => {
    setLines((current) => [...current, createEmptyLine()]);
  };

  // Remove line: if new, just remove; if existing, mark for deletion
  const removeLine = (index: number) => {
    setLines((current) => {
      const line = current[index];
      if (line.kind === 'existing' && line.id) {
        setDeletedLineIds((ids) => [...ids, line.id!]);
      }
      const filtered = current.filter((_, i) => i !== index);
      return filtered.length > 0 ? filtered : [createEmptyLine()];
    });
  };

  const getLineTotal = (line: EditableLineItem) => {
    const quantity = parseFloat(line.quantity) || 0;
    const unitPrice = parseFloat(line.unit_price) || 0;
    return quantity * unitPrice;
  };

  const orderTotal = useMemo(
    () => lines.reduce((sum, line) => sum + getLineTotal(line), 0),
    [lines],
  );

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!supplierId) errors.supplierId = 'Supplier is required';
    if (!warehouseId) errors.warehouseId = 'Warehouse is required';
    if (!currency.trim()) errors.currency = 'Currency is required';

    lines.forEach((line, index) => {
      if (!line.product_id) errors[`line_${index}_product`] = 'Product is required';
      if (!line.quantity || parseFloat(line.quantity) <= 0) {
        errors[`line_${index}_quantity`] = 'Valid quantity is required';
      }
      if (!line.unit_price || parseFloat(line.unit_price) <= 0) {
        errors[`line_${index}_unit_price`] = 'Valid unit price is required';
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // New save logic for draft PO editing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!validate()) return;

    setIsSaving(true);
    try {
      // 1. Split lines by type
      const newLines = lines.filter((l) => l.kind === 'new');
      const dirtyExistingLines = lines.filter((l) => l.kind === 'existing' && l.dirty && l.id);
      // deletedLineIds is already tracked

      // 2. PATCH PO for header fields and new lines
      const headerChanged =
        supplierId !== purchaseOrder.supplier ||
        warehouseId !== purchaseOrder.warehouse ||
        currency !== purchaseOrder.currency ||
        description !== (purchaseOrder.description || '') ||
        expectedDeliveryDate !== (purchaseOrder.expected_delivery_date?.slice(0, 10) || '');

      if (headerChanged || newLines.length > 0) {
        await purchaseOrderService.patchOrder(purchaseOrder.id, {
          supplier_id: supplierId,
          warehouse_id: warehouseId,
          purchase_requisition_id: purchaseOrder.purchase_requisition || undefined,
          currency: currency.trim(),
          description: description.trim() || undefined,
          expected_delivery_date: expectedDeliveryDate || undefined,
          lines: newLines.map((line) => ({
            product_id: line.product_id,
            quantity: line.quantity,
            unit_of_measure: line.unit_of_measure,
            unit_price: line.unit_price,
            description: line.description.trim() || undefined,
          })),
        });
      }

      // 3. PATCH/PUT each dirty existing line
      for (const line of dirtyExistingLines) {
        await purchaseOrderService.patchLine(line.id!, {
          product: line.product_id,
          quantity: line.quantity,
          unit_of_measure: line.unit_of_measure,
          unit_price: line.unit_price,
          description: line.description.trim() || undefined,
        });
      }

      // 4. DELETE each deleted line
      for (const id of deletedLineIds) {
        await purchaseOrderService.deleteLine(id);
      }

      // 5. Refetch PO detail
      await fetchOrder(purchaseOrder.id);
      setIsSaving(false);
      onClose();
    } catch (error: any) {
      setIsSaving(false);
      setFormError(error.message || 'Failed to save changes.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className="modal-content" style={{ maxWidth: 860 }}>
        <div className="modal-header">
          <h2>Edit Purchase Order</h2>
          <button className="modal-close-btn" onClick={handleClose} type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <p className="modal-description">
            Update draft purchase order <strong>{purchaseOrder.po_number}</strong>.
          </p>

          {referenceError && (
            <div className="modal-error" role="alert">{referenceError}</div>
          )}

          {formError && (
            <div className="modal-error" role="alert">{formError}</div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>
                Supplier <span className="required">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={referenceLoading}
              >
                <option value="">
                  {referenceLoading ? 'Loading suppliers...' : 'Select supplier'}
                </option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {fieldErrors.supplierId && <p className="field-error">{fieldErrors.supplierId}</p>}
            </div>

            <div className="form-group">
              <label>
                Warehouse <span className="required">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                disabled={referenceLoading}
              >
                <option value="">
                  {referenceLoading ? 'Loading warehouses...' : 'Select warehouse'}
                </option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
              {fieldErrors.warehouseId && <p className="field-error">{fieldErrors.warehouseId}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Currency <span className="required">*</span>
              </label>
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
              rows={3}
              placeholder="Optional notes about this purchase order..."
            />
          </div>

          <div className="edit-lines-section">
            {lines.map((line, index) => (
              <div key={`${index}-${line.product_id}`} className="line-item-card">
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
                      disabled={referenceLoading}
                    >
                      <option value="">
                        {referenceLoading ? 'Loading products...' : 'Select product'}
                      </option>
                      {products.map((item: product) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.sku})
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
                    />
                    {fieldErrors[`line_${index}_quantity`] && (
                      <p className="field-error">{fieldErrors[`line_${index}_quantity`]}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Unit of Measure</label>
                    <input
                      type="text"
                      value={line.unit_of_measure}
                      onChange={(e) => updateLine(index, 'unit_of_measure', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Unit Price <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unit_price}
                      onChange={(e) => updateLine(index, 'unit_price', e.target.value)}
                    />
                    {fieldErrors[`line_${index}_unit_price`] && (
                      <p className="field-error">{fieldErrors[`line_${index}_unit_price`]}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(index, 'description', e.target.value)}
                      placeholder="Optional note"
                    />
                  </div>

                  <div className="form-group">
                    <label>Line Total</label>
                    <div className="line-total-display">
                      {getLineTotal(line).toLocaleString('en-US', {
                        style: 'currency',
                        currency: currency || 'USD',
                        minimumFractionDigits: 2,
                      })}
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

          <div className="po-summary-card">
            <div className="po-summary-row">
              <span className="po-summary-label">Total Items</span>
              <span className="po-summary-value">{lines.length}</span>
            </div>
            <div className="po-summary-row po-summary-total">
              <span className="po-summary-label">Order Total</span>
              <span className="po-summary-value">
                {orderTotal.toLocaleString('en-US', {
                  style: 'currency',
                  currency: currency || 'USD',
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving || referenceLoading}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditPurchaseOrderModal;
