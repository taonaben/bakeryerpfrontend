import apiClient from '@/shared/services/api';
import type {
  Customer,
  CustomerDetail,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  PricingAgreement,
  CreatePricingAgreementDTO,
  UpdatePricingAgreementDTO,
  CustomerOutstanding,
} from '../types/customers_models';
import type { SalesOrder } from '../types/orders_models';
import type { Invoice } from '../types/invoices_models';
import type { Payment } from '../types/payments_models';

const BASE = '/sales/customers';

export const customersApi = {
  getAll: async (params?: Record<string, any>): Promise<Customer[]> => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<CustomerDetail> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  create: async (dto: CreateCustomerDTO): Promise<CustomerDetail> => {
    const { data } = await apiClient.post(BASE, dto);
    return data;
  },

  patch: async (id: string, dto: UpdateCustomerDTO): Promise<CustomerDetail> => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, dto);
    return data;
  },

  deactivate: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  getOrders: async (id: string): Promise<SalesOrder[]> => {
    const { data } = await apiClient.get(`${BASE}/${id}/orders`);
    return data;
  },

  getInvoices: async (id: string): Promise<Invoice[]> => {
    const { data } = await apiClient.get(`${BASE}/${id}/invoices`);
    return data;
  },

  getPayments: async (id: string): Promise<Payment[]> => {
    const { data } = await apiClient.get(`${BASE}/${id}/payments`);
    return data;
  },

  getOutstanding: async (id: string): Promise<CustomerOutstanding> => {
    const { data } = await apiClient.get(`${BASE}/${id}/outstanding`);
    return data;
  },

  getPricingAgreements: async (id: string): Promise<PricingAgreement[]> => {
    const { data } = await apiClient.get(`${BASE}/${id}/pricing`);
    return data;
  },

  createPricingAgreement: async (
    id: string,
    dto: CreatePricingAgreementDTO,
  ): Promise<PricingAgreement> => {
    const { data } = await apiClient.post(`${BASE}/${id}/pricing`, dto);
    return data;
  },

  updatePricingAgreement: async (
    customerId: string,
    agreementId: string,
    dto: UpdatePricingAgreementDTO,
  ): Promise<PricingAgreement> => {
    const { data } = await apiClient.patch(
      `${BASE}/${customerId}/pricing/${agreementId}`,
      dto,
    );
    return data;
  },

  deactivatePricingAgreement: async (
    customerId: string,
    agreementId: string,
  ): Promise<void> => {
    await apiClient.delete(`${BASE}/${customerId}/pricing/${agreementId}`);
  },
};
