import React from 'react';
import { RefreshCw } from 'lucide-react';
import type {
  InventoryOverviewFilters,
  InventoryOverviewInterval,
} from '../../types/inventoryOverview';

interface WarehouseOption {
  id: string;
  name: string;
}

interface InventoryOverviewFiltersProps {
  filters: InventoryOverviewFilters;
  warehouses: WarehouseOption[];
  warehousesLoading: boolean;
  isRefreshing: boolean;
  onChange: (partial: Partial<InventoryOverviewFilters>) => void;
  onRefresh: () => void;
}

const intervals: InventoryOverviewInterval[] = ['day', 'week', 'month'];

const InventoryOverviewFiltersBar: React.FC<InventoryOverviewFiltersProps> = ({
  filters,
  warehouses,
  warehousesLoading,
  isRefreshing,
  onChange,
  onRefresh,
}) => (
  <section className="inventory-overview-filters">
    <div className="inventory-overview-filter">
      <label htmlFor="inventory-overview-warehouse">Warehouse</label>
      <select
        id="inventory-overview-warehouse"
        value={filters.warehouse_id}
        disabled={warehousesLoading}
        onChange={(event) => onChange({ warehouse_id: event.target.value })}
      >
        <option value="">All warehouses</option>
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </select>
    </div>

    <div className="inventory-overview-filter">
      <label htmlFor="inventory-overview-from">From</label>
      <input
        id="inventory-overview-from"
        type="date"
        value={filters.date_from}
        onChange={(event) => onChange({ date_from: event.target.value })}
      />
    </div>

    <div className="inventory-overview-filter">
      <label htmlFor="inventory-overview-to">To</label>
      <input
        id="inventory-overview-to"
        type="date"
        value={filters.date_to}
        onChange={(event) => onChange({ date_to: event.target.value })}
      />
    </div>

    <div className="inventory-overview-filter">
      <label htmlFor="inventory-overview-interval">Interval</label>
      <select
        id="inventory-overview-interval"
        value={filters.interval}
        onChange={(event) =>
          onChange({ interval: event.target.value as InventoryOverviewInterval })
        }
      >
        {intervals.map((interval) => (
          <option key={interval} value={interval}>
            {interval[0].toUpperCase() + interval.slice(1)}
          </option>
        ))}
      </select>
    </div>

    <div className="inventory-overview-filter inventory-overview-filter--small">
      <label htmlFor="inventory-overview-low-stock">Low stock rows</label>
      <input
        id="inventory-overview-low-stock"
        type="number"
        min={1}
        max={100}
        value={filters.low_stock_limit}
        onChange={(event) =>
          onChange({ low_stock_limit: Number(event.target.value) || 10 })
        }
      />
    </div>

    <button
      type="button"
      className="btn btn-secondary inventory-overview-refresh"
      onClick={onRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw size={15} className={isRefreshing ? 'spin' : undefined} />
      Refresh
    </button>
  </section>
);

export default InventoryOverviewFiltersBar;
