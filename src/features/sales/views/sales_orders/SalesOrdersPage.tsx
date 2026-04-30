import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Download, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useOrdersStore } from '../../stores/ordersStore';
import type { OrderStatus } from '../../types/shared';
import ProcurementToolbar from '../../../procurement/components/toolbar';
import type { StatusTabConfig } from '../../../procurement/components/toolbar';
import '../../styles/sales.css';
import '../../../procurement/styles/procurement.css';

// ──────────────────────────────────────────────
// Sales Order status tabs
// ──────────────────────────────────────────────
const ORDER_STATUS_TABS: StatusTabConfig[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
];

interface SalesOrdersPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const SalesOrdersPage: React.FC<SalesOrdersPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const {
    items: orders,
    isLoading,
    error,
    fetchAll,
  } = useOrdersStore();

  // Filters
  const [activeStatus, setActiveStatus] = useState<OrderStatus | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Summary stats
  const [stats, setStats] = useState({
    totalToday: 0,
    pendingConfirmation: 0,
    awaitingDispatch: 0,
    overdue: 0,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch orders
  const fetchData = useCallback(async () => {
    const filters: any = {};
    if (activeStatus) filters.status = activeStatus;
    if (activeWarehouse?.id) filters.warehouse_id = activeWarehouse.id;
    if (debouncedSearch) {
      // Backend doesn't have search param in docs, but we'll filter client-side
    }
    await fetchAll(filters, true);
  }, [activeStatus, activeWarehouse?.id, debouncedSearch, fetchAll]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute stats from orders
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalToday = orders.filter((o) => o.order_date.startsWith(today)).length;
    const pendingConfirmation = orders.filter((o) => o.status === 'draft').length;
    const awaitingDispatch = orders.filter((o) => o.status === 'confirmed').length;
    // Overdue: confirmed but expected_delivery_date is past
    const overdue = 0; // Would need expected_delivery_date in list response

    setStats({ totalToday, pendingConfirmation, awaitingDispatch, overdue });
  }, [orders]);

  // Client-side search filter
  const filteredOrders = debouncedSearch
    ? orders.filter((o) =>
        [o.order_number, o.customer_name, o.warehouse_name]
          .join(' ')
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()),
      )
    : orders;

  // Guard — require warehouse
  if (!activeWarehouse?.id) {
    return (
      <div className="procurement-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state__icon">
            <AlertTriangle size={48} color="#f59e0b" />
          </div>
          <h3 className="empty-state__title">No Warehouse Selected</h3>
          <p className="empty-state__description">
            Please select a warehouse from the sidebar to view sales orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        {/* Page Header */}
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <h1>Sales Orders</h1>
            <p className="procurement-page-header__breadcrumb">Sales / Orders</p>
          </div>
          <div className="procurement-page-header__actions">
            <button className="btn btn-outline" type="button" title="Export">
              <Download size={18} />
              Export
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/sales/orders/new')}
              type="button"
            >
              <Plus size={18} />
              New Order
            </button>
            <button
              className="btn btn-outline"
              type="button"
              aria-label="More actions"
              title="More actions"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar — status tabs + search */}
        <ProcurementToolbar
          searchTerm={searchInput}
          onSearchChange={setSearchInput}
          activeStatus={activeStatus}
          onStatusChange={(s) => setActiveStatus(s as OrderStatus | '')}
          placeholder="Search order #, customer…"
          tabs={ORDER_STATUS_TABS}
        />

        {/* Summary Cards */}
        <div className="sales-summary-cards">
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Total Orders Today</div>
            <div className="sales-summary-card__value">{stats.totalToday}</div>
          </div>
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Pending Confirmation</div>
            <div className="sales-summary-card__value sales-summary-card__value--warning">
              {stats.pendingConfirmation}
            </div>
          </div>
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Awaiting Dispatch</div>
            <div className="sales-summary-card__value sales-summary-card__value--info">
              {stats.awaitingDispatch}
            </div>
          </div>
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Overdue</div>
            <div className="sales-summary-card__value sales-summary-card__value--danger">
              {stats.overdue}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="procurement-content">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={fetchData} type="button">
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading sales orders…</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <ShoppingCart size={48} />
            </div>
            <h3 className="empty-state__title">No sales orders found</h3>
            <p className="empty-state__description">
              {debouncedSearch
                ? 'Try adjusting your search or filters'
                : 'Create your first order to get started'}
            </p>
          </div>
        ) : (
          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Warehouse</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/sales/orders/${order.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span className="table-link">{order.order_number}</span>
                    </td>
                    <td>{order.customer_name}</td>
                    <td>{order.warehouse_name}</td>
                    <td>
                      <span className={`badge badge-${order.order_type}`}>
                        {order.order_type === 'pos' ? 'POS' : 'B2B'}
                      </span>
                    </td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="table-amount">
                      ${parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge badge-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sales/orders/${order.id}`);
                        }}
                        aria-label="View order"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOrdersPage;
