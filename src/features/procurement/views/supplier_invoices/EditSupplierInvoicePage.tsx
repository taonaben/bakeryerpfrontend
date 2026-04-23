import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { supplierInvoiceService } from '../../services/supplier_invoices_services';
import type { SupplierInvoice } from '../../types/supplier_invoices_model';
import '../../styles/procurement.css';

interface EditableLineItem {
  id: string;
  gr_line_item_id: string;
  product_id: string;
  product_name: string;
  quantity_invoiced: string;
  unit_of_measure: string;
  unit_price: string;
  description: string;
}

const EditSupplierInvoicePage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<SupplierInvoice | null>(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lines, setLines] = useState<EditableLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!invoiceId) {
      navigate('/procurement/invoices');
      return;
    }

    const loadInvoice = async () => {
      setIsLoading(true);
      setFormError(null);
      try {
        const result = await supplierInvoiceService.fetchInvoice(invoiceId);
        if (result.status === 'Approved' || result.status === 'Rejected') {
          navigate(`/procurement/invoices/${invoiceId}`, {
            replace: true,
          });
          return;
        }
        setInvoice(result);
        setInvoiceDate(result.invoice_date || '');
        setDueDate(result.due_date || '');
        setLines(
          (result.line_items || []).map((line) => ({
            id: line.id,
            gr_line_item_id: line.gr_line_item,
            product_id: line.product,
            product_name: line.product_name,
            quantity_invoiced: String(line.quantity_invoiced ?? ''),
            unit_of_measure: line.unit_of_measure || '',
            unit_price: String(line.unit_price ?? ''),
            description: line.description || '',
          })),
        );
      } catch (error: any) {
        setFormError(error.message || 'Failed to load supplier invoice');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, navigate]);

  const updateLine = (index: number, field: keyof EditableLineItem, value: string) => {
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

  const getLineTotal = (line: EditableLineItem): number => {
    const qty = parseFloat(line.quantity_invoiced) || 0;
    const price = parseFloat(line.unit_price) || 0;
    return qty * price;
  };

  const invoiceTotal = useMemo(
    () => lines.reduce((sum, line) => sum + getLineTotal(line), 0),
    [lines],
  );

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

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
    if (!invoice || !invoiceId) return;

    setFormError(null);
    if (!validate()) return;

    setIsSaving(true);
    try {
      await supplierInvoiceService.updateInvoice(invoiceId, {
        po_id: invoice.purchase_order,
        supplier_id: invoice.supplier,
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
      navigate(`/procurement/invoices/${invoiceId}`);
    } catch (error: any) {
      setFormError(error.message || 'Failed to update supplier invoice');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="procurement-page">
        <div className="procurement-content">
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading supplier invoice...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="procurement-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state__icon">
            <AlertTriangle size={48} color="#f59e0b" />
          </div>
          <h3 className="empty-state__title">Supplier Invoice Not Found</h3>
          <p className="empty-state__description">
            The supplier invoice you are trying to edit could not be loaded.
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
              onClick={() => navigate(`/procurement/invoices/${invoice.id}`)}
              type="button"
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1>Edit Supplier Invoice</h1>
            <p className="procurement-page-header__breadcrumb">
              Finance / Supplier Invoices / {invoice.invoice_number} / Edit
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
              <h2 className="form-card__title">Invoice Details</h2>

              <div className="form-row">
                <div className="grn-readonly-box">
                  <strong>Invoice Number</strong>
                  <span>{invoice.invoice_number}</span>
                </div>
                <div className="grn-readonly-box">
                  <strong>PO Reference</strong>
                  <span>{invoice.po_number}</span>
                </div>
              </div>

              <div className="form-row" style={{ marginTop: 16 }}>
                <div className="grn-readonly-box">
                  <strong>Supplier</strong>
                  <span>{invoice.supplier_name}</span>
                </div>
                <div className="grn-readonly-box">
                  <strong>Warehouse</strong>
                  <span>{invoice.warehouse_name}</span>
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
                  {fieldErrors.invoiceDate && <p className="field-error">{fieldErrors.invoiceDate}</p>}
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
                  {fieldErrors.dueDate && <p className="field-error">{fieldErrors.dueDate}</p>}
                </div>
              </div>
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

              {lines.map((line, index) => (
                <div key={line.id} className="line-item-card">
                  <div className="line-item-number">Line {index + 1}</div>

                  <div className="form-row">
                    <div className="grn-readonly-box">
                      <strong>Product</strong>
                      <span>{line.product_name}</span>
                    </div>
                    <div className="grn-readonly-box">
                      <strong>GR Line</strong>
                      <span>{line.gr_line_item_id}</span>
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
                        onChange={(event) => updateLine(index, 'quantity_invoiced', event.target.value)}
                      />
                      {fieldErrors[`line_${index}_quantity`] && (
                        <p className="field-error">{fieldErrors[`line_${index}_quantity`]}</p>
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
                      />
                      {fieldErrors[`line_${index}_unit_price`] && (
                        <p className="field-error">{fieldErrors[`line_${index}_unit_price`]}</p>
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
                        onChange={(event) => updateLine(index, 'unit_of_measure', event.target.value)}
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
                      placeholder="Optional note"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-card po-summary-card">
              <div className="po-summary-row">
                <span className="po-summary-label">Invoice Lines</span>
                <span className="po-summary-value">{lines.length}</span>
              </div>
              <div className="po-summary-row po-summary-total">
                <span className="po-summary-label">Invoice Total</span>
                <span className="po-summary-value">
                  {invoiceTotal.toLocaleString('en-US', {
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
                onClick={() => navigate(`/procurement/invoices/${invoice.id}`)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSupplierInvoicePage;
