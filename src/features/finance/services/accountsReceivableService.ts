import { accountsReceivableApi } from '../api/accounts_receivable_client';
import type { AccountsReceivable } from '../types/accounts_receivable_models';

export const accountsReceivableService = {
  async fetchAll(params?: { status?: string; customer_id?: string; overdue?: boolean }): Promise<AccountsReceivable[]> {
    return accountsReceivableApi.getAll(params);
  },

  async fetchById(id: string): Promise<AccountsReceivable> {
    if (!id) throw new Error('AR Record ID is required');
    return accountsReceivableApi.getById(id);
  },

  async fetchByCustomer(customerId: string): Promise<AccountsReceivable[]> {
    if (!customerId) throw new Error('Customer ID is required');
    return accountsReceivableApi.getByCustomer(customerId);
  },
};
