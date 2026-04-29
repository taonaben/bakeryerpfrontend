import apiClient from '@/shared/services/api';
import type {
  StandardCost,
  StandardCostDetail,
  StandardCostLine,
  ComputeStandardCostDTO,
  PaginatedResponse,
} from '../types/standard_costs_models';

const BASE = '/costing/standard-costs';

export const standardCostsApi = {
  getAll: async (params?: Record<string, any>): Promise<PaginatedResponse<StandardCost>> => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<StandardCostDetail> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  getLines: async (id: string): Promise<StandardCostLine[]> => {
    const { data } = await apiClient.get(`${BASE}/${id}/lines`);
    return data;
  },

  compute: async (dto: ComputeStandardCostDTO): Promise<StandardCostDetail> => {
    const { data } = await apiClient.post(`${BASE}/compute`, dto);
    return data;
  },
};
