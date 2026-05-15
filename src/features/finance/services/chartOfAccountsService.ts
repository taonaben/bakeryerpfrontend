import { chartOfAccountsApi } from '../api/chart_of_accounts_client';
import type { ChartOfAccount, CreateChartOfAccountDTO, UpdateChartOfAccountDTO } from '../types/chart_of_accounts_models';

export const chartOfAccountsService = {
  async fetchAll(params?: { account_type?: string; account_subtype?: string; is_active?: boolean }): Promise<ChartOfAccount[]> {
    return chartOfAccountsApi.getAll(params);
  },

  async fetchById(id: string): Promise<ChartOfAccount> {
    if (!id) throw new Error('Account ID is required');
    return chartOfAccountsApi.getById(id);
  },

  async create(dto: CreateChartOfAccountDTO): Promise<ChartOfAccount> {
    if (!dto.code || !dto.name || !dto.account_type || !dto.normal_balance) {
      throw new Error('Code, name, account type, and normal balance are required');
    }
    return chartOfAccountsApi.create(dto);
  },

  async update(id: string, dto: UpdateChartOfAccountDTO): Promise<ChartOfAccount> {
    if (!id) throw new Error('Account ID is required');
    return chartOfAccountsApi.update(id, dto);
  },

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Account ID is required');
    return chartOfAccountsApi.delete(id);
  },

  async seed(): Promise<{ seeded: number; accounts: ChartOfAccount[] }> {
    return chartOfAccountsApi.seed();
  },
};
