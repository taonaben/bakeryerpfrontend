import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { requisitionService } from '../../services/procurement_services';
import { useProductStore } from '../../../../core/products/stores/productStore';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type { Warehouse } from '../../../../core/warehouses/types/models';
import type { product } from '../../../../core/products/types/models';
import type { CreateRequisitionLineDTO } from '../../types/models';
import '../../styles/procurement.css';

// ──────────────────────────────────────────────
// Line item shape (internal form state)
// ──────────────────────────────────────────────
interface LineItemForm {
  product_id: string;
  quantity: string;
  unit_of_measure: string;
  description: string;
}

const emptyLine = (): LineItemForm => ({
  product_id: '',
  quantity: '',
  unit_of_measure: '',
  description: '',
});

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
interface CreateRequisitionPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const CreateRequisitionPage: React.FC<CreateRequisitionPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();

  // ─── Reference data ─────────────────────────
  const { products, fetchProducts } = useProductStore();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [refLoading, setRefLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setRefLoading(true);
      try {
        await fetchProducts();
        // Grab user's company from local storage
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
  }, [fetchProducts]);

  // ─── Form state ─────────────────────────────
  const [warehouseId, setWarehouseId] = useState(activeWarehouse?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<LineItemForm[]>([emptyLine()]);

  // ─── Submission state ───────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ─── Auto-fill unit when product is selected ─
  const handleProductChange = (index: number, productId: string) => {
    const updated = [...lines];
    updated[index].product_id = productId;

    const selected = products.find((p: product) => p.id === productId);
    if (selected) {
      updated[index].unit_of_measure = selected.unit_of_measure || '';
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
    if (lines.length <= 1) return; // Keep at least 1
    setLines(lines.filter((_, i) => i !== index));
  };

  // ─── Validate ───────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!warehouseId) errors.warehouseId = 'Warehouse is required';
    if (!title.trim()) errors.title = 'Title is required';

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

    setSubmitting(true);
    try {
      const dto = {
        warehouse_id: warehouseId,
        title: title.trim(),
        description: description.trim() || undefined,
        lines: lines.map(
          (l): CreateRequisitionLineDTO => ({
            product_id: l.product_id,
            quantity: l.quantity,
            unit_of_measure: l.unit_of_measure,
            description: l.description || undefined,
          }),
        ),
      };

      await requisitionService.createRequisition(dto);
      navigate('/procurement/requisitions');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create requisition');
    } finally {
      setSubmitting(false);
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
              onClick={() => navigate('/procurement/requisitions')}
              type="button"
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1>New Requisition</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Requisitions / New
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
            {/* ─── Details Card ────────────────── */}
            <div className="form-card">
              <h2 className="form-card__title">Requisition Details</h2>

              <div className="form-row">
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

                <div className="form-group">
                  <label>
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Yeast & Bread Improver"
                  />
                  {fieldErrors.title && (
                    <p className="field-error">{fieldErrors.title}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes about this requisition…"
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
                        disabled={refLoading}
                      >
                        <option value="">
                          {refLoading ? 'Loading products…' : 'Select product'}
                        </option>
                        {products.map((p: product) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                      {fieldErrors[`line_${index}_product`] && (
                        <p className="field-error">
                          {fieldErrors[`line_${index}_product`]}
                        </p>
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
                        <p className="field-error">
                          {fieldErrors[`line_${index}_quantity`]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Unit of Measure</label>
                      <input
                        type="text"
                        value={line.unit_of_measure}
                        onChange={(e) =>
                          updateLine(index, 'unit_of_measure', e.target.value)
                        }
                        placeholder="e.g. kg, litres, bags"
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) =>
                          updateLine(index, 'description', e.target.value)
                        }
                        placeholder="Optional note"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="add-line-btn" onClick={addLine}>
                <Plus size={16} />
                Add Another Item
              </button>
            </div>

            {/* ─── Form Actions ────────────────── */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/procurement/requisitions')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || refLoading}
              >
                {submitting ? 'Creating…' : 'Create Requisition'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequisitionPage;
