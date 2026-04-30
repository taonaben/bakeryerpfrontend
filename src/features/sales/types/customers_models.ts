import type { CustomerType } from './shared';

// ──────────────────────────────────────────────
// Customers
// ──────────────────────────────────────────────

export interface Customer {
  id: string;
  customer_type: CustomerType;
  name: string;
  phone: string;
  email: string;
  company_name: string;
  payment_terms: string;
  is_active: boolean;
  created_at: string;
}

export interface CustomerDetail extends Customer {
  address: string;
  credit_limit: string | null;
  tax_number: string;
}

export interface CreateCustomerDTO {
  customer_type: CustomerType;
  name: string;
  phone: string;
  email: string;
  address: string;
  company_name?: string;
  payment_terms?: string;
  credit_limit?: string;
  tax_number?: string;
}

export type UpdateCustomerDTO = Partial<
  Omit<CreateCustomerDTO, 'customer_type' | 'credit_limit'> & {
    credit_limit: string | null;
    is_active: boolean;
  }
>;

export interface CustomerFilters {
  customer_type?: CustomerType;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

// ── Pricing Agreements ────────────────────────

export interface PricingAgreement {
  id: string;
  customer: string;
  product: string;
  product_name: string;
  unit_price: string;
  min_order_quantity: string;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

export interface CreatePricingAgreementDTO {
  product: string;
  unit_price: string;
  min_order_quantity?: string;
  valid_from: string;
  valid_until?: string;
}

export type UpdatePricingAgreementDTO = Partial<CreatePricingAgreementDTO & { is_active: boolean }>;

// ── Outstanding Balance ───────────────────────

export interface CustomerOutstanding {
  customer_id: string;
  customer_name: string;
  credit_limit: string | null;
  outstanding_balance: string;
  available_credit: string | null;
  over_limit: boolean;
}
