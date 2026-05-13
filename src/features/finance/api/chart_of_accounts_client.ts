import apiClient from '@/shared/services/api';
import type { ChartOfAccount, CreateChartOfAccountDTO, UpdateChartOfAccountDTO } from '../types/chart_of_accounts_models';

const BASE = '/finance/accounts';

export const chartOfAccountsApi = {
  getAll: async (params?: { account_type?: string; account_subtype?: string; is_active?: boolean }): Promise<ChartOfAccount[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  getById: async (id: string): Promise<ChartOfAccount> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  create: async (dto: CreateChartOfAccountDTO): Promise<ChartOfAccount> => {
    const { data } = await apiClient.post(BASE, dto);
    return data;
  },

  update: async (id: string, dto: UpdateChartOfAccountDTO): Promise<ChartOfAccount> => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  seed: async (): Promise<{ seeded: number; accounts: ChartOfAccount[] }> => {
    const { data } = await apiClient.post(`${BASE}/seed`);
    return data;
  },
};
