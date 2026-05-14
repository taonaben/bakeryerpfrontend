import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ShoppingBag } from 'lucide-react';
import { useProcurementOverviewStore } from '../../stores/procurementOverviewStore';
import { useUserStore } from '../../../auth/stores/userStore';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type { Warehouse } from '../../../../core/warehouses/types/models';
import ProcurementOverviewFiltersBar from '../../components/procurement_overview/ProcurementOverviewFilters';
import ProcurementKpiStrip from '../../components/procurement_overview/ProcurementKpiStrip';
import ProcurementStatusBreakdowns from '../../components/procurement_overview/ProcurementStatusBreakdowns';
import ProcurementAttentionPanels from '../../components/procurement_overview/ProcurementAttentionPanels';
import ProcurementTrendsSection from '../../components/procurement_overview/ProcurementTrendsSection';
import SupplierPerformanceSection from '../../components/procurement_overview/SupplierPerformanceSection';
import {
  defaultDateFrom,
  todayIso,
} from '../../components/procurement_overview/procurementOverviewUtils';
import '../../styles/procurement.css';

const ProcurementDashboard: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const initializedRef = useRef(false);

  const {
    summary,
    trends,
    supplierPerformance,
    filters,
    isLoadingSummary,
    isLoadingTrends,
    isLoadingSupplierPerformance,
    isRefreshing,
    error,
    fetchOverview,
    setFilters,
    refresh,
    setError,
  } = useProcurementOverviewStore();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!filters.date_from || !filters.date_to) {
      void setFilters({
        date_from: filters.date_from || defaultDateFrom(),
        date_to: filters.date_to || todayIso(),
      });
      return;
    }

    void fetchOverview();
  }, [fetchOverview, filters.date_from, filters.date_to, setFilters]);

  useEffect(() => {
    const companyId = typeof user?.company === 'string' ? user.company : null;
    if (!companyId) return;

    let cancelled = false;
    setWarehousesLoading(true);

    warehouseService
      .getWarehousesByCompany(companyId)
      .then((items) => {
        if (!cancelled) setWarehouses(items);
      })
      .catch(() => {
        if (!cancelled) setWarehouses([]);
      })
      .finally(() => {
        if (!cancelled) setWarehousesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.company]);

  const isLoading = isLoadingSummary || isLoadingTrends || isLoadingSupplierPerformance;

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        <div className="procurement-page-header">
          <div className="procurement-page-header__left procurement-overview-title">
            <div className="procurement-overview-title__icon">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h1>Procurement Overview</h1>
              <p className="procurement-page-header__breadcrumb">
                Procurement / Overview / Purchasing health
              </p>
            </div>
          </div>
        </div>

        <ProcurementOverviewFiltersBar
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

      <div className="procurement-content procurement-overview-content">
        {error && (
          <div className="procurement-overview-alert" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        <ProcurementKpiStrip summary={summary} isLoading={isLoadingSummary} />
        <ProcurementAttentionPanels summary={summary} />
        <ProcurementStatusBreakdowns summary={summary} />
        <ProcurementTrendsSection trends={trends} />
        <SupplierPerformanceSection supplierPerformance={supplierPerformance} />
      </div>
    </div>
  );
};

export default ProcurementDashboard;
