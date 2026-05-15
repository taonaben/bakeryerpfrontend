import React from 'react';
import { RefreshCw } from 'lucide-react';
import type {
  ProductionOverviewFilters,
  ProductionOverviewInterval,
} from '../../types/productionOverviewModels';

interface WarehouseOption {
  id: string;
  name: string;
}

interface ProductionOverviewFiltersProps {
  filters: ProductionOverviewFilters;
  warehouses: WarehouseOption[];
  warehousesLoading: boolean;
  isRefreshing: boolean;
  onChange: (partial: Partial<ProductionOverviewFilters>) => void;
  onRefresh: () => void;
}

const intervals: ProductionOverviewInterval[] = ['day', 'week', 'month'];

const ProductionOverviewFiltersBar: React.FC<ProductionOverviewFiltersProps> = ({
  filters,
  warehouses,
  warehousesLoading,
  isRefreshing,
  onChange,
  onRefresh,
}) => (
  <section className="production-overview-filters">
    <div className="production-overview-filter">
      <label htmlFor="production-overview-warehouse">Warehouse</label>
      <select
        id="production-overview-warehouse"
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

    <div className="production-overview-filter">
      <label htmlFor="production-overview-from">From</label>
      <input
        id="production-overview-from"
        type="date"
        value={filters.date_from}
        onChange={(event) => onChange({ date_from: event.target.value })}
      />
    </div>

    <div className="production-overview-filter">
      <label htmlFor="production-overview-to">To</label>
      <input
        id="production-overview-to"
        type="date"
        value={filters.date_to}
        onChange={(event) => onChange({ date_to: event.target.value })}
      />
    </div>

    <div className="production-overview-filter">
      <label htmlFor="production-overview-interval">Interval</label>
      <select
        id="production-overview-interval"
        value={filters.interval}
        onChange={(event) =>
          onChange({ interval: event.target.value as ProductionOverviewInterval })
        }
      >
        {intervals.map((interval) => (
          <option key={interval} value={interval}>
            {interval.charAt(0).toUpperCase() + interval.slice(1)}
          </option>
        ))}
      </select>
    </div>

    <button
      type="button"
      className="btn btn-secondary production-overview-refresh"
      disabled={isRefreshing}
      onClick={onRefresh}
    >
      <RefreshCw size={15} className={isRefreshing ? 'spin' : undefined} />
      Refresh
    </button>
  </section>
);

export default ProductionOverviewFiltersBar;
