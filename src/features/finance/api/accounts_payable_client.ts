import apiClient from '@/shared/services/api';
import type { AccountsPayable, PayAPDTO, APPayment } from '../types/accounts_payable_models';

const BASE = '/finance/ap';

export const accountsPayableApi = {
  getAll: async (params?: { status?: string; supplier_id?: string; overdue?: boolean }): Promise<AccountsPayable[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  getById: async (id: string): Promise<AccountsPayable> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  getBySupplier: async (supplierId: string): Promise<AccountsPayable[]> => {
    const { data } = await apiClient.get(`${BASE}/supplier/${supplierId}`);
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  pay: async (id: string, dto: PayAPDTO): Promise<APPayment> => {
    const { data } = await apiClient.post(`${BASE}/${id}/pay`, dto);
    return data;
  },
};
