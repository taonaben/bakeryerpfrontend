import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';

export interface MovementFilters {
  movement_type: MovementType[];
  total_quantity__gte: string;
  total_quantity__lte: string;
  notes__icontains: string;
  created_at_start: string;
  created_at_end: string;
  ordering: string;
  page: number;
  page_size: number;
}

interface MovementFiltersState {
  filters: MovementFilters;
  setFilter: (key: keyof MovementFilters, value: any) => void;
  setFilters: (partial: Partial<MovementFilters>) => void;
  clearAllFilters: () => void;
  getApiQueryParams: () => Record<string, any>;
  activeFilterCount: () => number;
  updateFilter: (key: keyof MovementFilters, value: any) => void;
}

const DEFAULT_FILTERS: MovementFilters = {
  movement_type: [],
  total_quantity__gte: '',
  total_quantity__lte: '',
  notes__icontains: '',
  created_at_start: '',
  created_at_end: '',
  ordering: '',
  page: 1,
  page_size: 25,
};

const useMovementFiltersStore = create<MovementFiltersState>()(
  devtools(
    immer((set, get) => ({
      filters: { ...DEFAULT_FILTERS },

      setFilter: (key, value) => {
        set((state) => {
          (state.filters as any)[key] = value;
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
        const { filters } = get();
        const params: Record<string, any> = {};

        if (filters.movement_type.length > 0) {
          params.movement_type = filters.movement_type.join(',');
        }
        if (filters.total_quantity__gte) {
          params.total_quantity__gte = filters.total_quantity__gte;
        }
        if (filters.total_quantity__lte) {
          params.total_quantity__lte = filters.total_quantity__lte;
        }
        if (filters.notes__icontains) {
          params.notes__icontains = filters.notes__icontains;
        }
        if (filters.created_at_start && filters.created_at_end) {
          params.created_at__range = `${filters.created_at_start},${filters.created_at_end}`;
        } else if (filters.created_at_start) {
          params.created_at__gte = filters.created_at_start;
        } else if (filters.created_at_end) {
          params.created_at__lte = filters.created_at_end;
        }
        if (filters.ordering) {
          params.ordering = filters.ordering;
        }
        params.page = filters.page;
        params.page_size = filters.page_size;

        return params;
      },

      activeFilterCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.movement_type.length > 0) count++;
        if (filters.total_quantity__gte || filters.total_quantity__lte) count++;
        if (filters.notes__icontains) count++;
        if (filters.created_at_start || filters.created_at_end) count++;
        if (filters.ordering) count++;
        return count;
      },

      updateFilter: (key, value) => {
        get().setFilter(key, value);
      },
    })),
    { name: 'MovementFiltersStore' }
  )
);

export const useMovementFilters = () => useMovementFiltersStore();
export default useMovementFilters;
