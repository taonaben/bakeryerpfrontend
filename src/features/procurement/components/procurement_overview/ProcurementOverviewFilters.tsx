import React from 'react';
import { RefreshCw } from 'lucide-react';
import type {
  ProcurementOverviewFilters,
  ProcurementOverviewInterval,
} from '../../types/procurement_overview_models';

interface WarehouseOption {
  id: string;
  name: string;
}

interface ProcurementOverviewFiltersProps {
  filters: ProcurementOverviewFilters;
  warehouses: WarehouseOption[];
  warehousesLoading: boolean;
  isRefreshing: boolean;
  onChange: (partial: Partial<ProcurementOverviewFilters>) => void;
  onRefresh: () => void;
}

const intervals: ProcurementOverviewInterval[] = ['day', 'week', 'month'];

const ProcurementOverviewFiltersBar: React.FC<ProcurementOverviewFiltersProps> = ({
  filters,
  warehouses,
  warehousesLoading,
  isRefreshing,
  onChange,
  onRefresh,
}) => (
  <section className="procurement-overview-filters">
    <div className="procurement-overview-filter">
      <label htmlFor="procurement-overview-warehouse">Warehouse</label>
      <select
        id="procurement-overview-warehouse"
        value={filters.warehouse_id}
        onChange={(event) => onChange({ warehouse_id: event.target.value })}
      >
        <option value="">{warehousesLoading ? 'Loading warehouses...' : 'All warehouses'}</option>
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </select>
    </div>

    <div className="procurement-overview-filter">
      <label htmlFor="procurement-overview-from">From</label>
      <input
        id="procurement-overview-from"
        type="date"
        value={filters.date_from}
        onChange={(event) => onChange({ date_from: event.target.value })}
      />
    </div>

    <div className="procurement-overview-filter">
      <label htmlFor="procurement-overview-to">To</label>
      <input
        id="procurement-overview-to"
        type="date"
        value={filters.date_to}
        onChange={(event) => onChange({ date_to: event.target.value })}
      />
    </div>

    <div className="procurement-overview-filter">
      <label htmlFor="procurement-overview-interval">Interval</label>
      <select
        id="procurement-overview-interval"
        value={filters.interval}
        onChange={(event) =>
          onChange({ interval: event.target.value as ProcurementOverviewInterval })
        }
      >
        {intervals.map((interval) => (
          <option key={interval} value={interval}>
            {interval[0].toUpperCase() + interval.slice(1)}
          </option>
        ))}
      </select>
    </div>

    <div className="procurement-overview-filter procurement-overview-filter--small">
      <label htmlFor="procurement-overview-expiring">Document risk</label>
      <input
        id="procurement-overview-expiring"
        type="number"
        min={1}
        max={365}
        value={filters.expiring_within_days}
        onChange={(event) =>
          onChange({ expiring_within_days: Number(event.target.value) || 30 })
        }
      />
    </div>

    <button
      type="button"
      className="btn btn-secondary procurement-overview-refresh"
      onClick={onRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />
      Refresh
    </button>
  </section>
);

export default ProcurementOverviewFiltersBar;
