import { create } from 'zustand';

interface ProductionOrderFilters {
  status: string;
}

interface ProductionOrderFilterState {
  filters: ProductionOrderFilters;
  setFilter: <K extends keyof ProductionOrderFilters>(
    key: K,
    value: ProductionOrderFilters[K],
  ) => void;
  resetFilters: () => void;
  getApiQueryParams: (warehouseId?: string) => Record<string, string>;
}

const DEFAULT_FILTERS: ProductionOrderFilters = {
  status: '',
};

const useProductionOrderFilters = create<ProductionOrderFilterState>()((set, get) => ({
  filters: DEFAULT_FILTERS,

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  getApiQueryParams: (warehouseId?: string) => {
    const { filters } = get();
    const params: Record<string, string> = {};

    if (warehouseId) {
      params.warehouse_id = warehouseId;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    return params;
  },
}));

export default useProductionOrderFilters;
