import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import '../styles/inventory.css';
import InventoryTabs from './InventoryTabs';
import InventoryToolbar from '../components/InventoryToolbar';
import MovementLedgerTable from './stock_movements/MovementLedgerTable';
import StockBalancesTable from './stock_balances/StockBalancesTable';
import BatchesRegistryTable from './batches/BatchesRegistryTable';
import BatchModal from './batches/add_batch_modal';
import NoWarehouseSelected from '../components/NoWarehouseSelected';

interface InventoryPageProps {
  activeWarehouse?: { id: string; name: string };
}

const InventoryPage = ({ activeWarehouse }: InventoryPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL query parameter
  const getActiveTabFromQuery = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'batches' || tab === 'movements' || tab === 'balances') {
      return tab;
    }
    return 'movements'; // default
  };

  // Local state
  const [activeTab, setActiveTab] = useState<'movements' | 'balances' | 'batches'>(getActiveTabFromQuery());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [movementsCurrentPage, setMovementsCurrentPage] = useState(1);
  const [movementsTotalPages, setMovementsTotalPages] = useState(1);
  const [balancesCurrentPage, setBalancesCurrentPage] = useState(1);
  const [balancesTotalPages, setBalancesTotalPages] = useState(1);
  const [batchesCurrentPage, setBatchesCurrentPage] = useState(1);
  const [batchesTotalPages, setBatchesTotalPages] = useState(1);

  // Data state
  const [movements, setMovements] = useState([]);
  const [balances, setBalances] = useState([]);
  const [batches, setBatches] = useState([]);

  // Modal state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync URL with active tab
  useEffect(() => {
    const currentTab = getActiveTabFromQuery();
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [location.search]);

  // Navigate to tab via query parameter
  const handleTabChange = (tab: 'movements' | 'balances' | 'batches') => {
    setActiveTab(tab);
    navigate(`/inventory?tab=${tab}`);
  };

  const warehouseId = activeWarehouse?.id;

  // Remove the previous redirect effect
  // Users will stay on /inventory, just with different query params

  // Fetch data based on active tab, warehouse, and search term
  useEffect(() => {
    if (!warehouseId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === 'movements') {
          const result = await inventoryService.fetchMovements(warehouseId, searchTerm, movementsCurrentPage);
          setMovements(result.data);
          setMovementsTotalPages(result.totalPages);
        } else if (activeTab === 'balances') {
          const result = await inventoryService.fetchBalances(warehouseId, searchTerm, balancesCurrentPage);
          setBalances(result.data);
          setBalancesTotalPages(result.totalPages);
        } else if (activeTab === 'batches') {
          const result = await inventoryService.fetchBatches(warehouseId, searchTerm, batchesCurrentPage);
          setBatches(result.data);
          setBatchesTotalPages(result.totalPages);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, warehouseId, searchTerm, movementsCurrentPage, balancesCurrentPage, batchesCurrentPage]);

  // Handle batch creation
  const handleCreateBatch = async (batchData: any) => {
    if (!warehouseId) return;

    setSubmitting(true);
    try {
      await inventoryService.createBatch({
        ...batchData,
        warehouse: warehouseId,
      });
      setShowBatchModal(false);
      // Refetch batches from page 1
      setBatchesCurrentPage(1);
      const result = await inventoryService.fetchBatches(warehouseId);
      setBatches(result.data);
      setBatchesTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to create batch');
      console.error('Create batch error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchPageChange = (page: number) => {
    setBatchesCurrentPage(page);
  };

  const handleMovementsPageChange = (page: number) => {
    setMovementsCurrentPage(page);
  };

  const handleBalancesPageChange = (page: number) => {
    setBalancesCurrentPage(page);
  };

  // Reset pages to 1 when search term or tab changes
  useEffect(() => {
    setMovementsCurrentPage(1);
    setBalancesCurrentPage(1);
    setBatchesCurrentPage(1);
  }, [searchTerm, activeTab]);

  if (!warehouseId) {
    return <NoWarehouseSelected onBack={() => navigate('/dashboard')} />;
  }

  return (
    <div className="inventory-page">
      <div className="inventory-sticky-stack">
        <div className="inventory-header">
          <h1>Inventory Management</h1>
        </div>

        <InventoryTabs
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        <InventoryToolbar
          activeTab={activeTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenMovementModal={() => setShowBatchModal(true)}
          onQualityAudit={() => console.log('Quality audit clicked')}
        />
      </div>

      <div className="inventory-content">
        {error && (
          <div className="error-banner">{error}</div>
        )}

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <>
            {activeTab === 'movements' && (
              <MovementLedgerTable 
                movements={movements}
                currentPage={movementsCurrentPage}
                totalPages={movementsTotalPages}
                onPageChange={handleMovementsPageChange}
                isLoading={loading}
              />
            )}
            {activeTab === 'balances' && (
              <StockBalancesTable 
                balances={balances}
                currentPage={balancesCurrentPage}
                totalPages={balancesTotalPages}
                onPageChange={handleBalancesPageChange}
                isLoading={loading}
              />
            )}
            {activeTab === 'batches' && (
              <BatchesRegistryTable 
                batches={batches}
                currentPage={batchesCurrentPage}
                totalPages={batchesTotalPages}
                onPageChange={handleBatchPageChange}
                isLoading={loading}
              />
            )}
          </>
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

export default InventoryPage;