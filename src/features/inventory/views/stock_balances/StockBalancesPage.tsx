import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/inventoryService';
import { useStockFilters } from '../../hooks/useStockFilters';
import type { StockBalance } from '../../types/models';
import '../../styles/inventory.css';
import InventoryListToolbar from '../../components/InventoryListToolbar';
import StockBalancesTable from './StockBalancesTable.tsx';
import NoWarehouseSelected from '../../components/NoWarehouseSelected';

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
  const activeStatus = stockFilters.filters.status[0] || '';

  const handleStatusChange = (status: string) => {
    stockFilters.updateFilter('status', status ? [status] : []);
    stockFilters.updateFilter('page', 1);
  };

  const handleSortChange = (ordering: string) => {
    stockFilters.updateFilter('ordering', ordering);
    stockFilters.updateFilter('page', 1);
  };

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
        <InventoryListToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeStatus}
          onTabChange={handleStatusChange}
          tabs={[
            { label: 'All', value: '' },
            { label: 'Empty', value: 'EMPTY' },
            { label: 'Almost Out', value: 'ALMOST_OUT' },
            { label: 'Good', value: 'GOOD' },
            { label: 'Full', value: 'FULL' },
          ]}
          sortValue={stockFilters.filters.ordering}
          onSortChange={handleSortChange}
          sortOptions={[
            { label: 'Quantity on hand', value: 'quantity_on_hand' },
            { label: 'Status', value: 'status' },
            { label: 'Last updated', value: 'last_updated' },
            { label: 'Created', value: 'created_at' },
          ]}
          placeholder="Search by SKU or product..."
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
