/**
 * Edit Requisition Modal — Requisition Detail
 * Form to edit requisition title, description, and line items (Draft only)
 */

import React, { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { PurchaseRequisition, UpdateRequisitionDTO, CreateRequisitionLineDTO } from '../../types/models';
import type { product } from '../../../../core/products/types/models';
import { useProductStore } from '../../../../core/products/stores/productStore';
import useRequisitionDetailStore from '../../stores/requisitionDetailStore';

interface EditRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: PurchaseRequisition;
}

interface LineItemForm {
  product_id: string;
  quantity: string;
  unit_of_measure: string;
  description: string;
}

const EditRequisitionModal: React.FC<EditRequisitionModalProps> = ({ isOpen, onClose, requisition }) => {
  const { products, fetchProducts } = useProductStore();
  const isUpdating = useRequisitionDetailStore((s) => s.isUpdating);
  const updateRequisition = useRequisitionDetailStore((s) => s.updateRequisition);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<LineItemForm[]>([]);
  const [error, setError] = useState('');

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen && requisition) {
      setTitle(requisition.title || '');
      setDescription(requisition.description || '');
      setLines(
        requisition.line_items.length > 0
          ? requisition.line_items.map((li) => ({
              product_id: li.product || '',
              quantity: String(li.quantity),
              unit_of_measure: li.unit_of_measure || '',
              description: li.description || '',
            }))
          : [{ product_id: '', quantity: '', unit_of_measure: '', description: '' }],
      );
      setError('');
      fetchProducts();
    }
  }, [isOpen, requisition, fetchProducts]);

  if (!isOpen) return null;

  const handleProductChange = (index: number, productId: string) => {
    const updated = [...lines];
    updated[index].product_id = productId;
    const selected = products.find((p: product) => p.id === productId);
    if (selected) {
      updated[index].unit_of_measure = selected.unit_of_measure || '';
    }
    setLines(updated);
  };

  const updateLine = (index: number, field: keyof LineItemForm, value: string) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const addLine = () => setLines([...lines, { product_id: '', quantity: '', unit_of_measure: '', description: '' }]);

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Title is required'); return; }

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].product_id) { setError(`Line ${i + 1}: Product is required`); return; }
      if (!lines[i].quantity || parseFloat(lines[i].quantity) <= 0) {
        setError(`Line ${i + 1}: Valid quantity is required`);
        return;
      }
    }

    try {
      const dto: UpdateRequisitionDTO = {
        title: title.trim(),
        description: description.trim() || undefined,
        warehouse_id: requisition.warehouse,
        lines: lines.map(
          (l): CreateRequisitionLineDTO => ({
            product_id: l.product_id,
            quantity: l.quantity,
            unit_of_measure: l.unit_of_measure,
            description: l.description || undefined,
          }),
        ),
      };
      await updateRequisition(requisition.id, dto);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update requisition');
    }
  };

  const handleClose = () => {
    if (!isUpdating) onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className="modal-content" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2>Edit Requisition</h2>
          <button className="modal-close-btn" onClick={handleClose} type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {error && <div className="modal-error" role="alert">{error}</div>}

          <div className="form-group">
            <label>Title <span className="required">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          {/* Line Items */}
          <div className="edit-lines-section">
            <div className="line-items-header">
              <label style={{ fontWeight: 600, margin: 0 }}>Items</label>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{lines.length} {lines.length === 1 ? 'item' : 'items'}</span>
            </div>

            {lines.map((line, index) => (
              <div key={index} className="line-item-card">
                <div className="line-item-number">Item {index + 1}</div>
                {lines.length > 1 && (
                  <button type="button" className="remove-line-btn" onClick={() => removeLine(index)} aria-label={`Remove item ${index + 1}`}>
                    <X size={16} />
                  </button>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label>Product <span className="required">*</span></label>
                    <select value={line.product_id} onChange={(e) => handleProductChange(index, e.target.value)}>
                      <option value="">Select product</option>
                      {products.map((p: product) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity <span className="required">*</span></label>
                    <input type="number" min="0" step="any" value={line.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Unit of Measure</label>
                    <input type="text" value={line.unit_of_measure} onChange={(e) => updateLine(index, 'unit_of_measure', e.target.value)} placeholder="e.g. kg, litres" />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input type="text" value={line.description} onChange={(e) => updateLine(index, 'description', e.target.value)} placeholder="Optional note" />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="add-line-btn" onClick={addLine}>
              <Plus size={16} /> Add Another Item
            </button>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={isUpdating}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isUpdating}>{isUpdating ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditRequisitionModal;
