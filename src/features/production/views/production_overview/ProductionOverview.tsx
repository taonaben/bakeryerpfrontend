import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Factory } from 'lucide-react';
import '../../styles/production.css';
import '../../styles/production-overview.css';
import { useUserStore } from '../../../auth/stores/userStore';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type { Warehouse } from '../../../../core/warehouses/types/models';
import { useProductionOverviewStore } from '../../stores';
import ProductionOverviewFiltersBar from '../../components/production_overview/ProductionOverviewFilters';
import ProductionKpiStrip from '../../components/production_overview/ProductionKpiStrip';
import ProductionStatusSection from '../../components/production_overview/ProductionStatusSection';
import ProductionWipSection from '../../components/production_overview/ProductionWipSection';
import ProductionEfficiencySection from '../../components/production_overview/ProductionEfficiencySection';
import ProductionScheduleSection from '../../components/production_overview/ProductionScheduleSection';
import {
  defaultDateFrom,
  todayIso,
} from '../../components/production_overview/productionOverviewUtils';

interface ProductionOverviewProps {
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

const ProductionOverview = ({ activeWarehouse }: ProductionOverviewProps) => {
  const user = useUserStore((state) => state.user);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const initializedRef = useRef(false);

  const {
    summary,
    wip,
    yieldTrends,
    scheduleAdherence,
    filters,
    isLoadingSummary,
    isLoadingWip,
    isLoadingYieldTrends,
    isLoadingScheduleAdherence,
    isRefreshing,
    error,
    fetchOverview,
    setFilters,
    refresh,
    setError,
  } = useProductionOverviewStore();

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

  const isLoading =
    isLoadingSummary || isLoadingWip || isLoadingYieldTrends || isLoadingScheduleAdherence;

  return (
    <div className="production-page">
      <div className="production-sticky-stack">
        <div className="production-page-header">
          <div className="production-overview-title">
            <div className="production-overview-title__icon">
              <Factory size={22} />
            </div>
            <div className="production-page-header__left">
              <h1>Production Overview</h1>
              <p className="production-page-header__breadcrumb">
                Production / Overview / WIP and output health
              </p>
            </div>
          </div>
        </div>

        <ProductionOverviewFiltersBar
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

      <div className="production-content production-overview-content">
        {error && (
          <div className="production-overview-alert" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        <ProductionKpiStrip summary={summary} isLoading={isLoadingSummary} />
        <ProductionWipSection wip={wip} isLoading={isLoadingWip} />
        <ProductionStatusSection summary={summary} isLoading={isLoadingSummary} />
        <ProductionEfficiencySection
          summary={summary}
          trends={yieldTrends}
          isLoading={isLoadingYieldTrends}
          isLoadingSummary={isLoadingSummary}
        />
        <ProductionScheduleSection
          schedule={scheduleAdherence}
          isLoading={isLoadingScheduleAdherence}
        />
      </div>
    </div>
  );
};

export default ProductionOverview;
