import { fiscalPeriodsApi } from '../api/fiscal_periods_client';
import type { FiscalPeriod, CreateFiscalPeriodDTO } from '../types/fiscal_periods_models';

export const fiscalPeriodsService = {
  async fetchAll(params?: { status?: string }): Promise<FiscalPeriod[]> {
    return fiscalPeriodsApi.getAll(params);
  },

  async fetchById(id: string): Promise<FiscalPeriod> {
    if (!id) throw new Error('Fiscal Period ID is required');
    return fiscalPeriodsApi.getById(id);
  },

  async create(dto: CreateFiscalPeriodDTO): Promise<FiscalPeriod> {
    if (!dto.name) throw new Error('Name is required');
    return fiscalPeriodsApi.create(dto);
  },

  async close(id: string): Promise<FiscalPeriod> {
    if (!id) throw new Error('Fiscal Period ID is required');
    return fiscalPeriodsApi.close(id);
  },
};
