import apiClient from '@/shared/services/api';
import type { FiscalPeriod, CreateFiscalPeriodDTO } from '../types/fiscal_periods_models';

const BASE = '/finance/fiscal-periods';

export const fiscalPeriodsApi = {
  getAll: async (params?: { status?: string }): Promise<FiscalPeriod[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  getById: async (id: string): Promise<FiscalPeriod> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  create: async (dto: CreateFiscalPeriodDTO): Promise<FiscalPeriod> => {
    const { data } = await apiClient.post(BASE, dto);
    return data;
  },

  close: async (id: string): Promise<FiscalPeriod> => {
    const { data } = await apiClient.post(`${BASE}/${id}/close`);
    return data;
  },
};
