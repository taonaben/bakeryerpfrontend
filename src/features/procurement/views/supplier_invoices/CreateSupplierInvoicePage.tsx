import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { supplierInvoiceService } from '../../services/supplier_invoices_services';
import type {
  SupplierInvoiceCreateContext,
  SupplierInvoiceCreateLineForm,
  SupplierInvoiceGoodsReceiptOption,
  SupplierInvoice,
} from '../../types/supplier_invoices_model';
import '../../styles/procurement.css';

const emptySummary = {
  totalLines: 0,
  totalAmount: 0,
};

interface CreateSupplierInvoicePageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const CreateSupplierInvoicePage: React.FC<CreateSupplierInvoicePageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const copyFromInvoiceId = searchParams.get('copyFromInvoiceId');

  const [receiptOptions, setReceiptOptions] = useState<SupplierInvoiceGoodsReceiptOption[]>([]);
  const [selectedReceiptId, setSelectedReceiptId] = useState('');
  const [invoiceContext, setInvoiceContext] = useState<SupplierInvoiceCreateContext | null>(null);
  const [sourceInvoice, setSourceInvoice] = useState<SupplierInvoice | null>(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lines, setLines] = useState<SupplierInvoiceCreateLineForm[]>([]);

  const [refLoading, setRefLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!activeWarehouse?.id) return;

    const loadReceiptOptions = async () => {
      setRefLoading(true);
      setFormError(null);
      try {
        const options = await supplierInvoiceService.fetchGoodsReceiptOptions({
          warehouse_id: activeWarehouse.id,
          ordering: '-created_at',
          page: 1,
          page_size: 200,
        });
        setReceiptOptions(options);
      } catch (error: any) {
        setFormError(error.message || 'Failed to load goods receipt options');
      } finally {
        setRefLoading(false);
      }
    };

    loadReceiptOptions();
  }, [activeWarehouse?.id]);

  useEffect(() => {
    if (!selectedReceiptId || copyFromInvoiceId) {
      setInvoiceContext(null);
      if (!copyFromInvoiceId) {
        setInvoiceDate('');
        setDueDate('');
        setLines([]);
      }
      return;
    }

    const loadInvoiceContext = async () => {
      setContextLoading(true);
      setFormError(null);
      try {
        const context = await supplierInvoiceService.getCreateFormData(selectedReceiptId);
        setInvoiceContext(context);
        setInvoiceDate(context.invoiceDate);
        setDueDate(context.dueDate);
        setLines(context.lines);
      } catch (error: any) {
        setFormError(error.message || 'Failed to load goods receipt details');
      } finally {
        setContextLoading(false);
      }
    };

    loadInvoiceContext();
  }, [selectedReceiptId, copyFromInvoiceId]);

  useEffect(() => {
    if (!copyFromInvoiceId) {
      setSourceInvoice(null);
      return;
    }

    const loadSourceInvoice = async () => {
      setContextLoading(true);
      setFormError(null);
      try {
        const invoice = await supplierInvoiceService.fetchInvoice(copyFromInvoiceId);
        setSourceInvoice(invoice);
        setSelectedReceiptId('');
        setInvoiceContext({
          goodsReceiptId: '',
          goodsReceiptNumber: 'Copied from existing invoice',
          purchaseOrderId: invoice.purchase_order,
          purchaseOrderNumber: invoice.po_number,
          supplierId: invoice.supplier,
          supplierName: invoice.supplier_name,
          warehouseId: invoice.warehouse,
          warehouseName: invoice.warehouse_name,
          invoiceDate: invoice.invoice_date,
          dueDate: invoice.due_date,
          lines: invoice.line_items.map((line) => ({
            gr_line_item_id: line.gr_line_item,
            product_id: line.product,
            product_name: line.product_name,
            quantity_received: parseFloat(String(line.quantity_invoiced)) || 0,
            quantity_invoiced: String(line.quantity_invoiced ?? ''),
            unit_of_measure: line.unit_of_measure || '',
            unit_price: String(line.unit_price ?? ''),
            description: line.description || '',
          })),
        });
        setInvoiceDate(invoice.invoice_date);
        setDueDate(invoice.due_date);
        setLines(
          invoice.line_items.map((line) => ({
            gr_line_item_id: line.gr_line_item,
            product_id: line.product,
            product_name: line.product_name,
            quantity_received: parseFloat(String(line.quantity_invoiced)) || 0,
            quantity_invoiced: String(line.quantity_invoiced ?? ''),
            unit_of_measure: line.unit_of_measure || '',
            unit_price: String(line.unit_price ?? ''),
            description: line.description || '',
          })),
        );
      } catch (error: any) {
        setFormError(error.message || 'Failed to load source invoice');
      } finally {
        setContextLoading(false);
      }
    };

    loadSourceInvoice();
  }, [copyFromInvoiceId]);

  const selectedReceipt = useMemo(
    () => receiptOptions.find((option) => option.id === selectedReceiptId) || null,
    [receiptOptions, selectedReceiptId],
  );

  const updateLine = (
    index: number,
    field: keyof SupplierInvoiceCreateLineForm,
    value: string,
  ) => {
    setLines((prev) =>
      prev.map((line, lineIndex) =>
        lineIndex === index
          ? {
              ...line,
              [field]: value,
            }
          : line,
      ),
    );
  };

  const getLineTotal = (line: SupplierInvoiceCreateLineForm): number => {
    const quantity = parseFloat(line.quantity_invoiced) || 0;
    const unitPrice = parseFloat(line.unit_price) || 0;
    return quantity * unitPrice;
  };

  const summary = useMemo(() => {
    if (!lines.length) return emptySummary;
    return {
      totalLines: lines.length,
      totalAmount: lines.reduce((sum, line) => sum + getLineTotal(line), 0),
    };
  }, [lines]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedReceiptId && !copyFromInvoiceId) errors.receipt = 'Goods receipt is required';
    if (!invoiceDate) errors.invoiceDate = 'Invoice date is required';
    if (!dueDate) errors.dueDate = 'Due date is required';

    lines.forEach((line, index) => {
      if (!line.quantity_invoiced || parseFloat(line.quantity_invoiced) <= 0) {
        errors[`line_${index}_quantity`] = 'Valid quantity invoiced is required';
      }
      if (!line.unit_of_measure.trim()) {
        errors[`line_${index}_uom`] = 'Unit of measure is required';
      }
      if (line.unit_price === '' || Number.isNaN(parseFloat(line.unit_price))) {
        errors[`line_${index}_unit_price`] = 'Valid unit price is required';
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!invoiceContext) {
      setFormError('Please select a goods receipt before creating an invoice');
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      await supplierInvoiceService.createInvoice({
        po_id: invoiceContext.purchaseOrderId,
        supplier_id: invoiceContext.supplierId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        lines: lines.map((line) => ({
          gr_line_item_id: line.gr_line_item_id,
          product_id: line.product_id,
          quantity_invoiced: line.quantity_invoiced,
          unit_of_measure: line.unit_of_measure,
          unit_price: line.unit_price,
          description: line.description || undefined,
        })),
      });

      navigate('/procurement/invoices');
    } catch (error: any) {
      setFormError(error.message || 'Failed to create supplier invoice');
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
            Please select a warehouse from the sidebar to create a supplier invoice.
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
              onClick={() => navigate('/procurement/invoices')}
              type="button"
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1>New Supplier Invoice</h1>
            <p className="procurement-page-header__breadcrumb">
              Finance / Supplier Invoices / New
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
              <h2 className="form-card__title">Invoice Source</h2>

              <div className="form-group">
                <label>
                  Goods Receipt <span className="required">*</span>
                </label>
                <select
                  value={selectedReceiptId}
                  onChange={(event) => setSelectedReceiptId(event.target.value)}
                  disabled={refLoading || submitting || Boolean(copyFromInvoiceId)}
                >
                  <option value="">
                    {copyFromInvoiceId
                      ? 'Prefilled from existing invoice'
                      : refLoading
                        ? 'Loading goods receipts...'
                        : 'Select goods receipt'}
                  </option>
                  {receiptOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.gr_number} | {option.supplier_name} | {option.purchase_order_number}
                    </option>
                  ))}
                </select>
                {fieldErrors.receipt && <p className="field-error">{fieldErrors.receipt}</p>}
                {copyFromInvoiceId && sourceInvoice && (
                  <p className="field-warning">
                    This invoice was prefilled from {sourceInvoice.invoice_number}. You can review and submit it as a new invoice.
                  </p>
                )}
              </div>

              {selectedReceipt && (
                <div className="form-row">
                  <div className="grn-readonly-box">
                    <strong>Goods Receipt</strong>
                    <span>{selectedReceipt.gr_number}</span>
                  </div>
                  <div className="grn-readonly-box">
                    <strong>PO Reference</strong>
                    <span>{selectedReceipt.purchase_order_number}</span>
                  </div>
                </div>
              )}

              {copyFromInvoiceId && sourceInvoice && (
                <div className="form-row">
                  <div className="grn-readonly-box">
                    <strong>Source Invoice</strong>
                    <span>{sourceInvoice.invoice_number}</span>
                  </div>
                  <div className="grn-readonly-box">
                    <strong>PO Reference</strong>
                    <span>{sourceInvoice.po_number}</span>
                  </div>
                </div>
              )}

              {invoiceContext && (
                <>
                  <div className="form-row" style={{ marginTop: 16 }}>
                    <div className="grn-readonly-box">
                      <strong>Supplier</strong>
                      <span>{invoiceContext.supplierName}</span>
                    </div>
                    <div className="grn-readonly-box">
                      <strong>Warehouse</strong>
                      <span>{invoiceContext.warehouseName}</span>
                    </div>
                  </div>

                  <div className="form-row" style={{ marginTop: 16 }}>
                    <div className="form-group">
                      <label>
                        Invoice Date <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={invoiceDate}
                        onChange={(event) => setInvoiceDate(event.target.value)}
                      />
                      {fieldErrors.invoiceDate && (
                        <p className="field-error">{fieldErrors.invoiceDate}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>
                        Due Date <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                      />
                      {fieldErrors.dueDate && (
                        <p className="field-error">{fieldErrors.dueDate}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="form-card">
              <div className="line-items-header">
                <h2 className="form-card__title" style={{ margin: 0 }}>
                  Invoice Lines
                </h2>
                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                  {lines.length} {lines.length === 1 ? 'line' : 'lines'}
                </span>
              </div>

              {contextLoading ? (
                <div className="loading-container" style={{ padding: '24px 0' }}>
                  <div className="spinner" />
                  <span>Loading goods receipt lines...</span>
                </div>
              ) : lines.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <h3 className="empty-state__title">No invoice lines yet</h3>
                  <p className="empty-state__description">
                    Select a goods receipt to load its received items into this invoice.
                  </p>
                </div>
              ) : (
                lines.map((line, index) => {
                  const quantityInvoiced = parseFloat(line.quantity_invoiced) || 0;
                  const overReceived = quantityInvoiced > line.quantity_received;

                  return (
                    <div key={line.gr_line_item_id} className="line-item-card">
                      <div className="line-item-number">Line {index + 1}</div>

                      <div className="form-row">
                        <div className="grn-readonly-box">
                          <strong>Product</strong>
                          <span>{line.product_name}</span>
                        </div>
                        <div className="grn-readonly-box">
                          <strong>Received Quantity</strong>
                          <span>
                            {line.quantity_received} {line.unit_of_measure || ''}
                          </span>
                        </div>
                      </div>

                      <div className="form-row" style={{ marginTop: 16 }}>
                        <div className="form-group">
                          <label>
                            Quantity Invoiced <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={line.quantity_invoiced}
                            onChange={(event) =>
                              updateLine(index, 'quantity_invoiced', event.target.value)
                            }
                            placeholder="0"
                          />
                          {fieldErrors[`line_${index}_quantity`] && (
                            <p className="field-error">{fieldErrors[`line_${index}_quantity`]}</p>
                          )}
                          {overReceived && (
                            <p className="field-warning">
                              Invoiced quantity exceeds the quantity received on this goods receipt.
                            </p>
                          )}
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
                            onChange={(event) => updateLine(index, 'unit_price', event.target.value)}
                            placeholder="0.00"
                          />
                          {fieldErrors[`line_${index}_unit_price`] && (
                            <p className="field-error">
                              {fieldErrors[`line_${index}_unit_price`]}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>
                            Unit of Measure <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            value={line.unit_of_measure}
                            onChange={(event) =>
                              updateLine(index, 'unit_of_measure', event.target.value)
                            }
                            placeholder="e.g. kg, units"
                          />
                          {fieldErrors[`line_${index}_uom`] && (
                            <p className="field-error">{fieldErrors[`line_${index}_uom`]}</p>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Line Total</label>
                          <div className="line-total-display">
                            {getLineTotal(line).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          value={line.description}
                          onChange={(event) => updateLine(index, 'description', event.target.value)}
                          placeholder="Optional note for this line"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="form-card po-summary-card">
              <div className="po-summary-row">
                <span className="po-summary-label">Source Goods Receipt</span>
                <span className="po-summary-value">
                  {copyFromInvoiceId
                    ? sourceInvoice?.invoice_number || 'Copied invoice'
                    : invoiceContext?.goodsReceiptNumber || '—'}
                </span>
              </div>
              <div className="po-summary-row">
                <span className="po-summary-label">PO Reference</span>
                <span className="po-summary-value">{invoiceContext?.purchaseOrderNumber || '—'}</span>
              </div>
              <div className="po-summary-row">
                <span className="po-summary-label">Invoice Lines</span>
                <span className="po-summary-value">{summary.totalLines}</span>
              </div>
              <div className="po-summary-row po-summary-total">
                <span className="po-summary-label">Invoice Total</span>
                <span className="po-summary-value">
                  {summary.totalAmount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/procurement/invoices')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || refLoading || contextLoading || !invoiceContext}
              >
                {submitting ? 'Creating...' : 'Create Supplier Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSupplierInvoicePage;
