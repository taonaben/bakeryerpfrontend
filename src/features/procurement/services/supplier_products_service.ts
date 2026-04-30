import { supplierProductsApi } from '../api/supplier_products';
import type {
  SupplierProduct,
  SupplierProductQueryParams,
  CreateSupplierProductDTO,
  UpdateSupplierProductDTO,
} from '../types/models';

/**
 * Supplier Products Service
 *
 * Wraps the supplier products API client with validation and
 * normalisation. Stores and hooks interact only with this layer.
 */
export const supplierProductsService = {
  /**
   * Fetch all supplier-product links matching the given filters.
   * At least one of product_id or supplier_id should be provided.
   */
  async fetchSupplierProducts(
    params: SupplierProductQueryParams,
  ): Promise<SupplierProduct[]> {
    const results = await supplierProductsApi.list(params);
    return results.map((sp) => this.normalize(sp));
  },

  /**
   * Fetch a single supplier-product link by its ID.
   */
  async fetchSupplierProduct(id: string): Promise<SupplierProduct> {
    if (!id) throw new Error('Supplier product ID is required');
    const raw = await supplierProductsApi.get(id);
    return this.normalize(raw);
  },

  /**
   * Add a supplier to a product's catalogue.
   * productId: the product UUID (passed as ?product_id= query param)
   */
  async createSupplierProduct(
    productId: string,
    dto: CreateSupplierProductDTO,
  ): Promise<SupplierProduct> {
    if (!productId) throw new Error('Product ID is required');
    if (!dto.supplier_id) throw new Error('Supplier ID is required');
    if (!dto.price) throw new Error('Price is required');
    const created = await supplierProductsApi.create(productId, dto);
    return this.normalize(created);
  },

  /**
   * Update one or more fields on an existing supplier-product link.
   */
  async updateSupplierProduct(
    id: string,
    dto: UpdateSupplierProductDTO,
  ): Promise<SupplierProduct> {
    if (!id) throw new Error('Supplier product ID is required');
    const updated = await supplierProductsApi.patch(id, dto);
    return this.normalize(updated);
  },

  /**
   * Soft-deactivate a supplier-product link.
   * Sets is_active: false and clears is_preferred on the backend.
   */
  async deactivateSupplierProduct(id: string): Promise<SupplierProduct> {
    if (!id) throw new Error('Supplier product ID is required');
    const deactivated = await supplierProductsApi.deactivate(id);
    return this.normalize(deactivated);
  },

  // ─── Normalisation ────────────────────────────────────────────────────────

  normalize(raw: any): SupplierProduct {
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
};
