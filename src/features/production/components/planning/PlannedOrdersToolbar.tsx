import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { PlannedOrderStatus, PlannedOrderPriority } from '../../types/plannedOrderModel';

interface PlannedOrdersToolbarProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  activeStatus?: PlannedOrderStatus | '';
  onStatusChange?: (status: PlannedOrderStatus | '') => void;
  activePriority?: PlannedOrderPriority | '';
  onPriorityChange?: (priority: PlannedOrderPriority | '') => void;
  activeWarehouse?: string;
  onWarehouseChange?: (warehouseId: string) => void;
  statusCounts?: Record<string, number>;
  placeholder?: string;
  warehouses?: Array<{ id: string; name: string }>;
}

const PlannedOrdersToolbar: React.FC<PlannedOrdersToolbarProps> = ({
  searchTerm = '',
  onSearchChange,
  activeStatus = '',
  onStatusChange,
  activePriority = '',
  onPriorityChange,
  activeWarehouse = '',
  onWarehouseChange,
  statusCounts = {},
  placeholder = 'Search product name, order ID...',
  warehouses = [],
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const statuses: Array<{ value: PlannedOrderStatus | ''; label: string }> = [
    { value: '', label: 'All Orders' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_production', label: 'In Production' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorities: Array<{ value: PlannedOrderPriority | ''; label: string }> = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  return (
    <div className="production-planning-toolbar">
      <div className="production-planning-toolbar__left">
        <div className="status-tabs">
          {statuses.map((status) => {
            const isActive = activeStatus === status.value;
            return (
              <button
                key={status.value || 'all'}
                className={`status-tab${isActive ? ' active' : ''}`}
                onClick={() => onStatusChange?.(status.value)}
                aria-pressed={isActive}
                type="button"
              >
                {status.label}
                {statusCounts[status.value || 'all'] !== undefined && (
                  <span className="tab-count">{statusCounts[status.value || 'all']}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="production-planning-toolbar__right">
        <div className="production-planning-toolbar__search search-bar">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            aria-label="Search planned orders"
          />
          {localSearch && (
            <button
              className="production-planning-toolbar__clear"
              onClick={() => handleSearchChange('')}
              type="button"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          className="production-planning-toolbar__select"
          value={activePriority}
          onChange={(e) => onPriorityChange?.(e.target.value as PlannedOrderPriority | '')}
          aria-label="Filter by priority"
        >
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {warehouses.length > 0 && (
          <select
            className="production-planning-toolbar__select"
            value={activeWarehouse}
            onChange={(e) => onWarehouseChange?.(e.target.value)}
            aria-label="Filter by warehouse"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default PlannedOrdersToolbar;
