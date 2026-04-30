import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { useStockFilters } from '../hooks/useStockFilters';
import type { StockBalance } from '../types/models';
import '../styles/inventory.css';
import InventoryToolbar from '../components/InventoryToolbar';
import StockBalancesTable from './stock_balances/StockBalancesTable';
import NoWarehouseSelected from '../components/NoWarehouseSelected';

interface StockBalancesPageProps {
  activeWarehouse?: { id: string; name: string };
}

const StockBalancesPage = ({ activeWarehouse }: StockBalancesPageProps) => {
  const navigate = useNavigate();
  const stockFilters = useStockFilters();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const warehouseId = activeWarehouse?.id;

  useEffect(() => {
    if (!warehouseId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const filterParams = {
          ...stockFilters.getApiQueryParams(),
          ...(searchTerm && { search: searchTerm }),
        };
        const result = await inventoryService.fetchBalances(warehouseId, filterParams);
        setBalances(result.data);
        setTotalPages(result.totalPages);
      } catch (err: any) {
        setError(err.message || 'Failed to load stock balances');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouseId, searchTerm, stockFilters.filters]);

  useEffect(() => {
    stockFilters.updateFilter('page', 1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    stockFilters.updateFilter('page', page);
  };

  if (!warehouseId) {
    return <NoWarehouseSelected onBack={() => navigate('/dashboard')} />;
  }

  return (
    <div className="inventory-page">
      <div className="inventory-sticky-stack">
        <div className="inventory-header">
          <h1>Stock Balances</h1>
        </div>
        <InventoryToolbar
          activeTab="balances"
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
          <StockBalancesTable
            balances={balances}
            currentPage={stockFilters.filters.page || 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default StockBalancesPage;
