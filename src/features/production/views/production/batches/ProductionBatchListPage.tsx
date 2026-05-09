import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import NoWarehouseSelected from '@/features/inventory/components/NoWarehouseSelected';
import ProcurementToolbar from '@/features/procurement/components/toolbar';
import { useProductionBatchListStore } from '../../../stores/productionBatchListStore';
import type { ProductionBatch } from '../../../types/productionModels';
import '../../../styles/production.css';

interface ProductionBatchListPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const BATCH_STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const toBadgeClass = (status: string) => {
  const normalized = status?.toLowerCase().replace(/_/g, '-');
  if (!normalized) return 'default';
  if (normalized === 'in-progress') return 'in-progress';
  return normalized;
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

const formatQuantity = (value: number | string) => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(num);
};

const BatchesTable: React.FC<{
  batches: ProductionBatch[];
  isLoading: boolean;
  onRowClick: (batch: ProductionBatch) => void;
}> = ({ batches, isLoading, onRowClick }) => {
  if (isLoading) {
    return (
      <div className="table-container">
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading batches...</span>
        </div>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Layers size={48} />
          </div>
          <h3 className="empty-state__title">No batches found</h3>
          <p className="empty-state__description">
            There are no production batches matching your filters for this warehouse.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="inventory-table production-orders-table">
        <thead>
          <tr>
            <th>Batch #</th>
            <th>Production Order</th>
            <th className="quantity-cell">Qty Produced</th>
            <th>Status</th>
            <th>Started</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr
              key={batch.id}
              onClick={() => onRowClick(batch)}
              style={{ cursor: 'pointer' }}
            >
              <td>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{batch.batch_number}</span>
              </td>
              <td>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {batch.production_order || '—'}
                </span>
              </td>
              <td className="quantity-cell">{formatQuantity(batch.quantity_produced)}</td>
              <td>
                <span className={`production-status-badge ${toBadgeClass(batch.status)}`}>
                  {batch.status?.replace(/_/g, ' ') || '—'}
                </span>
              </td>
              <td className="text-muted">{formatDateTime(batch.started_at)}</td>
              <td className="text-muted">{formatDateTime(batch.completed_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProductionBatchListPage: React.FC<ProductionBatchListPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const { batches, isLoading, error, fetchBatchesForWarehouse, clearBatches } =
    useProductionBatchListStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!activeWarehouse?.id) return;
    fetchBatchesForWarehouse(activeWarehouse.id);
    return () => clearBatches();
  }, [activeWarehouse?.id]);

  if (!activeWarehouse?.id) {
    return <NoWarehouseSelected onBack={() => navigate('/production')} />;
  }

  const filteredBatches = useMemo(() => {
    let result = batches;

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      result = result.filter((b) =>
        [b.batch_number, b.status, b.production_order].some((v) =>
          v?.toLowerCase().includes(query),
        ),
      );
    }

    return result;
  }, [batches, statusFilter, searchTerm]);

  const handleRowClick = (batch: ProductionBatch) => {
    navigate(`/production/orders/${batch.production_order}/batches/${batch.id}`);
  };

  return (
    <div className="production-page">
      <div className="production-sticky-stack">
        <div className="production-page-header">
          <div className="production-page-header__left">
            <h1>Production Batches</h1>
            <p className="production-page-header__breadcrumb">Production / Batches</p>
          </div>
        </div>

        <ProcurementToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeStatus={statusFilter}
          onStatusChange={setStatusFilter}
          placeholder="Search batch number, order ID..."
          tabs={BATCH_STATUS_OPTIONS}
        />
      </div>

      <div className="production-content">
        {error && <div className="error-banner">{error}</div>}

        <BatchesTable
          batches={filteredBatches}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
};

export default ProductionBatchListPage;
