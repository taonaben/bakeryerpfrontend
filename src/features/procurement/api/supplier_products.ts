import apiClient from '@/shared/services/api';
import type {
  SupplierProduct,
  SupplierProductQueryParams,
  CreateSupplierProductDTO,
  UpdateSupplierProductDTO,
} from '../types/models';

/**
 * Supplier Products API Client
 * Wraps /purchasing/supplier-products/ endpoints.
 *
 * These endpoints expose the supplier-product catalogue — which suppliers
 * carry which products, at what price and lead time.
 */
export const supplierProductsApi = {
  /**
   * GET /purchasing/supplier-products/
   * List supplier-product links, filtered by product_id, supplier_id, and/or company_id.
   * Results are ordered: preferred first, then cheapest.
   */
  list: async (params: SupplierProductQueryParams): Promise<SupplierProduct[]> => {
    const { data } = await apiClient.get('/purchasing/supplier-products/', { params });
    // Handle both plain array and paginated envelope
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },

  /**
   * GET /purchasing/supplier-products/<id>/
   * Retrieve a single supplier-product link by its own ID.
   */
  get: async (id: string): Promise<SupplierProduct> => {
    const { data } = await apiClient.get(`/purchasing/supplier-products/${id}/`);
    return data;
  },

  /**
   * POST /purchasing/supplier-products/?product_id=<uuid>
   * Add a supplier to a product's catalogue.
   * If is_preferred: true, any existing preferred supplier for that product
   * within the same company is automatically demoted by the backend.
   */
  create: async (
    productId: string,
    dto: CreateSupplierProductDTO,
  ): Promise<SupplierProduct> => {
    const { data } = await apiClient.post(
      '/purchasing/supplier-products/',
      dto,
      { params: { product_id: productId } },
    );
    return data;
  },

  /**
   * PATCH /purchasing/supplier-products/<id>/
   * Update one or more fields on an existing supplier-product link.
   * Setting is_preferred: true automatically demotes the previous preferred supplier.
   */
  patch: async (
    id: string,
    dto: UpdateSupplierProductDTO,
  ): Promise<SupplierProduct> => {
    const { data } = await apiClient.patch(`/purchasing/supplier-products/${id}/`, dto);
    return data;
  },

  /**
   * DELETE /purchasing/supplier-products/<id>/
   * Soft-deactivates the link — sets is_active: false and clears is_preferred.
   * The record is NOT deleted from the database.
   * Returns the deactivated record.
   */
  deactivate: async (id: string): Promise<SupplierProduct> => {
    const { data } = await apiClient.delete(`/purchasing/supplier-products/${id}/`);
    return data;
  },
};
