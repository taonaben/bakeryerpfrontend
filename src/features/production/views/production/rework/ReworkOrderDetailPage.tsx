import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Breadcrumb from '@/shared/components/Breadcrumb';
import type { BreadcrumbItem } from '@/shared/components/Breadcrumb';
import { inventoryService } from '@/features/inventory/services/inventoryService';
import type { BatchRegistry } from '@/features/inventory/types/models';
import { useProductStore } from '@/core/products/stores/productStore';
import { useReworkOrderDetailStore } from '../../../stores';
import type { StartReworkPayload } from '../../../types/productionModels';
import '../../../styles/production.css';
import '../../../styles/planning.css';
import '@/features/inventory/styles/batch-detail.css';

type StartInputDraft = {
  selected: boolean;
  quantity: string;
  notes: string;
};

type OutputDraft = {
  product: string;
  quantity: string;
};

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toStatusBadgeClass = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === 'completed') return 'status-good';
  if (normalized === 'in_progress' || normalized === 'in-progress') return 'status-warning';
  if (normalized === 'cancelled') return 'status-critical';
  return 'status-warning';
};

const ReworkOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const order = useReworkOrderDetailStore((state) => state.order);
  const isLoading = useReworkOrderDetailStore((state) => state.isLoading);
  const isStarting = useReworkOrderDetailStore((state) => state.isStarting);
  const isFinishing = useReworkOrderDetailStore((state) => state.isFinishing);
  const isDeleting = useReworkOrderDetailStore((state) => state.isDeleting);
  const error = useReworkOrderDetailStore((state) => state.error);
  const lastStartResult = useReworkOrderDetailStore((state) => state.lastStartResult);
  const lastFinishResult = useReworkOrderDetailStore((state) => state.lastFinishResult);
  const fetchOrder = useReworkOrderDetailStore((state) => state.fetchOrder);
  const clearOrder = useReworkOrderDetailStore((state) => state.clearOrder);
  const startOrder = useReworkOrderDetailStore((state) => state.startOrder);
  const finishOrder = useReworkOrderDetailStore((state) => state.finishOrder);
  const deleteOrder = useReworkOrderDetailStore((state) => state.deleteOrder);

  const productMap = useProductStore((state) => state.productMap);
  const fetchProduct = useProductStore((state) => state.fetchProduct);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [batchSearch, setBatchSearch] = useState('');
  const [batches, setBatches] = useState<BatchRegistry[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesError, setBatchesError] = useState<string | null>(null);

  const [startInputs, setStartInputs] = useState<Record<string, StartInputDraft>>({});
  const [startFormError, setStartFormError] = useState<string | null>(null);

  const [outputs, setOutputs] = useState<OutputDraft[]>([{ product: '', quantity: '' }]);
  const [finishFormError, setFinishFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/production/rework');
      return;
    }

    fetchOrder(orderId);

    return () => {
      clearOrder();
    };
  }, [orderId, navigate, fetchOrder, clearOrder]);

  useEffect(() => {
    fetchProducts().catch(() => null);
  }, [fetchProducts]);

  useEffect(() => {
    if (!order?.target_product) return;

    setOutputs((prev) => {
      if (prev.length === 0) return [{ product: order.target_product, quantity: '' }];
      if (!prev[0].product) {
        const next = [...prev];
        next[0] = { ...next[0], product: order.target_product };
        return next;
      }
      return prev;
    });
  }, [order?.target_product]);

  useEffect(() => {
    if (!order?.warehouse) return;

    const fetchBatches = async () => {
      setBatchesLoading(true);
      setBatchesError(null);

      try {
        const result = await inventoryService.fetchBatches(order.warehouse, {
          warehouse_id: order.warehouse,
          ...(batchSearch ? { search: batchSearch } : {}),
          page: 1,
          page_size: 50,
        });
        setBatches(result.data);
      } catch (err: any) {
        setBatchesError(err.message || 'Failed to load batches');
      } finally {
        setBatchesLoading(false);
      }
    };

    fetchBatches();
  }, [order?.warehouse, batchSearch]);

  const missingBatchProductIds = useMemo(() => {
    const productIds = Array.from(new Set(batches.map((b) => b.product).filter(Boolean)));
    return productIds.filter((id) => !productMap[id]);
  }, [batches, productMap]);

  useEffect(() => {
    if (missingBatchProductIds.length === 0) return;

    Promise.allSettled(missingBatchProductIds.map((id) => fetchProduct(id).catch(() => null))).catch(
      () => null,
    );
  }, [missingBatchProductIds, fetchProduct]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Production', href: '/production' },
    { label: 'Rework', href: '/production/rework' },
    ...(order ? [{ label: order.id, isActive: true } as BreadcrumbItem] : []),
  ];

  const normalizedStatus = order?.status?.toLowerCase() ?? '';
  const canStart = order ? !['in_progress', 'completed', 'cancelled'].includes(normalizedStatus) : false;
  const canFinish = order ? normalizedStatus === 'in_progress' : false;

  const selectedInputCount = useMemo(
    () => Object.values(startInputs).filter((row) => row.selected).length,
    [startInputs],
  );

  const handleToggleBatch = (batch: BatchRegistry) => {
    setStartFormError(null);

    setStartInputs((prev) => {
      const existing = prev[batch.id];
      const nextSelected = !(existing?.selected ?? false);

      return {
        ...prev,
        [batch.id]: {
          selected: nextSelected,
          quantity: existing?.quantity ?? '',
          notes: existing?.notes ?? '',
        },
      };
    });
  };

  const handleStart = async () => {
    if (!order) return;

    setStartFormError(null);

    const inputs = Object.entries(startInputs)
      .filter(([, value]) => value.selected)
      .map(([batch_id, value]) => ({
        batch_id,
        quantity: value.quantity,
        ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
      }))
      .filter((row) => row.batch_id);

    if (inputs.length === 0) {
      setStartFormError('Select at least one batch and enter a quantity.');
      return;
    }

    const invalid = inputs.find((input) => !input.quantity || Number(input.quantity) <= 0);
    if (invalid) {
      setStartFormError('All selected batches must have a quantity greater than 0.');
      return;
    }

    try {
      const payload: StartReworkPayload = {
        inputs: inputs.map((row) => ({
          batch_id: row.batch_id,
          quantity: row.quantity,
          ...(row.notes ? { notes: row.notes } : {}),
        })),
      };

      await startOrder(order.id, payload);
    } catch (err: any) {
      setStartFormError(err.message || 'Failed to start rework order');
    }
  };

  const handleAddOutputRow = () => {
    setFinishFormError(null);
    setOutputs((prev) => [...prev, { product: order?.target_product ?? '', quantity: '' }]);
  };

  const handleRemoveOutputRow = (index: number) => {
    setFinishFormError(null);
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    if (!order) return;

    setFinishFormError(null);

    const cleanOutputs = outputs
      .map((row) => ({ product: row.product, quantity: row.quantity }))
      .filter((row) => row.product && row.quantity);

    if (cleanOutputs.length === 0) {
      setFinishFormError('Add at least one output row (product + quantity).');
      return;
    }

    const invalid = cleanOutputs.find((row) => Number(row.quantity) <= 0 || Number.isNaN(Number(row.quantity)));
    if (invalid) {
      setFinishFormError('All output quantities must be a number greater than 0.');
      return;
    }

    try {
      await finishOrder(order.id, {
        outputs: cleanOutputs.map((row) => ({
          product: row.product,
          quantity: row.quantity,
        })),
      });
    } catch (err: any) {
      setFinishFormError(err.message || 'Failed to finish rework order');
    }
  };

  if (isLoading) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="loading-skeleton">
          <div className="skeleton-sidebar" />
          <div className="skeleton-content" />
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button onClick={() => orderId && fetchOrder(orderId)} className="btn btn-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Rework Order Not Found</h2>
          <p>The rework order you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="detail-container">
        <aside className="side-panel">
          <div className="side-panel__header">
            <h2 className="side-panel__title">Rework Order</h2>
          </div>

          <div className="side-panel__metadata">
            <div className="metadata-item">
              <label>ID</label>
              <div className="metadata-value">
                <code className="batch-id">{order.id}</code>
              </div>
            </div>

            <div className="metadata-item">
              <label>Status</label>
              <div className="metadata-value">
                <span className={`status-badge ${toStatusBadgeClass(order.status)}`}>{order.status}</span>
              </div>
            </div>

            <div className="metadata-item">
              <label>Warehouse</label>
              <div className="metadata-value">{order.warehouse_name}</div>
            </div>

            <div className="metadata-item">
              <label>Target</label>
              <div className="metadata-value">{order.target_product_name}</div>
            </div>

            <div className="metadata-item">
              <label>Quantity Requested</label>
              <div className="metadata-value">{order.quantity_requested}</div>
            </div>

            <div className="metadata-item">
              <label>Created</label>
              <div className="metadata-value">{formatDateTime(order.created_at)}</div>
            </div>

            <div className="metadata-item">
              <label>Completed</label>
              <div className="metadata-value">{formatDateTime(order.completed_at)}</div>
            </div>
          </div>

          <div className="side-panel__actions">
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => orderId && fetchOrder(orderId)}
              disabled={isStarting || isFinishing || isDeleting}
            >
              Refresh
            </button>

            <button
              type="button"
              className="btn btn-danger btn-block"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isStarting || isFinishing || isDeleting}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </aside>

        <main className="main-content">
          <section className="detail-section">
            <h2 className="section-title">Rework Details</h2>

            <div className="overview-card">
              <div className="overview-grid">
                <div className="overview-item">
                  <span className="overview-label">Reason</span>
                  <span className="overview-value">{order.reason || '—'}</span>
                </div>

                <div className="overview-item">
                  <span className="overview-label">Warehouse</span>
                  <span className="overview-value">{order.warehouse_name}</span>
                </div>

                <div className="overview-item">
                  <span className="overview-label">Target Product</span>
                  <span className="overview-value">{order.target_product_name}</span>
                </div>

                <div className="overview-item">
                  <span className="overview-label">Quantity Requested</span>
                  <span className="overview-value">
                    <span className="quantity">{order.quantity_requested}</span>
                  </span>
                </div>

                <div className="overview-item">
                  <span className="overview-label">Created</span>
                  <span className="overview-value">{formatDateTime(order.created_at)}</span>
                </div>

                <div className="overview-item">
                  <span className="overview-label">Completed</span>
                  <span className="overview-value">{formatDateTime(order.completed_at)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <h2 className="section-title">Start Rework (inputs)</h2>

            {lastStartResult?.message && <div className="success-banner">{lastStartResult.message}</div>}
            {startFormError && <div className="error-banner">{startFormError}</div>}

            {order.inputs?.length ? (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: 0, marginBottom: '8px' }}>Recorded inputs</h3>
                <div className="table-container">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Batch</th>
                        <th>Product</th>
                        <th className="quantity-cell">Qty Used</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.inputs.map((input) => (
                        <tr key={input.id}>
                          <td>{input.batch_number}</td>
                          <td>{input.product_name}</td>
                          <td className="quantity-cell">{input.quantity_used}</td>
                          <td className="text-muted">{input.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <p className="text-muted" style={{ marginTop: 0 }}>
              Select one or more batches to consume as rework inputs (batch + quantity + optional notes).
            </p>

            {!canStart && (
              <div className="pending-notice">
                <p className="pending-notice__text">
                  This order cannot be started in its current status (<strong>{order.status}</strong>).
                </p>
              </div>
            )}

            <div className="production-planning-toolbar" style={{ borderRadius: '8px', borderBottom: '1px solid #e2e8f0' }}>
              <div className="production-planning-toolbar__left">
                <div className="search-bar" style={{ maxWidth: 360 }}>
                  <input
                    type="text"
                    value={batchSearch}
                    onChange={(e) => setBatchSearch(e.target.value)}
                    placeholder="Search batches by number/product..."
                    aria-label="Search batches"
                    disabled={batchesLoading}
                  />
                </div>
              </div>
              <div className="production-planning-toolbar__right">
                <span className="text-muted">Selected: {selectedInputCount}</span>
              </div>
            </div>

            {batchesError && <div className="error-banner">{batchesError}</div>}

            <div className="table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th />
                    <th>Batch</th>
                    <th>Product</th>
                    <th className="quantity-cell">Available</th>
                    <th className="quantity-cell">Qty to use</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th>Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {batchesLoading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center' }}>
                        Loading batches...
                      </td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center' }}>
                        No batches found.
                      </td>
                    </tr>
                  ) : (
                    batches.map((batch) => {
                      const row = startInputs[batch.id];
                      const selected = row?.selected ?? false;
                      const productName = productMap[batch.product]?.name || batch.product;

                      return (
                        <tr key={batch.id} className={selected ? 'row--selected' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => handleToggleBatch(batch)}
                              aria-label={`Select batch ${batch.batch_number}`}
                              disabled={!canStart}
                            />
                          </td>
                          <td>{batch.batch_number}</td>
                          <td style={{ fontWeight: 600 }}>{productName}</td>
                          <td className="quantity-cell">{batch.quantity}</td>
                          <td className="quantity-cell">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row?.quantity ?? ''}
                              onChange={(e) =>
                                setStartInputs((prev) => ({
                                  ...prev,
                                  [batch.id]: {
                                    selected: selected,
                                    quantity: e.target.value,
                                    notes: prev[batch.id]?.notes ?? '',
                                  },
                                }))
                              }
                              disabled={!selected || !canStart || isStarting}
                              style={{ width: 120 }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row?.notes ?? ''}
                              onChange={(e) =>
                                setStartInputs((prev) => ({
                                  ...prev,
                                  [batch.id]: {
                                    selected: selected,
                                    quantity: prev[batch.id]?.quantity ?? '',
                                    notes: e.target.value,
                                  },
                                }))
                              }
                              disabled={!selected || !canStart || isStarting}
                              placeholder="Optional"
                            />
                          </td>
                          <td>{batch.status}</td>
                          <td className="text-muted">{new Date(batch.expiry_date).toLocaleDateString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="section-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStart}
                disabled={!canStart || isStarting || selectedInputCount === 0}
                title={!canStart ? 'Order is not in a startable status' : undefined}
              >
                {isStarting ? 'Starting...' : 'Start Rework'}
              </button>
            </div>
          </section>

          <section className="detail-section">
            <h2 className="section-title">Finish Rework (outputs)</h2>

            {lastFinishResult?.message && <div className="success-banner">{lastFinishResult.message}</div>}
            {finishFormError && <div className="error-banner">{finishFormError}</div>}

            {order.outputs?.length ? (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: 0, marginBottom: '8px' }}>Recorded outputs</h3>
                <div className="table-container">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="quantity-cell">Qty Produced</th>
                        <th>Output Batch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.outputs.map((output) => (
                        <tr key={output.id}>
                          <td>{output.product_name}</td>
                          <td className="quantity-cell">{output.quantity_produced}</td>
                          <td className="text-muted">{output.output_batch_number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {!canFinish && (
              <div className="pending-notice">
                <p className="pending-notice__text">
                  This order can only be finished when it is <strong>in progress</strong>. Current status: <strong>{order.status}</strong>.
                </p>
              </div>
            )}

            <p className="text-muted" style={{ marginTop: 0 }}>
              Enter the recovered outputs (product + quantity) produced by the rework.
            </p>

            <div className="table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th style={{ width: '55%' }}>Product</th>
                    <th className="quantity-cell" style={{ width: '25%' }}>Quantity</th>
                    <th style={{ width: '20%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outputs.map((row, index) => (
                    <tr key={`${row.product}-${index}`}>
                      <td>
                        <select
                          value={row.product}
                          onChange={(e) =>
                            setOutputs((prev) =>
                              prev.map((item, i) => (i === index ? { ...item, product: e.target.value } : item)),
                            )
                          }
                          disabled={!canFinish || isFinishing}
                          style={{ width: '100%' }}
                        >
                          <option value="">Select product</option>
                          {Object.values(productMap).map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="quantity-cell">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.quantity}
                          onChange={(e) =>
                            setOutputs((prev) =>
                              prev.map((item, i) => (i === index ? { ...item, quantity: e.target.value } : item)),
                            )
                          }
                          disabled={!canFinish || isFinishing}
                          style={{ width: 140 }}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRemoveOutputRow(index)}
                          disabled={!canFinish || isFinishing || outputs.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bulk-actions-bar" style={{ marginTop: '12px' }}>
              <div className="bulk-actions-bar__info">
                <span className="bulk-actions-bar__count">Outputs: {outputs.length}</span>
              </div>
              <div className="bulk-actions-bar__actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddOutputRow}
                  disabled={!canFinish || isFinishing}
                >
                  <Plus size={16} />
                  Add output
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleFinish}
                  disabled={!canFinish || isFinishing}
                >
                  {isFinishing ? 'Finishing...' : 'Finish Rework'}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {showDeleteConfirm && (
        <div className="confirmation-dialog" role="dialog" aria-modal="true">
          <div className="confirmation-dialog__overlay" onClick={() => setShowDeleteConfirm(false)} />
          <div className="confirmation-dialog__content">
            <h3>Delete rework order?</h3>
            <p>This will permanently delete rework order <strong>{order.id}</strong>.</p>
            <p>This action cannot be undone.</p>
            <div className="confirmation-dialog__actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    await deleteOrder(order.id);
                    navigate('/production/rework');
                  } catch {
                    // store error handles display
                  } finally {
                    setShowDeleteConfirm(false);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReworkOrderDetailPage;
