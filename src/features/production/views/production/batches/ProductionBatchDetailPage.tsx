import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Layers } from 'lucide-react';
import Breadcrumb from '@/shared/components/Breadcrumb';
import type { BreadcrumbItem } from '@/shared/components/Breadcrumb';
import { useProductionBatchDetailStore } from '../../../stores/productionBatchDetailStore';
import type {
  BatchMaterial,
  BatchOutput,
  BatchWaste,
  ProductionBatch,
  ProductionBatchLine,
} from '../../../types/productionModels';
import '../../../styles/production.css';
import '@/features/inventory/styles/batch-detail.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

const formatQuantity = (value: number | string) => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(num);
};

const toBadgeClass = (status: string) => {
  const normalized = status?.toLowerCase().replace(/_/g, '-');
  if (!normalized) return 'default';
  if (normalized === 'in-progress') return 'in-progress';
  return normalized;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const OverviewField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="overview-field">
    <span className="overview-field__label">{label}</span>
    <span className="overview-field__value">{children}</span>
  </div>
);

const SectionCard: React.FC<{
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
  emptyMessage: string;
}> = ({ title, headers, rows, emptyMessage }) => (
  <div className="production-card" style={{ marginBottom: '1.25rem' }}>
    <div className="section-title-row" style={{ marginBottom: '1rem' }}>
      <h2 className="section-title">{title}</h2>
      <div className="section-underline" />
    </div>
    {rows.length === 0 ? (
      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>{emptyMessage}</p>
    ) : (
      <div className="table-container" style={{ margin: 0 }}>
        <table className="inventory-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, i) => (
              <tr key={i}>
                {cells.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────

const ProductionBatchDetailPage: React.FC = () => {
  const { orderId, batchId } = useParams<{ orderId: string; batchId: string }>();
  const navigate = useNavigate();

  const batch = useProductionBatchDetailStore((s) => s.batch);
  const isLoading = useProductionBatchDetailStore((s) => s.isLoading);
  const error = useProductionBatchDetailStore((s) => s.error);
  const fetchBatch = useProductionBatchDetailStore((s) => s.fetchBatch);
  const clearBatch = useProductionBatchDetailStore((s) => s.clearBatch);

  useEffect(() => {
    if (!orderId || !batchId) {
      navigate('/production/batches');
      return;
    }
    fetchBatch(orderId, batchId);
    return () => clearBatch();
  }, [orderId, batchId]);

  const handleBack = () => navigate(`/production/orders/${orderId}/batches`);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Production', href: '/production' },
    { label: 'Batches', href: '/production/batches' },
    ...(batch ? [{ label: batch.batch_number, isActive: true } as BreadcrumbItem] : []),
  ];

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={handleBack} className="back-button" aria-label="Go back">
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

  // ── Error ──
  if (error && !batch) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={handleBack} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button
            onClick={() => orderId && batchId && fetchBatch(orderId, batchId)}
            className="btn btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!batch) return null;

  // ── Build table rows ──
  const lineRows: React.ReactNode[][] = batch.lines.map((l: ProductionBatchLine) => [
    <span className="production-pill">{l.sequence}</span>,
    <span className="production-pill production-pill--muted">{l.line_type}</span>,
    l.product_name || '—',
    l.quantity != null ? formatQuantity(l.quantity) : '—',
    l.text || '—',
  ]);

  const materialRows: React.ReactNode[][] = batch.materials.map((m: BatchMaterial) => [
    m.product_name,
    formatQuantity(m.quantity_used),
  ]);

  const outputRows: React.ReactNode[][] = batch.outputs.map((o: BatchOutput) => [
    o.product_name,
    formatQuantity(o.quantity_produced),
  ]);

  const wasteRows: React.ReactNode[][] = batch.waste.map((w: BatchWaste) => [
    w.product_name,
    formatQuantity(w.quantity_wasted),
    w.reason || '—',
  ]);

  return (
    <div className="batch-detail-page production-order-detail-page">
      {/* Header bar */}
      <div className="detail-header">
        <button onClick={handleBack} className="back-button" aria-label="Go back">
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="detail-container">
        {/* Side panel — batch summary */}
        <aside className="side-panel">
          <div className="production-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="production-card__icon">
                <Layers size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                  {batch.batch_number}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Production Batch</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <OverviewField label="Status">
                <span
                  className={`production-status-badge production-status-badge--detail ${toBadgeClass(batch.status)}`}
                >
                  {batch.status.replace(/_/g, ' ')}
                </span>
              </OverviewField>

              <OverviewField label="Qty Produced">
                <strong>{formatQuantity(batch.quantity_produced)}</strong>
              </OverviewField>

              <OverviewField label="Started">
                {formatDateTime(batch.started_at)}
              </OverviewField>

              <OverviewField label="Completed">
                {formatDateTime(batch.completed_at)}
              </OverviewField>

              <OverviewField label="Order ID">
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0', fontSize: '0.8rem', color: '#2563eb' }}
                  onClick={() => navigate(`/production/orders/${orderId}`)}
                >
                  View Order →
                </button>
              </OverviewField>
            </div>
          </div>
        </aside>

        {/* Main content — detail tables */}
        <main className="main-content">
          <SectionCard
            title="Lines"
            headers={['Seq', 'Type', 'Product', 'Quantity', 'Text']}
            rows={lineRows}
            emptyMessage="No lines recorded for this batch."
          />

          <SectionCard
            title="Materials Used"
            headers={['Product', 'Qty Used']}
            rows={materialRows}
            emptyMessage="No materials recorded for this batch."
          />

          <SectionCard
            title="Outputs"
            headers={['Product', 'Qty Produced']}
            rows={outputRows}
            emptyMessage="No outputs recorded for this batch."
          />

          <SectionCard
            title="Waste"
            headers={['Product', 'Qty Wasted', 'Reason']}
            rows={wasteRows}
            emptyMessage="No waste recorded for this batch."
          />
        </main>
      </div>
    </div>
  );
};

export default ProductionBatchDetailPage;
