import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { 
  useInventoryStore, 
  selectFilteredMovements,
  selectFilteredBalances,
  selectFilteredBatches 
} from '../stores/inventoryStore';
import '../styles/inventory.css';
import InventoryTabs from '../components/InventoryTabs';
import InventoryToolbar from '../components/InventoryToolbar';
import MovementLedgerTable from '../components/MovementLedgerTable';
import StockBalancesTable from '../components/StockBalancesTable';
import BatchesRegistryTable from '../components/BatchesRegistryTable';
import MovementModal from '../components/MovementModal';
import NoWarehouseSelected from '../components/NoWarehouseSelected';
import Button from '../../../components/ui/Button';
import type { CreateMovementDTO } from '../types/models';

interface InventoryPageProps {
  activeWarehouse?: { id: string; name: string };
}

const InventoryPage = ({ activeWarehouse }: InventoryPageProps) => {
  const navigate = useNavigate();
  
  // Subscribe to store (only re-renders when these specific slices change)
  const activeTab = useInventoryStore((state) => state.activeTab);
  const loading = useInventoryStore((state) => state.loading);
  const error = useInventoryStore((state) => state.error);
  const searchTerm = useInventoryStore((state) => state.searchTerm);
  
  // Use memoized selectors for filtered data
  const movements = useInventoryStore(selectFilteredMovements);
  const balances = useInventoryStore(selectFilteredBalances);
  const batches = useInventoryStore(selectFilteredBatches);
  
  // Actions
  const setActiveTab = useInventoryStore((state) => state.setActiveTab);
  const setSearchTerm = useInventoryStore((state) => state.setSearchTerm);
  const setWarehouse = useInventoryStore((state) => state.setWarehouse);
  const fetchMovements = useInventoryStore((state) => state.fetchMovements);
  const fetchBalances = useInventoryStore((state) => state.fetchBalances);
  const fetchBatches = useInventoryStore((state) => state.fetchBatches);
  const addMovement = useInventoryStore((state) => state.addMovement);

  const warehouseId = activeWarehouse?.id;

  // Local UI state for modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateMovementDTO>({
    warehouse: warehouseId || '',
    batch: '',
    movement_type: 'IN',
    quantity: 0,
    reference_number: '',
    notes: '',
  });

  // Set warehouse when it changes (invalidates cache)
  useEffect(() => {
    if (warehouseId) {
      setWarehouse(warehouseId);
      setFormData((prev) => ({ ...prev, warehouse: warehouseId }));
    }
  }, [warehouseId, setWarehouse]);

  // Fetch data when tab or warehouse changes (respects cache)
  useEffect(() => {
    if (!warehouseId) return;

    if (activeTab === 'movements') {
      fetchMovements(warehouseId); // Will use cache if fresh
    } else if (activeTab === 'balances') {
      fetchBalances(warehouseId);
    } else if (activeTab === 'batches') {
      fetchBatches(warehouseId);
    }
  }, [activeTab, warehouseId, fetchMovements, fetchBalances, fetchBatches]);

  // Form submission handler
  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) return;
    
    setSubmitting(true);
    try {
      await addMovement(formData);
      setShowModal(false);
      // Reset form
      setFormData({
        warehouse: warehouseId,
        batch: '',
        movement_type: 'IN',
        quantity: 0,
        reference_number: '',
        notes: '',
      });
    } catch (err) {
      console.error('Failed to add movement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!warehouseId) {
    return <NoWarehouseSelected onBack={() => navigate('/dashboard')} />;
  }

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <h1>Inventory Management</h1>
      </div>

      <InventoryTabs 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      <InventoryToolbar
        activeTab={activeTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenMovementModal={() => setShowModal(true)}
        onQualityAudit={() => console.log('Quality audit clicked')}
      />

      {error && (
        <div className="error-banner">{error}</div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          {activeTab === 'movements' && <MovementLedgerTable movements={movements} />}
          {activeTab === 'balances' && <StockBalancesTable balances={balances} />}
          {activeTab === 'batches' && <BatchesRegistryTable batches={batches} />}
        </>
      )}

      <MovementModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitMovement}
        submitting={submitting}
      />
    </div>
  );
};

export default InventoryPage;