import { useEffect } from 'react';
import { useSupplierProductsStore } from '../stores/supplierProductsStore';

/**
 * useSupplierProductDetail
 *
 * Fetches a single supplier-product link by its own ID.
 * Cleans up on unmount.
 *
 * Usage:
 *   const { selected, isLoading, error } = useSupplierProductDetail('uuid');
 */
export const useSupplierProductDetail = (id: string) => {
  const selected = useSupplierProductsStore((s) => s.selected);
  const isLoading = useSupplierProductsStore((s) => s.isLoading);
  const error = useSupplierProductsStore((s) => s.error);
  const fetchSupplierProduct = useSupplierProductsStore((s) => s.fetchSupplierProduct);
  const clearSupplierProducts = useSupplierProductsStore((s) => s.clearSupplierProducts);

  useEffect(() => {
    if (id) {
      fetchSupplierProduct(id);
    }
    return () => {
      clearSupplierProducts();
    };
  }, [id]);

  return { selected, isLoading, error };
};
