import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, AlertTriangle, Trash2, Edit3 } from 'lucide-react';
import { usePlannedOrderListStore } from '../../../stores/plannedOrderListStore';
import { usePlanningFilter } from '../../../hooks/usePlanningFilter';
import { planningService } from '../../../services/planningServices';
import {
  PlannedOrdersToolbar,
  PlannedOrdersTable,
  PriorityOverrideModal,
} from '../../../components/planning';
import '../../../styles/planning.css';
import type { PlannedOrderPriority, PlannedOrderStatus, PlannedOrder } from '../../../types/plannedOrderModel';

interface PlannedOrdersPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const PlannedOrdersPage: React.FC<PlannedOrdersPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const filters = usePlanningFilter((state) => state.filters);
  const setFilter = usePlanningFilter((state) => state.setFilter);
  const getApiQueryParams = usePlanningFilter((state) => state.getApiQueryParams);
  const orders = usePlannedOrderListStore((state) => state.orders);
  const isLoading = usePlannedOrderListStore((state) => state.isLoading);
  const totalPages = usePlannedOrderListStore((state) => state.totalPages);
  const selectedIds = usePlannedOrderListStore((state) => state.selectedIds);
  const fetchOrders = usePlannedOrderListStore((state) => state.fetchOrders);
  const selectAll = usePlannedOrderListStore((state) => state.selectAll);
  const clearSelection = usePlannedOrderListStore((state) => state.clearSelection);

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status counts
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const countsLoaded = useRef(false);

  // Bulk action state
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  // Override modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedOrderForOverride, setSelectedOrderForOverride] = useState<PlannedOrder | null>(
    null,
  );
  const [overrideLoading, setOverrideLoading] = useState(false);

  // ─── Sync warehouse filter ─────────────────────
  useEffect(() => {
    setFilter('warehouse_id', activeWarehouse?.id ?? '');
  }, [activeWarehouse?.id, setFilter]);

  // ─── Debounce search ──────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter('search', searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, setFilter]);

  // ─── Fetch orders on filter change ────────────
  const fetchData = useCallback(async () => {
    const params = getApiQueryParams();
    await fetchOrders(params);
  }, [
    filters.search,
    filters.status,
    filters.priority,
    filters.warehouse_id,
    filters.need_by_after,
    filters.need_by_before,
    filters.ordering,
    filters.page,
    filters.page_size,
    getApiQueryParams,
    fetchOrders,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Refresh data when location changes (navigation) ──────────────
  // ─── Fetch status counts on mount ──────────────
  const fetchCounts = useCallback(async () => {
    try {
      const statuses = ['', 'draft', 'scheduled', 'in_production', 'completed'] as const;
      const results = await Promise.allSettled(
        statuses.map((status) =>
          planningService.fetchPlannedOrders(
            {
              ...(status ? { status } : {}),
              page: 1,
              page_size: 1,
            },
            1,
          ),
        ),
      );

      const counts: Record<string, number> = {};
      statuses.forEach((status, i) => {
        const r = results[i];
        if (r.status === 'fulfilled') {
          counts[status || 'all'] = r.value.count;
        }
      });
      setStatusCounts(counts);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    if (!countsLoaded.current) {
      countsLoaded.current = true;
      fetchCounts();
    }
  }, [fetchCounts]);

  // ─── Selection Management ──────────────────────
  const handleSelectionChange = (selectedIds: Set<string>) => {
    selectAll(Array.from(selectedIds));
    setShowBulkActions(selectedIds.size > 0);
  };

  // ─── Bulk Actions ─────────────────────────────
  const handleBulkChangePriority = async (priority: PlannedOrderPriority, note: string) => {
    setBulkActionInProgress(true);
    setError(null);
    try {
      const orderIds = Array.from(selectedIds);
      await planningService.bulkUpdatePriority(orderIds, priority, note);
      setSuccessMsg(`Priority updated for ${orderIds.length} order(s)`);
      setTimeout(() => setSuccessMsg(null), 3000);
      clearSelection();
      setShowBulkActions(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update priorities');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    setBulkActionInProgress(true);
    setError(null);
    try {
      const orderIds = Array.from(selectedIds);
      await planningService.bulkDelete(orderIds);
      setSuccessMsg(`${orderIds.length} order(s) deleted`);
      setTimeout(() => setSuccessMsg(null), 3000);
      clearSelection();
      setShowBulkActions(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete orders');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  // ─── Override Modal Handlers ──────────────────
  const handleRequestOverride = async (priority: PlannedOrderPriority, note: string) => {
    if (!selectedOrderForOverride) return;
    setOverrideLoading(true);
    try {
      await planningService.requestPriorityOverride(selectedOrderForOverride.id, {
        priority,
        priority_override_note: note,
      });
      setSuccessMsg('Priority override requested');
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowOverrideModal(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to request priority override');
    } finally {
      setOverrideLoading(false);
    }
  };

  // ─── Guard: Require active warehouse ───────────
  if (!activeWarehouse?.id) {
    return (
      <div
        className="production-page production-page--planning"
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state__icon">
            <AlertTriangle size={48} color="#f59e0b" />
          </div>
          <h3 className="empty-state__title">No Warehouse Selected</h3>
          <p className="empty-state__description">
            Please select a warehouse from the sidebar to view planned production orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="production-page production-page--planning">
      <div className="production-sticky-stack">
        {/* Page Header */}
        <div className="production-page-header">
          <div className="production-page-header__left">
            <h1>Planned Orders</h1>
            <p className="production-page-header__breadcrumb">
              Production / Planning / Planned Orders
            </p>
          </div>
          <div className="production-page-header__actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/production/planned-orders/new')}
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

        {/* Toolbar – status tabs + filters */}
        <PlannedOrdersToolbar
          searchTerm={searchInput}
          onSearchChange={setSearchInput}
          activeStatus={filters.status as any}
          onStatusChange={(status: PlannedOrderStatus | '') => setFilter('status', status)}
          activePriority={filters.priority as any}
          onPriorityChange={(priority: PlannedOrderPriority | '') => setFilter('priority', priority)}
          activeWarehouse={filters.warehouse_id}
          onWarehouseChange={(id: string) => setFilter('warehouse_id', id)}
          statusCounts={statusCounts}
          placeholder="Search product name, order ID…"
        />
      </div>

      {/* Content */}
      <div className="production-content">
        {/* Notifications */}
        {error && (
          <div className="error-banner">
            <div>{error}</div>
            <button onClick={() => setError(null)} type="button">
              Dismiss
            </button>
          </div>
        )}
        {successMsg && (
          <div className="success-banner">
            <div>{successMsg}</div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bulk-actions-bar">
            <div className="bulk-actions-bar__info">
              <span className="bulk-actions-bar__count">{selectedIds.size} selected</span>
            </div>
            <div className="bulk-actions-bar__actions">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  const priority = window.prompt('New priority (low/medium/high):') as any;
                  if (priority) handleBulkChangePriority(priority, '');
                }}
                disabled={bulkActionInProgress}
                type="button"
              >
                <Edit3 size={16} />
                Change Priority
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={handleBulkDelete}
                disabled={bulkActionInProgress}
                type="button"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={clearSelection}
                disabled={bulkActionInProgress}
                type="button"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading orders…</span>
          </div>
        ) : (
          <PlannedOrdersTable
            orders={orders}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={(page: number) => setFilter('page', page)}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Override Modal */}
      {selectedOrderForOverride && (
        <PriorityOverrideModal
          isOpen={showOverrideModal}
          orderId={selectedOrderForOverride.id}
          currentPriority={selectedOrderForOverride.priority}
          productName={selectedOrderForOverride.product_name}
          onRequestOverride={handleRequestOverride}
          onApproveOverride={async () => {}}
          onRejectOverride={async () => {}}
          onClose={() => {
            setShowOverrideModal(false);
            setSelectedOrderForOverride(null);
          }}
          isRequesting={overrideLoading}
          hasOverrideRequested={Boolean(selectedOrderForOverride.priority_override_requested_at)}
          overrideNote={selectedOrderForOverride.priority_override_note}
        />
      )}
    </div>
  );
};

export default PlannedOrdersPage;
