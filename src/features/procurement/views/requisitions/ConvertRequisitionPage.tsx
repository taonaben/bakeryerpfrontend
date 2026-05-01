/**
 * Convert Requisition Page
 * Route: /procurement/requisitions/:requisitionId/convert
 *
 * Select a supplier per line, auto-fill quoted/unit prices from the supplier
 * catalogue, then convert to a Purchase Order.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import useRequisitionDetailStore from '../../stores/requisitionDetailStore';
import { requisitionService } from '../../services/procurement_services';
import { supplierProductsApi } from '../../api/supplier_products';
import type { Supplier, ConvertLineDTO, ConvertRequisitionDTO } from '../../types/models';
import '../../styles/procurement.css';
import '../../../inventory/styles/batch-detail.css';

interface LinePriceRow {
  pr_line_item_id: string;
  product_id: string;
  product_name: string;
  quantity: number | string;
  unit_of_measure: string;
  supplier_id: string;
  quoted_price: string;
  unit_price: string;
  isLoadingPrice: boolean;
}

const ConvertRequisitionPage: React.FC = () => {
  const { requisitionId } = useParams<{ requisitionId: string }>();
  const navigate = useNavigate();

  const requisition = useRequisitionDetailStore((s) => s.requisition);
  const isLoading = useRequisitionDetailStore((s) => s.isLoading);
  const fetchRequisition = useRequisitionDetailStore((s) => s.fetchRequisition);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [defaultSupplierId, setDefaultSupplierId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [lines, setLines] = useState<LinePriceRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // Fetch requisition + suppliers + companyId
  useEffect(() => {
    if (!requisitionId) { navigate('/procurement/requisitions'); return; }
    fetchRequisition(requisitionId);

    const savedUser = localStorage.getItem('erp_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const cid = typeof user.company === 'string' ? user.company : user.company?.id;
        if (cid) setCompanyId(cid);
      } catch { /* ignore */ }
    }

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
          product_id: li.product,
          product_name: li.product_name || li.product,
          quantity: li.quantity,
          unit_of_measure: li.unit_of_measure,
          supplier_id: defaultSupplierId,
          quoted_price: '',
          unit_price: '',
          isLoadingPrice: false,
        })),
      );
    }
  }, [requisition]);

  // When default supplier changes, pre-fill all lines and fetch prices
  useEffect(() => {
    if (!defaultSupplierId || !companyId) return;

    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        supplier_id: line.supplier_id || defaultSupplierId,
        isLoadingPrice: !!line.product_id,
      })),
    );

    const refreshAll = async () => {
      const current = lines.map((line) => ({ ...line, supplier_id: line.supplier_id || defaultSupplierId }));
      const updated = await Promise.all(
        current.map(async (line) => {
          if (!line.product_id) return { ...line, isLoadingPrice: false };
          try {
            const results = await supplierProductsApi.list({
              product_id: line.product_id,
              supplier_id: line.supplier_id,
              company_id: companyId,
            });
            const match = results[0];
            return match
              ? { ...line, quoted_price: match.price, unit_price: match.price, isLoadingPrice: false }
              : { ...line, isLoadingPrice: false };
          } catch {
            return { ...line, isLoadingPrice: false };
          }
        }),
      );
      setLines(updated);
    };

    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSupplierId]);

  // Per-line supplier changed
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

  const updateUnitPrice = (index: number, value: string) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], unit_price: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].supplier_id) {
        setError(`Line ${i + 1} (${lines[i].product_name}): Please select a supplier`);
        return;
      }
      if (!lines[i].unit_price || parseFloat(lines[i].unit_price) <= 0) {
        setError(`Line ${i + 1} (${lines[i].product_name}): Please enter a valid unit price`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const dto: ConvertRequisitionDTO = {
        supplier_id: lines[0]?.supplier_id || defaultSupplierId,
        created_by: '',
        lines: lines.map(
          (l): ConvertLineDTO => ({
            pr_line_item_id: l.pr_line_item_id,
            supplier_id: l.supplier_id,
            quoted_price: l.quoted_price || l.unit_price,
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
              Only approved requisitions can be converted to purchase orders.
              Current status: <strong>{requisition.status}</strong>
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

            {/* Default supplier — pre-fills all lines */}
            <div className="form-card">
              <h2 className="form-card__title">Default Supplier</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>
                  Apply to all lines
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400, marginLeft: 6 }}>
                    (each line can be overridden below)
                  </span>
                </label>
                <select
                  value={defaultSupplierId}
                  onChange={(e) => setDefaultSupplierId(e.target.value)}
                  disabled={loadingSuppliers}
                >
                  <option value="">{loadingSuppliers ? 'Loading suppliers…' : 'Select default supplier'}</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="form-card">
              <h2 className="form-card__title">Line Items</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
                All items from <strong>{requisition.pr_number}</strong> will be included.
                Prices are auto-filled from the supplier catalogue — adjust if the day's price differs.
              </p>

              <div className="convert-lines">
                {lines.map((line, index) => (
                  <div key={line.pr_line_item_id} className="line-item-card">
                    <div className="line-item-number">
                      {index + 1}. <span style={{ fontWeight: 600 }}>{line.product_name}</span>
                      <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 8 }}>
                        {Number(line.quantity).toLocaleString()} {line.unit_of_measure}
                      </span>
                    </div>

                    <div className="form-row" style={{ marginTop: 12 }}>
                      {/* Per-line supplier */}
                      <div className="form-group">
                        <label>Supplier <span className="required">*</span></label>
                        <select
                          value={line.supplier_id}
                          onChange={(e) => handleLineSupplierChange(index, e.target.value)}
                          disabled={loadingSuppliers}
                        >
                          <option value="">Select supplier</option>
                          {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quoted price (read-only) */}
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Tag size={12} style={{ color: '#94a3b8' }} />
                          Quoted Price
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>
                            (catalogue)
                          </span>
                        </label>
                        <div className={`line-total-display${line.isLoadingPrice ? ' po-price-loading' : ''}`}>
                          {line.isLoadingPrice
                            ? 'Fetching…'
                            : line.quoted_price
                            ? `$${parseFloat(line.quoted_price).toFixed(2)}`
                            : line.supplier_id && line.product_id
                            ? 'No catalogue price'
                            : '—'}
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      {/* Unit price (editable) */}
                      <div className="form-group">
                        <label>
                          Unit Price <span className="required">*</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400, marginLeft: 4 }}>
                            (today's agreed price)
                          </span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unit_price}
                          onChange={(e) => updateUnitPrice(index, e.target.value)}
                          placeholder="0.00"
                          disabled={line.isLoadingPrice}
                        />
                        {line.quoted_price && line.unit_price && line.quoted_price !== line.unit_price && (
                          <p className="po-price-diff-hint">
                            {parseFloat(line.unit_price) < parseFloat(line.quoted_price)
                              ? `↓ ${(((parseFloat(line.quoted_price) - parseFloat(line.unit_price)) / parseFloat(line.quoted_price)) * 100).toFixed(1)}% below catalogue`
                              : `↑ ${(((parseFloat(line.unit_price) - parseFloat(line.quoted_price)) / parseFloat(line.quoted_price)) * 100).toFixed(1)}% above catalogue`}
                          </p>
                        )}
                      </div>

                      {/* Line total */}
                      <div className="form-group">
                        <label>Line Total</label>
                        <div className="line-total-display">
                          {line.unit_price && line.quantity
                            ? `$${(parseFloat(line.unit_price) * Number(line.quantity)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                            : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(`/procurement/requisitions/${requisitionId}`)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || loadingSuppliers}
              >
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
