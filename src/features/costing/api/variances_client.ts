import apiClient from '@/shared/services/api';
import type {
  Variance,
  VarianceSummaryItem,
  VarianceSummaryFilters,
  PaginatedResponse,
} from '../types/variances_models';

const BASE = '/costing/variances';

export const variancesApi = {
  getAll: async (params?: Record<string, any>): Promise<PaginatedResponse<Variance>> => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<Variance> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  getSummary: async (params?: VarianceSummaryFilters): Promise<VarianceSummaryItem[]> => {
    const { data } = await apiClient.get(`${BASE}/summary`, { params });
    return data;
  },
};
