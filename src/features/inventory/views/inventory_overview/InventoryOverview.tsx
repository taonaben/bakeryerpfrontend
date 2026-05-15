import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Boxes } from 'lucide-react';
import '../../styles/inventory.css';
import '../../styles/inventory-overview.css';
import { useUserStore } from '../../../auth/stores/userStore';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type { Warehouse } from '../../../../core/warehouses/types/models';
import { useInventoryOverviewStore } from '../../stores';
import InventoryOverviewFiltersBar from '../../components/inventory_overview/InventoryOverviewFilters';
import InventoryKpiStrip from '../../components/inventory_overview/InventoryKpiStrip';
import InventoryHealthSection from '../../components/inventory_overview/InventoryHealthSection';
import InventoryOperationalTables from '../../components/inventory_overview/InventoryOperationalTables';
import InventoryMovementAnalytics from '../../components/inventory_overview/InventoryMovementAnalytics';
import {
  defaultDateFrom,
  todayIso,
} from '../../components/inventory_overview/inventoryOverviewUtils';

interface InventoryDashboardProps {
  activeWarehouse?: { id: string; name: string };
}

const resolveCompanyId = (company: unknown): string | null => {
  if (typeof company === 'string' && company.trim()) return company;
  if (company && typeof company === 'object') {
    const value =
      (company as { id?: unknown; uuid?: unknown }).id ??
      (company as { id?: unknown; uuid?: unknown }).uuid;
    return typeof value === 'string' && value.trim() ? value : null;
  }
  return null;
};

const getStoredCompanyId = (): string | null => {
  try {
    const savedUser = localStorage.getItem('erp_user');
    if (!savedUser) return null;
    const parsedUser = JSON.parse(savedUser) as { company?: unknown };
    return resolveCompanyId(parsedUser.company);
  } catch {
    return null;
  }
};

const InventoryDashboard = ({ activeWarehouse }: InventoryDashboardProps) => {
  const user = useUserStore((state) => state.user);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const initializedRef = useRef(false);

  const {
    summary,
    movementTrends,
    filters,
    isLoadingSummary,
    isLoadingMovementTrends,
    isRefreshing,
    error,
    fetchOverview,
    setFilters,
    refresh,
    setError,
  } = useInventoryOverviewStore();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialFilters = {
      date_from: filters.date_from || defaultDateFrom(),
      date_to: filters.date_to || todayIso(),
      warehouse_id: filters.warehouse_id || activeWarehouse?.id || '',
    };

    void setFilters(initialFilters);
  }, [activeWarehouse?.id, filters.date_from, filters.date_to, filters.warehouse_id, setFilters]);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (!filters.date_from || !filters.date_to) return;
    void fetchOverview();
  }, [fetchOverview, filters.date_from, filters.date_to]);

  useEffect(() => {
    const companyId = resolveCompanyId(user?.company) || getStoredCompanyId();
    if (!companyId) {
      setWarehouses(activeWarehouse?.id ? [activeWarehouse as Warehouse] : []);
      return;
    }

    let cancelled = false;
    setWarehousesLoading(true);

    warehouseService
      .getWarehousesByCompany(companyId)
      .then((items) => {
        if (!cancelled) setWarehouses(items);
      })
      .catch(() => {
        if (!cancelled) setWarehouses(activeWarehouse?.id ? [activeWarehouse as Warehouse] : []);
      })
      .finally(() => {
        if (!cancelled) setWarehousesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeWarehouse, user?.company]);

  const isLoading = isLoadingSummary || isLoadingMovementTrends;

  return (
    <div className="inventory-page">
      <div className="inventory-sticky-stack">
        <div className="inventory-header">
          <div className="inventory-overview-title">
            <div className="inventory-overview-title__icon">
              <Boxes size={22} />
            </div>
            <div className="header-title">
              <h1>Inventory Overview</h1>
              <p>Inventory / Overview / Stock health</p>
            </div>
          </div>
        </div>

        <InventoryOverviewFiltersBar
          filters={filters}
          warehouses={warehouses.map((warehouse) => ({
            id: warehouse.id,
            name: warehouse.name,
          }))}
          warehousesLoading={warehousesLoading}
          isRefreshing={isRefreshing || isLoading}
          onChange={(partial) => {
            void setFilters(partial);
          }}
          onRefresh={() => {
            void refresh();
          }}
        />
      </div>

      <div className="inventory-content inventory-overview-content">
        {error && (
          <div className="inventory-overview-alert" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        <InventoryKpiStrip summary={summary} isLoading={isLoadingSummary} />
        <InventoryHealthSection summary={summary} isLoading={isLoadingSummary} />
        <InventoryOperationalTables summary={summary} isLoading={isLoadingSummary} />
        <InventoryMovementAnalytics
          summary={summary}
          trends={movementTrends}
          isLoading={isLoadingMovementTrends}
          isLoadingSummary={isLoadingSummary}
        />
      </div>
    </div>
  );
};

export default InventoryDashboard;
