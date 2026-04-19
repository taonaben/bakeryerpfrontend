import { supplierApi } from '../api/suppliers';
import type {
  Supplier,
  SupplierContact,
  SupplierDocument,
  SupplierProduct,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  AddProductToSupplierDTO,
  CreateContactDTO,
  UpdateContactDTO,
  CreateDocumentDTO,
  UpdateDocumentDTO,
} from '../types/models';

export const supplierService = {
  // ─── List ────────────────────────────────────
  async fetchSuppliers(
    filterParams?: Record<string, any>,
    page: number = 1,
  ): Promise<{ data: Supplier[]; count: number; currentPage: number; totalPages: number }> {
    const apiParams: Record<string, any> = {};

    if (filterParams && typeof filterParams === 'object') {
      Object.entries(filterParams).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          apiParams[key] = value;
        }
      });
    } else {
      apiParams.page = page;
    }

    const response = await supplierApi.getSuppliers(apiParams);
    const pageSize = apiParams.page_size || 25;
    const totalPages = Math.ceil(response.count / pageSize);

    return {
      data: response.results.map((s) => this.normalizeSupplier(s)),
      count: response.count,
      currentPage: apiParams.page || 1,
      totalPages,
    };
  },

  // ─── Detail ──────────────────────────────────
  async fetchSupplier(id: string): Promise<Supplier> {
    if (!id) throw new Error('Supplier ID is required');
    const raw = await supplierApi.getSupplier(id);
    return this.normalizeSupplier(raw);
  },

  // ─── Create ──────────────────────────────────
  async createSupplier(dto: CreateSupplierDTO): Promise<Supplier> {
    this.validateSupplier(dto);
    const created = await supplierApi.createSupplier(dto);
    return this.normalizeSupplier(created);
  },

  // ─── Full Update (PUT) ───────────────────────
  async updateSupplier(id: string, dto: UpdateSupplierDTO): Promise<Supplier> {
    if (!id) throw new Error('Supplier ID is required');
    const updated = await supplierApi.updateSupplier(id, dto);
    return this.normalizeSupplier(updated);
  },

  // ─── Partial Update (PATCH) ──────────────────
  async patchSupplier(id: string, dto: Partial<UpdateSupplierDTO>): Promise<Supplier> {
    if (!id) throw new Error('Supplier ID is required');
    const updated = await supplierApi.patchSupplier(id, dto);
    return this.normalizeSupplier(updated);
  },

  // ─── Delete ──────────────────────────────────
  async deleteSupplier(id: string): Promise<void> {
    if (!id) throw new Error('Supplier ID is required');
    await supplierApi.deleteSupplier(id);
  },

  // ─── Normalisation ───────────────────────────
  normalizeSupplier(raw: any): Supplier {
    const rating = Math.min(5, Math.max(1, Number(raw.rating) || 1)) as 1 | 2 | 3 | 4 | 5;
    return {
      ...raw,
      credit_limit: parseFloat(raw.credit_limit) || 0,
      minimum_order_value: parseFloat(raw.minimum_order_value) || 0,
      delivery_radius_km: parseFloat(raw.delivery_radius_km) || 0,
      delivery_days: Array.isArray(raw.delivery_days) ? raw.delivery_days : [],
      rating,
      warehouses_served: Array.isArray(raw.warehouses_served) ? raw.warehouses_served : [],
      contacts: Array.isArray(raw.contacts)
        ? raw.contacts.map((c: any) => this.normalizeContact(c))
        : [],
      documents: Array.isArray(raw.documents)
        ? raw.documents.map((d: any) => this.normalizeDocument(d))
        : [],
      products: Array.isArray(raw.products)
        ? raw.products.map((p: any) => this.normalizeProduct(p))
        : [],
    };
  },

  normalizeContact(raw: any): SupplierContact {
    return {
      ...raw,
      role: raw.role || '',
      email: raw.email || '',
      phone: raw.phone || '',
      is_primary: raw.is_primary ?? false,
    };
  },

  normalizeDocument(raw: any): SupplierDocument {
    return {
      ...raw,
      notes: raw.notes || '',
      is_active: raw.is_active ?? true,
    };
  },

  normalizeProduct(raw: any): SupplierProduct {
    return {
      ...raw,
      supplier_name: raw.supplier_name || '',
      product_name: raw.product_name || '',
      price: raw.price ?? '0',
      lead_time_days: raw.lead_time_days ?? 0,
      is_preferred: raw.is_preferred ?? false,
      is_active: raw.is_active ?? true,
    };
  },

  // ─── Validation ──────────────────────────────
  validateSupplier(dto: CreateSupplierDTO): void {
    if (!dto.company) throw new Error('Company is required');
    if (!dto.name?.trim()) throw new Error('Supplier name is required');
    if (!dto.primary_email?.trim()) throw new Error('Primary email is required');
    if (!dto.primary_phone?.trim()) throw new Error('Primary phone is required');
    if (!dto.currency?.trim()) throw new Error('Currency is required');
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
  },
  // ─── Status Actions ────────────────────────

  async putOnHold(id: string, reason: string): Promise<Supplier> {
    if (!id) throw new Error('Supplier ID is required');
    if (!reason?.trim()) throw new Error('Hold reason is required');
    const updated = await supplierApi.putOnHold(id, { reason });
    return this.normalizeSupplier(updated);
  },

  async releaseHold(id: string): Promise<Supplier> {
    if (!id) throw new Error('Supplier ID is required');
    const updated = await supplierApi.releaseHold(id);
    return this.normalizeSupplier(updated);
  },

  async reactivate(id: string): Promise<Supplier> {
    if (!id) throw new Error('Supplier ID is required');
    const updated = await supplierApi.reactivate(id);
    return this.normalizeSupplier(updated);
  },

  async addProduct(id: string, dto: AddProductToSupplierDTO): Promise<SupplierProduct> {
    if (!id) throw new Error('Supplier ID is required');
    if (!dto.product_id) throw new Error('Product ID is required');
    if (!dto.price) throw new Error('Price is required');
    return await supplierApi.addProduct(id, dto);
  },

  // ─── Preferred Suppliers (stub) ─────────────

  async fetchPreferredSuppliers(
    params?: Record<string, any>,
  ): Promise<{ data: Supplier[]; count: number }> {
    const response = await supplierApi.getPreferredSuppliers(params);
    return {
      data: response.results.map((s) => this.normalizeSupplier(s)),
      count: response.count,
    };
  },

  // ─── Contacts ───────────────────────────────

  async fetchContacts(
    supplierId: string,
    params?: Record<string, any>,
  ): Promise<{ data: SupplierContact[]; count: number }> {
    if (!supplierId) throw new Error('Supplier ID is required');
    const response = await supplierApi.getContacts(supplierId, params);
    return {
      data: response.results.map((c) => this.normalizeContact(c)),
      count: response.count,
    };
  },

  async fetchContact(supplierId: string, contactId: string): Promise<SupplierContact> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!contactId) throw new Error('Contact ID is required');
    const raw = await supplierApi.getContact(supplierId, contactId);
    return this.normalizeContact(raw);
  },

  async createContact(supplierId: string, dto: CreateContactDTO): Promise<SupplierContact> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!dto.name?.trim()) throw new Error('Contact name is required');
    if (!dto.email?.trim()) throw new Error('Contact email is required');
    if (!dto.phone?.trim()) throw new Error('Contact phone is required');
    const created = await supplierApi.createContact(supplierId, dto);
    return this.normalizeContact(created);
  },

  async updateContact(
    supplierId: string,
    contactId: string,
    dto: UpdateContactDTO,
  ): Promise<SupplierContact> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!contactId) throw new Error('Contact ID is required');
    const updated = await supplierApi.updateContact(supplierId, contactId, dto);
    return this.normalizeContact(updated);
  },

  async patchContact(
    supplierId: string,
    contactId: string,
    dto: Partial<UpdateContactDTO>,
  ): Promise<SupplierContact> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!contactId) throw new Error('Contact ID is required');
    const updated = await supplierApi.patchContact(supplierId, contactId, dto);
    return this.normalizeContact(updated);
  },

  async deleteContact(supplierId: string, contactId: string): Promise<void> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!contactId) throw new Error('Contact ID is required');
    await supplierApi.deleteContact(supplierId, contactId);
  },

  // ─── Documents ──────────────────────────────

  async fetchDocuments(
    supplierId: string,
    params?: Record<string, any>,
  ): Promise<{ data: SupplierDocument[]; count: number }> {
    if (!supplierId) throw new Error('Supplier ID is required');
    const response = await supplierApi.getDocuments(supplierId, params);
    return {
      data: response.results.map((d) => this.normalizeDocument(d)),
      count: response.count,
    };
  },

  async fetchDocument(supplierId: string, documentId: string): Promise<SupplierDocument> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!documentId) throw new Error('Document ID is required');
    const raw = await supplierApi.getDocument(supplierId, documentId);
    return this.normalizeDocument(raw);
  },

  async createDocument(supplierId: string, dto: CreateDocumentDTO): Promise<SupplierDocument> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!dto.name?.trim()) throw new Error('Document name is required');
    if (!dto.document_type) throw new Error('Document type is required');
    const created = await supplierApi.createDocument(supplierId, dto);
    return this.normalizeDocument(created);
  },

  async updateDocument(
    supplierId: string,
    documentId: string,
    dto: UpdateDocumentDTO,
  ): Promise<SupplierDocument> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!documentId) throw new Error('Document ID is required');
    const updated = await supplierApi.updateDocument(supplierId, documentId, dto);
    return this.normalizeDocument(updated);
  },

  async patchDocument(
    supplierId: string,
    documentId: string,
    dto: Partial<UpdateDocumentDTO>,
  ): Promise<SupplierDocument> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!documentId) throw new Error('Document ID is required');
    const updated = await supplierApi.patchDocument(supplierId, documentId, dto);
    return this.normalizeDocument(updated);
  },

  async deleteDocument(supplierId: string, documentId: string): Promise<void> {
    if (!supplierId) throw new Error('Supplier ID is required');
    if (!documentId) throw new Error('Document ID is required');
    await supplierApi.deleteDocument(supplierId, documentId);
  },};
