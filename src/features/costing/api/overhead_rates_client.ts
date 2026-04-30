import apiClient from '@/shared/services/api';
import type {
  OverheadRate,
  CreateOverheadRateDTO,
  UpdateOverheadRateDTO,
  PaginatedResponse,
} from '../types/overhead_rates_models';

const BASE = '/costing/overhead-rates';

export const overheadRatesApi = {
  getAll: async (params?: Record<string, any>): Promise<PaginatedResponse<OverheadRate>> => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<OverheadRate> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  getActive: async (params: { warehouse_id: string; date?: string }): Promise<OverheadRate> => {
    const { data } = await apiClient.get(`${BASE}/active`, { params });
    return data;
  },

  create: async (dto: CreateOverheadRateDTO): Promise<OverheadRate> => {
    const { data } = await apiClient.post(BASE, dto);
    return data;
  },

  patch: async (id: string, dto: UpdateOverheadRateDTO): Promise<OverheadRate> => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, dto);
    return data;
  },
};
