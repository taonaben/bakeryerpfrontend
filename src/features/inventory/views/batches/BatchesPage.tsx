import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/inventoryService';
import { useBatchFilters } from '../../hooks/useBatchFilters';
import type { BatchRegistry } from '../../types/models';
import '../../styles/inventory.css';
import InventoryListToolbar from '../../components/InventoryListToolbar';
import BatchesRegistryTable from './BatchesRegistryTable.tsx';
import BatchModal from './add_batch_modal';
import NoWarehouseSelected from '../../components/NoWarehouseSelected';

interface BatchesPageProps {
  activeWarehouse?: { id: string; name: string };
}

const BatchesPage = ({ activeWarehouse }: BatchesPageProps) => {
  const navigate = useNavigate();
  const batchFilters = useBatchFilters();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<BatchRegistry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const warehouseId = activeWarehouse?.id;
  const activeStatus = batchFilters.filters.status[0] || '';

  const handleStatusChange = (status: string) => {
    batchFilters.updateFilter('status', status ? [status] : []);
    batchFilters.updateFilter('page', 1);
  };

  const handleSortChange = (ordering: string) => {
    batchFilters.updateFilter('ordering', ordering);
    batchFilters.updateFilter('page', 1);
  };

  useEffect(() => {
    if (!warehouseId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const filterParams = {
          warehouse_id: warehouseId,
          ...batchFilters.getApiQueryParams(),
          ...(searchTerm && { search: searchTerm }),
        };
        const result = await inventoryService.fetchBatches(warehouseId, filterParams);
        setBatches(result.data);
        setTotalPages(result.totalPages);
      } catch (err: any) {
        setError(err.message || 'Failed to load batches');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouseId, searchTerm, batchFilters.filters]);

  useEffect(() => {
    batchFilters.updateFilter('page', 1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    batchFilters.updateFilter('page', page);
  };

  const handleCreateBatch = async (batchData: any) => {
    if (!warehouseId) return;

    setSubmitting(true);
    try {
      await inventoryService.createBatch({
        ...batchData,
        warehouse: warehouseId,
      });
      setShowBatchModal(false);
      const filterParams = {
        warehouse_id: warehouseId,
        ...batchFilters.getApiQueryParams(),
        page: 1,
      };
      const result = await inventoryService.fetchBatches(warehouseId, filterParams);
      setBatches(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to create batch');
      console.error('Create batch error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!warehouseId) {
    return <NoWarehouseSelected onBack={() => navigate('/dashboard')} />;
  }

  return (
    <div className="inventory-page">
      <div className="inventory-sticky-stack">
        <div className="inventory-header">
          <h1>Batches Registry</h1>
        </div>
        <InventoryListToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeStatus}
          onTabChange={handleStatusChange}
          tabs={[
            { label: 'All', value: '' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Expired', value: 'EXPIRED' },
            { label: 'Depleted', value: 'DEPLETED' },
          ]}
          sortValue={batchFilters.filters.ordering}
          onSortChange={handleSortChange}
          sortOptions={[
            { label: 'Batch number', value: 'batch_number' },
            { label: 'Manufacture date', value: 'manufacture_date' },
            { label: 'Expiry date', value: 'expiry_date' },
            { label: 'Quantity', value: 'quantity' },
            { label: 'Created', value: 'created_at' },
          ]}
          placeholder="Search batch number..."
          action={{ label: 'New Batch', onClick: () => setShowBatchModal(true) }}
        />
      </div>
      <div className="inventory-content">
        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <BatchesRegistryTable
            batches={batches}
            currentPage={batchFilters.filters.page || 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        )}
      </div>

      <BatchModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        warehouseId={warehouseId}
        onSubmit={handleCreateBatch}
        submitting={submitting}
      />
    </div>
  );
};

export default BatchesPage;
