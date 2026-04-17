import apiClient from '@/shared/services/api';
import type {
  PaginatedResponse,
  Supplier,
  SupplierContact,
  SupplierDocument,
  SupplierProduct,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  AddProductToSupplierDTO,
  PutOnHoldDTO,
  CreateContactDTO,
  UpdateContactDTO,
  CreateDocumentDTO,
  UpdateDocumentDTO,
} from '../types/models';

// Raw API calls — no caching, no state
export const supplierApi = {
  // ─── Core CRUD ───────────────────────────────

  /** GET /purchasing/suppliers/ */
  getSuppliers: async (params?: Record<string, any>): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await apiClient.get('/purchasing/suppliers/', { params });
    return data;
  },

  /** GET /purchasing/suppliers/:id/ */
  getSupplier: async (id: string): Promise<Supplier> => {
    const { data } = await apiClient.get(`/purchasing/suppliers/${id}/`);
    return data;
  },

  /** POST /purchasing/suppliers/ */
  createSupplier: async (dto: CreateSupplierDTO): Promise<Supplier> => {
    const { data } = await apiClient.post('/purchasing/suppliers/', dto);
    return data;
  },

  /** PUT /purchasing/suppliers/:id/ */
  updateSupplier: async (id: string, dto: UpdateSupplierDTO): Promise<Supplier> => {
    const { data } = await apiClient.put(`/purchasing/suppliers/${id}/`, dto);
    return data;
  },

  /** PATCH /purchasing/suppliers/:id/ */
  patchSupplier: async (id: string, dto: Partial<UpdateSupplierDTO>): Promise<Supplier> => {
    const { data } = await apiClient.patch(`/purchasing/suppliers/${id}/`, dto);
    return data;
  },

  /** DELETE /purchasing/suppliers/:id/ */
  deleteSupplier: async (id: string): Promise<void> => {
    await apiClient.delete(`/purchasing/suppliers/${id}/`);
  },

  // ─── Status Actions ──────────────────────────

  /** POST /purchasing/suppliers/:id/add-product/ */
  addProduct: async (id: string, dto: AddProductToSupplierDTO): Promise<SupplierProduct> => {
    const { data } = await apiClient.post(`/purchasing/suppliers/${id}/add-product/`, dto);
    return data;
  },

  /** POST /purchasing/suppliers/:id/put-on-hold/ */
  putOnHold: async (id: string, dto: PutOnHoldDTO): Promise<Supplier> => {
    const { data } = await apiClient.post(`/purchasing/suppliers/${id}/put-on-hold/`, dto);
    return data;
  },

  /** POST /purchasing/suppliers/:id/release-hold/ */
  releaseHold: async (id: string): Promise<Supplier> => {
    const { data } = await apiClient.post(`/purchasing/suppliers/${id}/release-hold/`);
    return data;
  },

  /** POST /purchasing/suppliers/:id/reactivate/ */
  reactivate: async (id: string): Promise<Supplier> => {
    const { data } = await apiClient.post(`/purchasing/suppliers/${id}/reactivate/`);
    return data;
  },

  // ─── Preferred Suppliers (stub) ──────────────

  /** GET /purchasing/suppliers/preferred-supplier/ */
  getPreferredSuppliers: async (params?: Record<string, any>): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await apiClient.get('/purchasing/suppliers/preferred-supplier/', { params });
    return data;
  },

  // ─── Contacts ────────────────────────────────

  /** GET /purchasing/suppliers/:supplierId/contacts/ */
  getContacts: async (supplierId: string, params?: Record<string, any>): Promise<PaginatedResponse<SupplierContact>> => {
    const { data } = await apiClient.get(`/purchasing/suppliers/${supplierId}/contacts/`, { params });
    return data;
  },

  /** GET /purchasing/suppliers/:supplierId/contacts/:id/ */
  getContact: async (supplierId: string, contactId: string): Promise<SupplierContact> => {
    const { data } = await apiClient.get(`/purchasing/suppliers/${supplierId}/contacts/${contactId}/`);
    return data;
  },

  /** POST /purchasing/suppliers/:supplierId/contacts/ */
  createContact: async (supplierId: string, dto: CreateContactDTO): Promise<SupplierContact> => {
    const { data } = await apiClient.post(`/purchasing/suppliers/${supplierId}/contacts/`, dto);
    return data;
  },

  /** PUT /purchasing/suppliers/:supplierId/contacts/:id/ */
  updateContact: async (supplierId: string, contactId: string, dto: UpdateContactDTO): Promise<SupplierContact> => {
    const { data } = await apiClient.put(`/purchasing/suppliers/${supplierId}/contacts/${contactId}/`, dto);
    return data;
  },

  /** PATCH /purchasing/suppliers/:supplierId/contacts/:id/ */
  patchContact: async (supplierId: string, contactId: string, dto: Partial<UpdateContactDTO>): Promise<SupplierContact> => {
    const { data } = await apiClient.patch(`/purchasing/suppliers/${supplierId}/contacts/${contactId}/`, dto);
    return data;
  },

  /** DELETE /purchasing/suppliers/:supplierId/contacts/:id/ */
  deleteContact: async (supplierId: string, contactId: string): Promise<void> => {
    await apiClient.delete(`/purchasing/suppliers/${supplierId}/contacts/${contactId}/`);
  },

  // ─── Documents ───────────────────────────────

  /** GET /purchasing/suppliers/:supplierId/documents/ */
  getDocuments: async (supplierId: string, params?: Record<string, any>): Promise<PaginatedResponse<SupplierDocument>> => {
    const { data } = await apiClient.get(`/purchasing/suppliers/${supplierId}/documents/`, { params });
    return data;
  },

  /** GET /purchasing/suppliers/:supplierId/documents/:id/ */
  getDocument: async (supplierId: string, documentId: string): Promise<SupplierDocument> => {
    const { data } = await apiClient.get(`/purchasing/suppliers/${supplierId}/documents/${documentId}/`);
    return data;
  },

  /** POST /purchasing/suppliers/:supplierId/documents/ */
  createDocument: async (supplierId: string, dto: CreateDocumentDTO): Promise<SupplierDocument> => {
    const { data } = await apiClient.post(`/purchasing/suppliers/${supplierId}/documents/`, dto);
    return data;
  },

  /** PUT /purchasing/suppliers/:supplierId/documents/:id/ */
  updateDocument: async (supplierId: string, documentId: string, dto: UpdateDocumentDTO): Promise<SupplierDocument> => {
    const { data } = await apiClient.put(`/purchasing/suppliers/${supplierId}/documents/${documentId}/`, dto);
    return data;
  },

  /** PATCH /purchasing/suppliers/:supplierId/documents/:id/ */
  patchDocument: async (supplierId: string, documentId: string, dto: Partial<UpdateDocumentDTO>): Promise<SupplierDocument> => {
    const { data } = await apiClient.patch(`/purchasing/suppliers/${supplierId}/documents/${documentId}/`, dto);
    return data;
  },

  /** DELETE /purchasing/suppliers/:supplierId/documents/:id/ */
  deleteDocument: async (supplierId: string, documentId: string): Promise<void> => {
    await apiClient.delete(`/purchasing/suppliers/${supplierId}/documents/${documentId}/`);
  },
};

