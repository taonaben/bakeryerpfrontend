import { accountsPayableApi } from '../api/accounts_payable_client';
import type { AccountsPayable, PayAPDTO, APPayment } from '../types/accounts_payable_models';

export const accountsPayableService = {
  async fetchAll(params?: { status?: string; supplier_id?: string; overdue?: boolean }): Promise<AccountsPayable[]> {
    return accountsPayableApi.getAll(params);
  },

  async fetchById(id: string): Promise<AccountsPayable> {
    if (!id) throw new Error('AP Record ID is required');
    return accountsPayableApi.getById(id);
  },

  async fetchBySupplier(supplierId: string): Promise<AccountsPayable[]> {
    if (!supplierId) throw new Error('Supplier ID is required');
    return accountsPayableApi.getBySupplier(supplierId);
  },

  async pay(id: string, dto: PayAPDTO): Promise<APPayment> {
    if (!id) throw new Error('AP Record ID is required');
    if (!dto.amount || dto.amount <= 0) throw new Error('Valid amount is required');
    if (!dto.payment_method) throw new Error('Payment method is required');
    return accountsPayableApi.pay(id, dto);
  },
};
