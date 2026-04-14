import React, { useState, useCallback } from 'react';
import SearchBar from './SearchBar';
import FilterButton from './FilterButton';
import ActionButtons from './ActionButtons';
import FilterDrawer from './FilterDrawer';
import SortDropdown from './filters/SortDropdown';
import { useBatchFilters } from '../hooks/useBatchFilters';
import { useStockFilters } from '../hooks/useStockFilters';
import { useMovementFilters } from '../hooks/useMovementFilters';
import { inventoryService } from '../services/inventoryService';
import './InventoryToolbar.css';

const SORT_OPTIONS = {
  batches: [
    { label: 'Batch number', value: 'batch_number' },
    { label: 'Manufacture date', value: 'manufacture_date' },
    { label: 'Expiry date', value: 'expiry_date' },
    { label: 'Quantity', value: 'quantity' },
    { label: 'Created', value: 'created_at' },
  ],
  balances: [
    { label: 'Quantity on hand', value: 'quantity_on_hand' },
    { label: 'Status', value: 'status' },
    { label: 'Last updated', value: 'last_updated' },
    { label: 'Created', value: 'created_at' },
  ],
  movements: [
    { label: 'Created', value: 'created_at' },
    { label: 'Total quantity', value: 'total_quantity' },
    { label: 'Movement type', value: 'movement_type' },
  ],
};

const SEARCH_PLACEHOLDERS = {
  batches: 'Search batch number…',
  balances: 'Search product SKU…',
  movements: 'Search reference…',
};

const InventoryToolbar = ({
  activeTab,
  searchTerm,
  onSearchChange,
  onOpenMovementModal,
  onQualityAudit,
  warehouseId,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Read from Zustand singletons — no prop drilling needed
  const batchFilters = useBatchFilters();
  const stockFilters = useStockFilters();
  const movementFilters = useMovementFilters();

  const activeFilterHook = {
    batches: batchFilters,
    balances: stockFilters,
    movements: movementFilters,
  }[activeTab];

  const activeFilterCount = activeFilterHook?.activeFilterCount() ?? 0;
  const currentOrdering = activeFilterHook?.filters?.ordering ?? '';

  const handleSortChange = (ordering) => {
    activeFilterHook?.setFilter('ordering', ordering);
  };

  const handleFilterToggle = (newState) => {
    setIsFilterOpen(newState);
  };

  // Build grouped suggestions for the search dropdown
  const fetchSuggestions = useCallback(
    async (term) => {
      if (!warehouseId) return [];

      const searchParams = { search: term, page_size: 5, page: 1 };

      const [batchRes, movementRes, balanceRes] = await Promise.allSettled([
        inventoryService.fetchBatches(warehouseId, searchParams),
        inventoryService.fetchMovements(warehouseId, searchParams),
        inventoryService.fetchBalances(warehouseId, searchParams),
      ]);

      const groups = [];

      if (batchRes.status === 'fulfilled' && batchRes.value.data.length > 0) {
        groups.push({
          key: 'batches',
          label: 'Batches',
          results: batchRes.value.data.map((b) => ({
            id: b.id,
            label: b.batch_number || `Batch ${b.id}`,
            sublabel: [
              b.quantity != null ? `Qty: ${b.quantity}` : null,
              b.expiry_date ? `Exp: ${b.expiry_date}` : null,
            ]
              .filter(Boolean)
              .join(' · '),
            badge: b.status || null,
            href: `/inventory/batch/${b.id}`,
          })),
        });
      }

      if (movementRes.status === 'fulfilled' && movementRes.value.data.length > 0) {
        groups.push({
          key: 'movements',
          label: 'Movements',
          results: movementRes.value.data.map((m) => ({
            id: m.id,
            label: m.reference_number || `Movement ${m.id}`,
            sublabel: [
              m.movement_type,
              m.total_quantity != null ? `Qty: ${m.total_quantity}` : null,
            ]
              .filter(Boolean)
              .join(' · '),
            badge: m.movement_type || null,
            href: `/inventory/stock_movements/${m.id}`,
          })),
        });
      }

      if (balanceRes.status === 'fulfilled' && balanceRes.value.data.length > 0) {
        groups.push({
          key: 'balances',
          label: 'Stock Balances',
          results: balanceRes.value.data.map((b) => ({
            id: b.id,
            label: b.product || `Balance ${b.id}`,
            sublabel: b.quantity_on_hand != null ? `On hand: ${b.quantity_on_hand}` : null,
            badge: b.status || null,
            href: `/inventory?tab=balances`,
          })),
        });
      }

      return groups;
    },
    [warehouseId]
  );

  const placeholder = SEARCH_PLACEHOLDERS[activeTab] || 'Search…';
  const sortOptions = SORT_OPTIONS[activeTab] || [];

  return (
    <>
      <div className="inventory-toolbar">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          placeholder={placeholder}
          fetchSuggestions={warehouseId ? fetchSuggestions : null}
        />
        <div className="toolbar-controls">
          <SortDropdown
            ordering={currentOrdering}
            onChange={handleSortChange}
            options={sortOptions}
          />
          <FilterButton
            isOpen={isFilterOpen}
            onToggle={handleFilterToggle}
            activeCount={activeFilterCount}
          />
          <ActionButtons
            activeTab={activeTab}
            onOpenMovementModal={onOpenMovementModal}
            onQualityAudit={onQualityAudit}
          />
        </div>
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        activeTab={activeTab}
      />
    </>
  );
};

export default InventoryToolbar;

