import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { productService } from '../services/productServices';
import type { Product, UpdateProductDTO } from '../types/productModel';

interface ProductDetailState {
  product: Product | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  fetchProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, payload: UpdateProductDTO) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearProduct: () => void;
}

export const useProductDetailStore = create<ProductDetailState>()(
  devtools(
    immer((set) => ({
      product: null,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      error: null,

      fetchProduct: async (id) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        try {
          const product = await productService.getProduct(id);
          set((state) => {
            state.product = product;
            state.isLoading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Failed to load product';
            state.isLoading = false;
          });
        }
      },

      updateProduct: async (id, payload) => {
        set((state) => {
          state.isSaving = true;
          state.error = null;
        });
        try {
          const updated = await productService.updateProduct(id, payload);
          set((state) => {
            state.product = updated;
            state.isSaving = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Failed to update product';
            state.isSaving = false;
          });
          throw error;
        }
      },

      deleteProduct: async (id) => {
        set((state) => {
          state.isDeleting = true;
          state.error = null;
        });
        try {
          await productService.deleteProduct(id);
          set((state) => {
            state.product = null;
            state.isDeleting = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Failed to delete product';
            state.isDeleting = false;
          });
          throw error;
        }
      },

      clearProduct: () => {
        set((state) => {
          state.product = null;
          state.error = null;
        });
      },
    })),
    { name: 'product-detail-store' },
  ),
);

export default useProductDetailStore;
