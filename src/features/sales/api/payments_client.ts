import apiClient from '@/shared/services/api';
import type { Payment } from '../types/payments_models';

const BASE = '/sales/payments';

export const paymentsApi = {
  getAll: async (params?: Record<string, any>): Promise<Payment[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return Array.isArray(data) ? data : (data?.results ?? []);
  },
};
