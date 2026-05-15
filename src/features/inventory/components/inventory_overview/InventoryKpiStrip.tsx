import React from 'react';
import { AlertTriangle, Clock, Package, Settings, Warehouse } from 'lucide-react';
import type { InventoryOverviewSummary } from '../../types/inventoryOverview';
import { numberFormat, quantityFormat } from './inventoryOverviewUtils';

interface InventoryKpiStripProps {
  summary: InventoryOverviewSummary | null;
  isLoading: boolean;
}

const totalOpenAlerts = (summary: InventoryOverviewSummary | null): number => {
  if (!summary) return 0;
  const alerts = summary.open_alert_counts_by_type;
  return alerts.LOW_STOCK + alerts.OUT_OF_STOCK + alerts.EXPIRY;
};

const InventoryKpiStrip: React.FC<InventoryKpiStripProps> = ({ summary, isLoading }) => (
  <section className="inventory-overview-kpis">
    <KpiCard
      icon={<Package size={20} />}
      label="Active Products"
      value={numberFormat(summary?.total_active_products || 0)}
      helper="Products enabled for inventory"
      isLoading={isLoading}
    />
    <KpiCard
      icon={<Warehouse size={20} />}
      label="Warehouses"
      value={numberFormat(summary?.total_warehouses || 0)}
      helper="Locations in scope"
      isLoading={isLoading}
    />
    <KpiCard
      icon={<AlertTriangle size={20} />}
      label="Open Alerts"
      value={numberFormat(totalOpenAlerts(summary))}
      helper="Low stock, stockout, expiry"
      tone={totalOpenAlerts(summary) > 0 ? 'danger' : 'default'}
      isLoading={isLoading}
    />
    <KpiCard
      icon={<Clock size={20} />}
      label="Expired Batches"
      value={numberFormat(summary?.expired_batches_with_quantity.count || 0)}
      helper={`${quantityFormat(summary?.expired_batches_with_quantity.quantity || 0)} units affected`}
      tone={(summary?.expired_batches_with_quantity.count || 0) > 0 ? 'danger' : 'default'}
      isLoading={isLoading}
    />
    <KpiCard
      icon={<Settings size={20} />}
      label="Missing Reorder Policies"
      value={numberFormat(summary?.products_without_active_reorder_policy.count || 0)}
      helper="Setup actions required"
      tone={(summary?.products_without_active_reorder_policy.count || 0) > 0 ? 'warning' : 'default'}
      isLoading={isLoading}
    />
  </section>
);

const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  tone?: 'default' | 'warning' | 'danger';
  isLoading?: boolean;
}> = ({ icon, label, value, helper, tone = 'default', isLoading = false }) => (
  <article className={`inventory-overview-kpi inventory-overview-kpi--${tone}`}>
    <div className="inventory-overview-kpi__icon">{icon}</div>
    <div>
      <span>{label}</span>
      {isLoading ? (
        <>
          <strong className="inventory-skeleton inventory-skeleton--value" aria-label="Loading" />
          <small className="inventory-skeleton inventory-skeleton--text" />
        </>
      ) : (
        <>
          <strong>{value}</strong>
          <small>{helper}</small>
        </>
      )}
    </div>
  </article>
);

export default InventoryKpiStrip;
