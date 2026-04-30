import apiClient from '@/shared/services/api';
import type {
  CostingEntry,
  CostingEntryDetail,
  CostingEntryLine,
  ComputeCostingEntryDTO,
  PaginatedResponse,
} from '../types/costing_entries_models';
import type { Variance } from '../types/variances_models';

const BASE = '/costing/costing-entries';

export const costingEntriesApi = {
  getAll: async (params?: Record<string, any>): Promise<PaginatedResponse<CostingEntry>> => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<CostingEntryDetail> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  getLines: async (id: string): Promise<CostingEntryLine[]> => {
    const { data } = await apiClient.get(`${BASE}/${id}/lines`);
    return data;
  },

  getVariance: async (id: string): Promise<Variance> => {
    const { data } = await apiClient.get(`${BASE}/${id}/variance`);
    return data;
  },

  compute: async (dto: ComputeCostingEntryDTO): Promise<CostingEntryDetail> => {
    const { data } = await apiClient.post(`${BASE}/compute`, dto);
    return data;
  },
};
