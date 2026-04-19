import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Download, AlertTriangle } from 'lucide-react';
import { purchaseOrderService } from '../../services/purchase_orders_services';
import usePurchaseOrderFilters from '../../hooks/usePurchaseOrderFilters';
import type { PurchaseOrder, PurchaseOrderStatus } from '../../types/purchase_orders_models';
import ProcurementToolbar from '../../components/toolbar';
import type { StatusTabConfig } from '../../components/toolbar';
import PurchaseOrdersTable from '../../components/PurchaseOrdersTable';
import '../../styles/procurement.css';

// ──────────────────────────────────────────────
// PO status tabs
// ──────────────────────────────────────────────
const PO_STATUS_TABS: StatusTabConfig[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Part. Received', value: 'Partially Received' },
  { label: 'Received', value: 'Received' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Cancelled', value: 'Cancelled' },
];

interface PurchaseOrdersPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const PurchaseOrdersPage: React.FC<PurchaseOrdersPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const filters = usePurchaseOrderFilters();

  // Data state
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local search state (debounced)
  const [searchInput, setSearchInput] = useState('');

  // Sync active warehouse into filter whenever it changes
  useEffect(() => {
    filters.setFilter('warehouse_id', activeWarehouse?.id ?? '');
  }, [activeWarehouse?.id]);

  // Debounce search → filter sync
  useEffect(() => {
    const timer = setTimeout(() => {
      filters.setFilter('search', searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Status counts
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const countsLoaded = useRef(false);

  // ─── Fetch orders on filter change ──────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = filters.getApiQueryParams();
      const result = await purchaseOrderService.fetchOrders(params);
      setOrders(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load purchase orders');
      console.error('Fetch purchase orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Fetch counts once on mount ─────────────
  const fetchCounts = useCallback(async () => {
    try {
      const statuses: (PurchaseOrderStatus | '')[] = [
        '', 'Draft', 'Submitted', 'Approved', 'Rejected',
        'Partially Received', 'Received', 'Cancelled',
      ];
      const results = await Promise.allSettled(
        statuses.map((status) =>
          purchaseOrderService.fetchOrders({
            ...(status ? { status } : {}),
            page: 1,
            page_size: 1,
          }),
        ),
      );

      const counts: Record<string, number> = {};
      statuses.forEach((status, i) => {
        const r = results[i];
        if (r.status === 'fulfilled') {
          counts[status] = r.value.count;
        }
      });
      setStatusCounts(counts);
    } catch {
      // Non-critical — tabs just won't show counts
    }
  }, []);

  useEffect(() => {
    if (!countsLoaded.current) {
      countsLoaded.current = true;
      fetchCounts();
    }
  }, [fetchCounts]);

  // ─── Handlers ───────────────────────────────
  const handleStatusChange = (status: string) => {
    filters.setFilter('status', status as PurchaseOrderStatus | '');
  };

  const handlePageChange = (page: number) => {
    filters.setFilter('page', page);
  };

  // Guard — require an active warehouse
  if (!activeWarehouse?.id) {
    return (
      <div className="procurement-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state__icon">
            <AlertTriangle size={48} color="#f59e0b" />
          </div>
          <h3 className="empty-state__title">No Warehouse Selected</h3>
          <p className="empty-state__description">
            Please select a warehouse from the sidebar to view purchase orders.
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
            <h1>Purchase Orders</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Purchase Orders
            </p>
          </div>
          <div className="procurement-page-header__actions">
            <button
              className="btn btn-outline"
              type="button"
              title="Export"
            >
              <Download size={18} />
              Export
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/procurement/purchase-orders/new')}
              type="button"
            >
              <Plus size={18} />
              New PO
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
          activeStatus={filters.filters.status}
          onStatusChange={handleStatusChange}
          statusCounts={statusCounts}
          placeholder="Search PO number, supplier…"
          tabs={PO_STATUS_TABS}
        />
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

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading purchase orders…</span>
          </div>
        ) : (
          <PurchaseOrdersTable
            orders={orders}
            currentPage={filters.filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;
