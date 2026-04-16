import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { useMovementFilters } from '../hooks/useMovementFilters';
import type { StockMovement } from '../types/models';
import '../styles/inventory.css';
import InventoryToolbar from '../components/InventoryToolbar';
import MovementLedgerTable from './stock_movements/MovementLedgerTable';
import NoWarehouseSelected from '../components/NoWarehouseSelected';

interface StockMovementsPageProps {
  activeWarehouse?: { id: string; name: string };
}

const StockMovementsPage = ({ activeWarehouse }: StockMovementsPageProps) => {
  const navigate = useNavigate();
  const movementFilters = useMovementFilters();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const warehouseId = activeWarehouse?.id;

  useEffect(() => {
    if (!warehouseId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const filterParams = {
          ...movementFilters.getApiQueryParams(),
          ...(searchTerm && { search: searchTerm }),
        };
        const result = await inventoryService.fetchMovements(warehouseId, filterParams);
        setMovements(result.data);
        setTotalPages(result.totalPages);
      } catch (err: any) {
        setError(err.message || 'Failed to load movements');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouseId, searchTerm, movementFilters.filters]);

  useEffect(() => {
    movementFilters.updateFilter('page', 1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    movementFilters.updateFilter('page', page);
  };

  if (!warehouseId) {
    return <NoWarehouseSelected onBack={() => navigate('/dashboard')} />;
  }

  return (
    <div className="inventory-page">
      <div className="inventory-sticky-stack">
        <div className="inventory-header">
          <h1>Stock Movements</h1>
        </div>
        <InventoryToolbar
          activeTab="movements"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenMovementModal={() => {}}
          onQualityAudit={() => {}}
          warehouseId={warehouseId}
        />
      </div>
      <div className="inventory-content">
        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <MovementLedgerTable
            movements={movements}
            currentPage={movementFilters.filters.page || 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default StockMovementsPage;
