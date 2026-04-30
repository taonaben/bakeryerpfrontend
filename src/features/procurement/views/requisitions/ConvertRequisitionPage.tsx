/**
 * Convert Requisition Page
 * Route: /procurement/requisitions/:requisitionId/convert
 *
 * Select a supplier, enter unit prices per line item, then convert to a Purchase Order.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useRequisitionDetailStore from '../../stores/requisitionDetailStore';
import { requisitionService } from '../../services/procurement_services';
import type { Supplier, ConvertLineDTO, ConvertRequisitionDTO } from '../../types/models';
import '../../styles/procurement.css';
import '../../../inventory/styles/batch-detail.css';

interface LinePriceRow {
  pr_line_item_id: string;
  product_name: string;
  quantity: number | string;
  unit_of_measure: string;
  unit_price: string;
}

const ConvertRequisitionPage: React.FC = () => {
  const { requisitionId } = useParams<{ requisitionId: string }>();
  const navigate = useNavigate();

  const requisition = useRequisitionDetailStore((s) => s.requisition);
  const isLoading = useRequisitionDetailStore((s) => s.isLoading);
  const fetchRequisition = useRequisitionDetailStore((s) => s.fetchRequisition);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState<LinePriceRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // Fetch requisition + suppliers
  useEffect(() => {
    if (!requisitionId) {
      navigate('/procurement/requisitions');
      return;
    }
    fetchRequisition(requisitionId);

    const loadSuppliers = async () => {
      try {
        const list = await requisitionService.fetchSuppliers();
        setSuppliers(list);
      } catch {
        console.error('Failed to load suppliers');
      } finally {
        setLoadingSuppliers(false);
      }
    };
    loadSuppliers();
  }, [requisitionId, fetchRequisition, navigate]);

  // Populate lines from requisition
  useEffect(() => {
    if (requisition?.line_items) {
      setLines(
        requisition.line_items.map((li) => ({
          pr_line_item_id: li.id,
          product_name: li.product_name || li.product,
          quantity: li.quantity,
          unit_of_measure: li.unit_of_measure,
          unit_price: '',
        })),
      );
    }
  }, [requisition]);

  const updatePrice = (index: number, value: string) => {
    const updated = [...lines];
    updated[index].unit_price = value;
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supplierId) { setError('Please select a supplier'); return; }

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].unit_price || parseFloat(lines[i].unit_price) <= 0) {
        setError(`Line ${i + 1}: Please enter a valid unit price`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const dto: ConvertRequisitionDTO = {
        supplier_id: supplierId,
        created_by: '', // auto-injected by service
        lines: lines.map(
          (l): ConvertLineDTO => ({
            pr_line_item_id: l.pr_line_item_id,
            unit_price: l.unit_price,
          }),
        ),
      };
      await requisitionService.convertRequisition(requisitionId!, dto);
      navigate('/procurement/requisitions');
    } catch (err: any) {
      setError(err.message || 'Failed to convert requisition');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="procurement-page">
        <div className="procurement-content">
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading requisition…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="procurement-page">
        <div className="procurement-content">
          <div className="empty-state">
            <h2 className="empty-state__title">Requisition Not Found</h2>
            <button className="btn btn-primary" onClick={() => navigate('/procurement/requisitions')}>
              Back to Requisitions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requisition.status !== 'Approved') {
    return (
      <div className="procurement-page">
        <div className="procurement-content">
          <div className="empty-state">
            <h2 className="empty-state__title">Cannot Convert</h2>
            <p className="empty-state__description">
              Only approved requisitions can be converted to purchase orders. Current status: <strong>{requisition.status}</strong>
            </p>
            <button className="btn btn-primary" onClick={() => navigate(`/procurement/requisitions/${requisitionId}`)}>
              Back to Requisition
            </button>
          </div>
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
              onClick={() => navigate(`/procurement/requisitions/${requisitionId}`)}
              type="button"
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1>Convert to Purchase Order</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Requisitions / {requisition.pr_number} / Convert
            </p>
          </div>
        </div>
      </div>

      <div className="procurement-content">
        <div className="convert-page">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError(null)} type="button">Dismiss</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="convert-form">
            {/* Supplier Selection */}
            <div className="form-card">
              <h2 className="form-card__title">Supplier</h2>
              <div className="form-group">
                <label>Select Supplier <span className="required">*</span></label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} disabled={loadingSuppliers}>
                  <option value="">{loadingSuppliers ? 'Loading suppliers…' : 'Select supplier'}</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Line Items with Unit Prices */}
            <div className="form-card">
              <h2 className="form-card__title">Line Items — Unit Prices</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
                Enter the unit price for each item. All items from <strong>{requisition.pr_number}</strong> will be included in the purchase order.
              </p>

              <table className="convert-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>UoM</th>
                    <th>Unit Price *</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={line.pr_line_item_id}>
                      <td className="text-muted">{index + 1}</td>
                      <td style={{ fontWeight: 500 }}>{line.product_name}</td>
                      <td>{Number(line.quantity).toLocaleString()}</td>
                      <td>{line.unit_of_measure || '—'}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unit_price}
                          onChange={(e) => updatePrice(index, e.target.value)}
                          placeholder="0.00"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(`/procurement/requisitions/${requisitionId}`)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting || loadingSuppliers}>
                {submitting ? 'Converting…' : 'Convert to Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConvertRequisitionPage;
