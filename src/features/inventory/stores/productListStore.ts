import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { productService } from '../services/productServices';
import type { Product } from '../types/productModel';

interface ProductListState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  count: number;
  fetchProducts: (params: Record<string, any>) => Promise<void>;
}

export const useProductListStore = create<ProductListState>()(
  devtools(
    immer((set) => ({
      products: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      count: 0,

      fetchProducts: async (params) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const result = await productService.fetchProducts(params);
          set((state) => {
            state.products = result.data;
            state.count = result.count;
            state.currentPage = result.currentPage;
            state.totalPages = result.totalPages;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Failed to fetch products';
            state.isLoading = false;
          });
        }
      },
    })),
    { name: 'product-list-store' },
  ),
);

export default useProductListStore;
