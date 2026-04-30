import { customersApi } from '../api/customers_client';
import type {
  Customer,
  CustomerDetail,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  PricingAgreement,
  CreatePricingAgreementDTO,
  UpdatePricingAgreementDTO,
  CustomerOutstanding,
  CustomerFilters,
} from '../types/customers_models';
import type { SalesOrder } from '../types/orders_models';
import type { Invoice } from '../types/invoices_models';
import type { Payment } from '../types/payments_models';

// ──────────────────────────────────────────────
// Customers Service
// ──────────────────────────────────────────────

export const customersService = {
  async fetchAll(filters?: CustomerFilters): Promise<Customer[]> {
    const params = buildParams(filters);
    return customersApi.getAll(params);
  },

  async fetchById(id: string): Promise<CustomerDetail> {
    if (!id) throw new Error('Customer ID is required');
    return customersApi.getById(id);
  },

  async create(dto: CreateCustomerDTO): Promise<CustomerDetail> {
    validateCreate(dto);
    return customersApi.create(dto);
  },

  async patch(id: string, dto: UpdateCustomerDTO): Promise<CustomerDetail> {
    if (!id) throw new Error('Customer ID is required');
    return customersApi.patch(id, dto);
  },

  async deactivate(id: string): Promise<void> {
    if (!id) throw new Error('Customer ID is required');
    return customersApi.deactivate(id);
  },

  async fetchOrders(id: string): Promise<SalesOrder[]> {
    if (!id) throw new Error('Customer ID is required');
    return customersApi.getOrders(id);
  },

  async fetchInvoices(id: string): Promise<Invoice[]> {
    if (!id) throw new Error('Customer ID is required');
    return customersApi.getInvoices(id);
  },

  async fetchPayments(id: string): Promise<Payment[]> {
    if (!id) throw new Error('Customer ID is required');
    return customersApi.getPayments(id);
  },

  async fetchOutstanding(id: string): Promise<CustomerOutstanding> {
    if (!id) throw new Error('Customer ID is required');
    return customersApi.getOutstanding(id);
  },

  async fetchPricingAgreements(id: string): Promise<PricingAgreement[]> {
    if (!id) throw new Error('Customer ID is required');
    return customersApi.getPricingAgreements(id);
  },

  async createPricingAgreement(
    customerId: string,
    dto: CreatePricingAgreementDTO,
  ): Promise<PricingAgreement> {
    if (!customerId) throw new Error('Customer ID is required');
    if (!dto.product) throw new Error('Product is required');
    if (!dto.unit_price) throw new Error('Unit price is required');
    if (!dto.valid_from) throw new Error('Valid from date is required');
    return customersApi.createPricingAgreement(customerId, dto);
  },

  async updatePricingAgreement(
    customerId: string,
    agreementId: string,
    dto: UpdatePricingAgreementDTO,
  ): Promise<PricingAgreement> {
    if (!customerId) throw new Error('Customer ID is required');
    if (!agreementId) throw new Error('Agreement ID is required');
    return customersApi.updatePricingAgreement(customerId, agreementId, dto);
  },

  async deactivatePricingAgreement(
    customerId: string,
    agreementId: string,
  ): Promise<void> {
    if (!customerId) throw new Error('Customer ID is required');
    if (!agreementId) throw new Error('Agreement ID is required');
    return customersApi.deactivatePricingAgreement(customerId, agreementId);
  },
};

// ── Helpers ──────────────────────────────────

function validateCreate(dto: CreateCustomerDTO): void {
  if (!dto.customer_type) throw new Error('Customer type is required');
  if (!dto.name?.trim()) throw new Error('Customer name is required');
  if (!dto.phone?.trim()) throw new Error('Phone number is required');
  if (!dto.email?.trim()) throw new Error('Email is required');
  if (dto.customer_type === 'business' && !dto.payment_terms?.trim()) {
    throw new Error('Payment terms are required for business customers');
  }
}

function buildParams(filters?: CustomerFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (!filters) return params;
  if (filters.customer_type) params.customer_type = filters.customer_type;
  if (filters.is_active !== undefined) params.is_active = filters.is_active;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = filters.page;
  if (filters.page_size) params.page_size = filters.page_size;
  return params;
}
