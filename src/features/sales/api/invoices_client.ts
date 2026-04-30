import apiClient from '@/shared/services/api';
import type {
  Invoice,
  InvoiceDetail,
  CancelInvoiceDTO,
  InvoicePDFResponse,
} from '../types/invoices_models';
import type { Payment } from '../types/payments_models';
import type { RecordPaymentDTO } from '../types/payments_models';

const BASE = '/sales/invoices';

export const invoicesApi = {
  getAll: async (params?: Record<string, any>): Promise<Invoice[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<InvoiceDetail> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  cancel: async (id: string, dto?: CancelInvoiceDTO): Promise<InvoiceDetail> => {
    const { data } = await apiClient.post(`${BASE}/${id}/cancel`, dto ?? {});
    return data;
  },

  getPDF: async (id: string): Promise<InvoicePDFResponse> => {
    const { data } = await apiClient.get(`${BASE}/${id}/pdf`);
    return data;
  },

  getPayments: async (invoiceId: string): Promise<Payment[]> => {
    const { data } = await apiClient.get(`${BASE}/${invoiceId}/payments`);
    return data;
  },

  recordPayment: async (invoiceId: string, dto: RecordPaymentDTO): Promise<Payment> => {
    const { data } = await apiClient.post(`${BASE}/${invoiceId}/payments`, dto);
    return data;
  },
};
