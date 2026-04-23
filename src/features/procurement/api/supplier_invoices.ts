import apiClient from '@/shared/services/api';
import type {
  PaginatedResponse,
  SupplierInvoice,
  CreateSupplierInvoiceDTO,
  UpdateSupplierInvoiceDTO,
  ApproveSupplierInvoiceDTO,
  RejectSupplierInvoiceDTO,
  MarkSupplierInvoicePaidDTO,
  SupplierInvoiceMatchResult,
} from '../types/supplier_invoices_model';

export const supplierInvoiceApi = {
  /** GET /purchasing/supplier-invoices/ */
  getInvoices: async (
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<SupplierInvoice>> => {
    const { data } = await apiClient.get('/purchasing/supplier-invoices/', { params });
    return data;
  },

  /** GET /purchasing/supplier-invoices/:id/ */
  getInvoice: async (id: string): Promise<SupplierInvoice> => {
    const { data } = await apiClient.get(`/purchasing/supplier-invoices/${id}/`);
    return data;
  },

  /** POST /purchasing/supplier-invoices/ */
  createInvoice: async (dto: CreateSupplierInvoiceDTO): Promise<SupplierInvoice> => {
    const { data } = await apiClient.post('/purchasing/supplier-invoices/', dto);
    return data;
  },

  /** PUT /purchasing/supplier-invoices/:id/ */
  updateInvoice: async (
    id: string,
    dto: UpdateSupplierInvoiceDTO,
  ): Promise<SupplierInvoice> => {
    const { data } = await apiClient.put(`/purchasing/supplier-invoices/${id}/`, dto);
    return data;
  },

  /** PATCH /purchasing/supplier-invoices/:id/ */
  patchInvoice: async (
    id: string,
    dto: Partial<UpdateSupplierInvoiceDTO>,
  ): Promise<SupplierInvoice> => {
    const { data } = await apiClient.patch(`/purchasing/supplier-invoices/${id}/`, dto);
    return data;
  },

  /** DELETE /purchasing/supplier-invoices/:id/ */
  deleteInvoice: async (id: string): Promise<void> => {
    await apiClient.delete(`/purchasing/supplier-invoices/${id}/`);
  },

  /** POST /purchasing/supplier-invoices/:id/approve/ */
  approveInvoice: async (
    id: string,
    dto: ApproveSupplierInvoiceDTO,
  ): Promise<SupplierInvoice> => {
    const { data } = await apiClient.post(`/purchasing/supplier-invoices/${id}/approve/`, dto);
    return data;
  },

  /** POST /purchasing/supplier-invoices/:id/reject/ */
  rejectInvoice: async (
    id: string,
    dto: RejectSupplierInvoiceDTO,
  ): Promise<SupplierInvoice> => {
    const { data } = await apiClient.post(`/purchasing/supplier-invoices/${id}/reject/`, dto);
    return data;
  },

  /** POST /purchasing/supplier-invoices/:id/mark-paid/ */
  markInvoicePaid: async (
    id: string,
    dto: MarkSupplierInvoicePaidDTO,
  ): Promise<SupplierInvoice> => {
    const { data } = await apiClient.post(`/purchasing/supplier-invoices/${id}/mark-paid/`, dto);
    return data;
  },

  /** GET /purchasing/supplier-invoices/:id/match/ */
  getInvoiceMatch: async (id: string): Promise<SupplierInvoiceMatchResult> => {
    const { data } = await apiClient.get(`/purchasing/supplier-invoices/${id}/match/`);
    return data;
  },
};
