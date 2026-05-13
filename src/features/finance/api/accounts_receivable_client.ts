import apiClient from '@/shared/services/api';
import type { AccountsReceivable } from '../types/accounts_receivable_models';

const BASE = '/finance/ar';

export const accountsReceivableApi = {
  getAll: async (params?: { status?: string; customer_id?: string; overdue?: boolean }): Promise<AccountsReceivable[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  getById: async (id: string): Promise<AccountsReceivable> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  getByCustomer: async (customerId: string): Promise<AccountsReceivable[]> => {
    const { data } = await apiClient.get(`${BASE}/customer/${customerId}`);
    return Array.isArray(data) ? data : (data?.items ?? []);
  },
};
