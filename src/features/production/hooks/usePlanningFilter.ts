import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PlannedOrderPriority, PlannedOrderStatus } from '../types/plannedOrderModel';
import type { PlanningFiltersState } from '../types/store';

// ──────────────────────────────────────────────
// Filter shape
// ──────────────────────────────────────────────

const DEFAULT_FILTERS = {
  search: '',
  status: '' as PlannedOrderStatus | '',
  priority: '' as PlannedOrderPriority | '',
  warehouse_id: '',
  need_by_after: '',
  need_by_before: '',
  ordering: '-created_at',
  page: 1,
  page_size: 25,
};

// ──────────────────────────────────────────────
// Zustand store
// ──────────────────────────────────────────────

export const usePlanningFilter = create<PlanningFiltersState>()(
  devtools(
    immer((set, get) => ({
      filters: { ...DEFAULT_FILTERS },

      setFilter: (key, value) => {
        set((state) => {
          (state.filters as any)[key] = value;
          // Reset to page 1 whenever a non-pagination filter changes
          if (key !== 'page' && key !== 'page_size') {
            state.filters.page = 1;
          }
        });
      },

      setFilters: (partial) => {
        set((state) => {
          Object.assign(state.filters, partial);
        });
      },

      clearAllFilters: () => {
        set((state) => {
          state.filters = { ...DEFAULT_FILTERS };
        });
      },

      getApiQueryParams: () => {
        const filters = get().filters;
        const params: Record<string, any> = {};

        // Include only non-empty filters
        Object.entries(filters).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== '' &&
            !(Array.isArray(value) && value.length === 0)
          ) {
            params[key] = value;
          }
        });

        return params;
      },

      activeFilterCount: () => {
        const filters = get().filters;
        const defaultFilters = DEFAULT_FILTERS;

        return Object.entries(filters).filter(([key, value]) => {
          const defaultValue = (defaultFilters as any)[key];
          return value !== defaultValue && value !== '' && value !== null && value !== undefined;
        }).length;
      },
    })),
    { name: 'planning-filters-store' },
  ),
);
