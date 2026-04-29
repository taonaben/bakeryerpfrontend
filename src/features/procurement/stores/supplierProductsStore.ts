import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { supplierProductsService } from '../services/supplier_products_service';
import type { SupplierProductsState } from '../types/store';
import type {
  SupplierProductQueryParams,
  CreateSupplierProductDTO,
  UpdateSupplierProductDTO,
} from '../types/models';

export const useSupplierProductsStore = create<SupplierProductsState>()(
  devtools(
    immer((set) => ({
      items: [],
      queryParams: {},
      selected: null,
      isLoading: false,
      isSaving: false,
      isDeactivating: false,
      error: null,

      // ─── List ──────────────────────────────────────────────────────────────

      fetchSupplierProducts: async (params: SupplierProductQueryParams) => {
        set((draft) => {
          draft.isLoading = true;
          draft.error = null;
          draft.queryParams = params;
        });

        try {
          const items = await supplierProductsService.fetchSupplierProducts(params);
          set((draft) => {
            draft.items = items;
            draft.isLoading = false;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch supplier products';
            draft.isLoading = false;
          });
        }
      },

      // ─── Single ────────────────────────────────────────────────────────────

      fetchSupplierProduct: async (id: string) => {
        set((draft) => {
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const item = await supplierProductsService.fetchSupplierProduct(id);
          set((draft) => {
            draft.selected = item;
            draft.isLoading = false;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch supplier product';
            draft.isLoading = false;
          });
        }
      },

      // ─── Create ────────────────────────────────────────────────────────────

      createSupplierProduct: async (productId: string, dto: CreateSupplierProductDTO) => {
        set((draft) => {
          draft.isSaving = true;
          draft.error = null;
        });

        try {
          const created = await supplierProductsService.createSupplierProduct(productId, dto);
          set((draft) => {
            draft.items.push(created);
            draft.isSaving = false;
          });
          return created;
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to create supplier product';
            draft.isSaving = false;
          });
          throw error;
        }
      },

      // ─── Update ────────────────────────────────────────────────────────────

      updateSupplierProduct: async (id: string, dto: UpdateSupplierProductDTO) => {
        set((draft) => {
          draft.isSaving = true;
          draft.error = null;
        });

        try {
          const updated = await supplierProductsService.updateSupplierProduct(id, dto);
          set((draft) => {
            const idx = draft.items.findIndex((i) => i.id === id);
            if (idx !== -1) draft.items[idx] = updated;
            if (draft.selected?.id === id) draft.selected = updated;
            draft.isSaving = false;
          });
          return updated;
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to update supplier product';
            draft.isSaving = false;
          });
          throw error;
        }
      },

      // ─── Deactivate ────────────────────────────────────────────────────────

      deactivateSupplierProduct: async (id: string) => {
        set((draft) => {
          draft.isDeactivating = true;
          draft.error = null;
        });

        try {
          const deactivated = await supplierProductsService.deactivateSupplierProduct(id);
          set((draft) => {
            const idx = draft.items.findIndex((i) => i.id === id);
            if (idx !== -1) draft.items[idx] = deactivated;
            if (draft.selected?.id === id) draft.selected = deactivated;
            draft.isDeactivating = false;
          });
          return deactivated;
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to deactivate supplier product';
            draft.isDeactivating = false;
          });
          throw error;
        }
      },

      // ─── Clear ─────────────────────────────────────────────────────────────

      clearSupplierProducts: () => {
        set((draft) => {
          draft.items = [];
          draft.selected = null;
          draft.queryParams = {};
          draft.error = null;
        });
      },
    })),
    { name: 'supplier-products-store' },
  ),
);

export default useSupplierProductsStore;
