import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import NoWarehouseSelected from '@/features/inventory/components/NoWarehouseSelected';
import ProcurementToolbar from '@/features/procurement/components/toolbar';
import { useProductionOrderListStore } from '../../../stores';
import useProductionOrderFilters from '../../../hooks/useProductionOrderFilters';
import ProductionOrdersTable from '../../../components/ProductionOrdersTable';
import '../../../styles/production.css';

interface ProductionOrdersPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const PRODUCTION_STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const ProductionOrdersPage: React.FC<ProductionOrdersPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const { orders, isLoading, error, fetchOrders } = useProductionOrderListStore();
  const { filters, setFilter, resetFilters, getApiQueryParams } = useProductionOrderFilters();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!activeWarehouse?.id) return;
    fetchOrders(getApiQueryParams(activeWarehouse.id));
  }, [activeWarehouse?.id, filters.status, fetchOrders, getApiQueryParams]);

  useEffect(() => {
    if (!activeWarehouse?.id) {
      resetFilters();
    }
  }, [activeWarehouse?.id, resetFilters]);

  if (!activeWarehouse?.id) {
    return <NoWarehouseSelected onBack={() => navigate('/dashboard')} />;
  }

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const haystacks = [
        order.product_name,
        order.warehouse_name,
        order.status,
        order.planned_order_status || '',
        order.id,
      ];

      return haystacks.some((value) => value?.toLowerCase().includes(query));
    });
  }, [orders, searchTerm]);

  return (
    <div className="production-page">
      <div className="production-sticky-stack">
        <div className="production-page-header">
          <div className="production-page-header__left">
            <h1>Production Orders</h1>
            <p className="production-page-header__breadcrumb">Production / Orders</p>
          </div>
          <div className="production-page-header__actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate('/production/orders/new')}
            >
              <Plus size={18} />
              New Production Order
            </button>
          </div>
        </div>

        <ProcurementToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeStatus={filters.status}
          onStatusChange={(status) => setFilter('status', status)}
          placeholder="Search product, warehouse, order ID..."
          tabs={PRODUCTION_STATUS_OPTIONS}
        />

        {/* <div className="production-toolbar__context">
          Viewing warehouse: <strong>{activeWarehouse.name}</strong>
        </div> */}
      </div>

      <div className="production-content">
        {error && <div className="error-banner">{error}</div>}

        <ProductionOrdersTable orders={filteredOrders} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ProductionOrdersPage;
