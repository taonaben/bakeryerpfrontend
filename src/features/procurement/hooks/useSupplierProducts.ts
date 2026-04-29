import { useEffect } from 'react';
import { useSupplierProductsStore } from '../stores/supplierProductsStore';
import type { SupplierProductQueryParams } from '../types/models';

/**
 * useSupplierProducts
 *
 * Fetches the list of supplier-product links for the given query params.
 * Re-fetches whenever product_id or supplier_id changes. Cleans up on unmount.
 */
export const useSupplierProducts = (params: SupplierProductQueryParams) => {
  const items = useSupplierProductsStore((s) => s.items);
  const isLoading = useSupplierProductsStore((s) => s.isLoading);
  const error = useSupplierProductsStore((s) => s.error);
  const fetchSupplierProducts = useSupplierProductsStore((s) => s.fetchSupplierProducts);
  const clearSupplierProducts = useSupplierProductsStore((s) => s.clearSupplierProducts);

  // Stable primitive values for the dependency array — avoids re-firing on
  // every render when the caller passes an inline object literal.
  const productId = params.product_id ?? '';
  const supplierId = params.supplier_id ?? '';
  const companyId = params.company_id ?? '';

  useEffect(() => {
    if (!productId && !supplierId) return;

    fetchSupplierProducts({
      ...(productId ? { product_id: productId } : {}),
      ...(supplierId ? { supplier_id: supplierId } : {}),
      ...(companyId ? { company_id: companyId } : {}),
    });

    return () => {
      clearSupplierProducts();
    };
  }, [productId, supplierId, companyId]);

  return { items, isLoading, error };
};
