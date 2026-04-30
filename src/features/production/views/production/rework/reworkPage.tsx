import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import NoWarehouseSelected from '@/features/inventory/components/NoWarehouseSelected';
import ProcurementToolbar from '@/features/procurement/components/toolbar';
import { useReworkOrderListStore } from '../../../stores';
import ReworkOrdersTable from '../../../components/ReworkOrdersTable';
import '../../../styles/production.css';

interface ReworkPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const REWORK_STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const ReworkPage: React.FC<ReworkPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const { orders, isLoading, error, fetchOrders } = useReworkOrderListStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!activeWarehouse?.id) return;

    fetchOrders({
      warehouse_id: activeWarehouse.id,
      status: status || undefined,
    });
  }, [activeWarehouse?.id, status, fetchOrders]);

  useEffect(() => {
    if (!activeWarehouse?.id) {
      setStatus('');
      setSearchTerm('');
    }
  }, [activeWarehouse?.id]);

  if (!activeWarehouse?.id) {
    return <NoWarehouseSelected onBack={() => navigate('/dashboard')} />;
  }

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter((order) => {
      const haystacks = [
        order.target_product_name,
        order.warehouse_name,
        order.status,
        order.id,
        order.reason,
      ];

      return haystacks.some((value) => value?.toLowerCase().includes(query));
    });
  }, [orders, searchTerm]);

  return (
    <div className="production-page">
      <div className="production-sticky-stack">
        <div className="production-page-header">
          <div className="production-page-header__left">
            <h1>Rework Orders</h1>
            <p className="production-page-header__breadcrumb">Production / Rework</p>
          </div>

          <div className="production-page-header__actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate('/production/rework/new')}
            >
              <Plus size={18} />
              New Rework Order
            </button>
          </div>
        </div>

        <ProcurementToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeStatus={status}
          onStatusChange={setStatus}
          placeholder="Search target product, reason, order ID..."
          tabs={REWORK_STATUS_OPTIONS}
        />
      </div>

      <div className="production-content">
        {error && <div className="error-banner">{error}</div>}

        <ReworkOrdersTable orders={filteredOrders} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ReworkPage;
