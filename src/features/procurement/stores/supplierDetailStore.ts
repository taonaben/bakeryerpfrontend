/**
 * Supplier Detail Store
 * Zustand store with caching, devtools, and immer middleware
 * Manages state for supplier detail page
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { supplierService } from '../services/suppliers_services';
import type { SupplierDetailState } from '../types/store';
import type { UpdateSupplierDTO, AddProductToSupplierDTO, CreateContactDTO, UpdateContactDTO, CreateDocumentDTO, UpdateDocumentDTO } from '../types/models';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const isCacheStale = (lastFetched: number | null, ttl: number): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > ttl;
};

const createCacheMeta = (ttl: number = CACHE_TTL_MS) => ({
  lastFetched: null as number | null,
  ttl,
  isFetching: false,
});

export const useSupplierDetailStore = create<SupplierDetailState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      supplier: null,
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      isPuttingOnHold: false,
      isReleasingHold: false,
      isReactivating: false,
      isAddingProduct: false,
      isContactLoading: false,
      isDocumentLoading: false,
      error: null,
      updateError: null,
      cache: createCacheMeta(),

      // ─── Fetch ───────────────────────────────
      fetchSupplier: async (id: string) => {
        const state = get();

        // Cache guard: skip if fresh and same supplier
        if (
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.supplier?.id === id
        ) {
          return;
        }

        // Prevent duplicate in-flight fetches
        if (state.cache.isFetching) return;

        set((draft) => {
          draft.cache.isFetching = true;
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const supplier = await supplierService.fetchSupplier(id);
          set((draft) => {
            draft.supplier = supplier;
            draft.cache = {
              lastFetched: Date.now(),
              ttl: CACHE_TTL_MS,
              isFetching: false,
            };
            draft.isLoading = false;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch supplier';
            draft.isLoading = false;
            draft.cache.isFetching = false;
          });
        }
      },

      // ─── Full Update (PUT) ───────────────────
      updateSupplier: async (id: string, data: UpdateSupplierDTO) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await supplierService.updateSupplier(id, data);
          set((draft) => {
            draft.supplier = updated;
            draft.isUpdating = false;
            draft.updateError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to update supplier';
            draft.isUpdating = false;
          });
          throw error;
        }
      },

      // ─── Partial Update (PATCH) ──────────────
      patchSupplier: async (id: string, data: Partial<UpdateSupplierDTO>) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await supplierService.patchSupplier(id, data);
          set((draft) => {
            draft.supplier = updated;
            draft.isUpdating = false;
            draft.updateError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to update supplier';
            draft.isUpdating = false;
          });
          throw error;
        }
      },

      // ─── Delete ──────────────────────────────
      deleteSupplier: async (id: string) => {
        set((draft) => {
          draft.isDeleting = true;
          draft.error = null;
        });

        try {
          await supplierService.deleteSupplier(id);
          set((draft) => {
            draft.isDeleting = false;
            draft.supplier = null;
            draft.cache.lastFetched = null;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to delete supplier';
            draft.isDeleting = false;
          });
          throw error;
        }
      },

      // ─── Helpers ─────────────────────────────
      clearSupplier: () => {
        set((draft) => {
          draft.supplier = null;
          draft.error = null;
          draft.updateError = null;
          draft.cache.lastFetched = null;
        });
      },

      setError: (error: string | null) => {
        set((draft) => {
          draft.error = error;
        });
      },
      // ─── Status Actions ───────────────────────

      putOnHold: async (id: string, reason: string) => {
        set((draft) => { draft.isPuttingOnHold = true; draft.error = null; });
        try {
          const updated = await supplierService.putOnHold(id, reason);
          set((draft) => {
            draft.supplier = updated;
            draft.isPuttingOnHold = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to put supplier on hold'; draft.isPuttingOnHold = false; });
          throw error;
        }
      },

      releaseHold: async (id: string) => {
        set((draft) => { draft.isReleasingHold = true; draft.error = null; });
        try {
          const updated = await supplierService.releaseHold(id);
          set((draft) => {
            draft.supplier = updated;
            draft.isReleasingHold = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to release hold'; draft.isReleasingHold = false; });
          throw error;
        }
      },

      reactivate: async (id: string) => {
        set((draft) => { draft.isReactivating = true; draft.error = null; });
        try {
          const updated = await supplierService.reactivate(id);
          set((draft) => {
            draft.supplier = updated;
            draft.isReactivating = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to reactivate supplier'; draft.isReactivating = false; });
          throw error;
        }
      },

      addProduct: async (id: string, dto: AddProductToSupplierDTO) => {
        set((draft) => { draft.isAddingProduct = true; draft.error = null; });
        try {
          await supplierService.addProduct(id, dto);
          set((draft) => { draft.isAddingProduct = false; });
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to add product'; draft.isAddingProduct = false; });
          throw error;
        }
      },

      // ─── Contacts ──────────────────────────────

      createContact: async (supplierId: string, dto: CreateContactDTO) => {
        set((draft) => { draft.isContactLoading = true; draft.error = null; });
        try {
          await supplierService.createContact(supplierId, dto);
          set((draft) => { draft.isContactLoading = false; draft.cache.lastFetched = null; });
          await get().fetchSupplier(supplierId);
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to create contact'; draft.isContactLoading = false; });
          throw error;
        }
      },

      updateContact: async (supplierId: string, contactId: string, dto: UpdateContactDTO) => {
        set((draft) => { draft.isContactLoading = true; draft.error = null; });
        try {
          await supplierService.updateContact(supplierId, contactId, dto);
          set((draft) => { draft.isContactLoading = false; draft.cache.lastFetched = null; });
          await get().fetchSupplier(supplierId);
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to update contact'; draft.isContactLoading = false; });
          throw error;
        }
      },

      patchContact: async (supplierId: string, contactId: string, dto: Partial<UpdateContactDTO>) => {
        set((draft) => { draft.isContactLoading = true; draft.error = null; });
        try {
          await supplierService.patchContact(supplierId, contactId, dto);
          set((draft) => { draft.isContactLoading = false; draft.cache.lastFetched = null; });
          await get().fetchSupplier(supplierId);
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to update contact'; draft.isContactLoading = false; });
          throw error;
        }
      },

      deleteContact: async (supplierId: string, contactId: string) => {
        set((draft) => { draft.isContactLoading = true; draft.error = null; });
        try {
          await supplierService.deleteContact(supplierId, contactId);
          set((draft) => { draft.isContactLoading = false; draft.cache.lastFetched = null; });
          await get().fetchSupplier(supplierId);
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to delete contact'; draft.isContactLoading = false; });
          throw error;
        }
      },

      // ─── Documents ─────────────────────────────

      createDocument: async (supplierId: string, dto: CreateDocumentDTO) => {
        set((draft) => { draft.isDocumentLoading = true; draft.error = null; });
        try {
          await supplierService.createDocument(supplierId, dto);
          set((draft) => { draft.isDocumentLoading = false; draft.cache.lastFetched = null; });
          await get().fetchSupplier(supplierId);
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to create document'; draft.isDocumentLoading = false; });
          throw error;
        }
      },

      updateDocument: async (supplierId: string, documentId: string, dto: UpdateDocumentDTO) => {
        set((draft) => { draft.isDocumentLoading = true; draft.error = null; });
        try {
          await supplierService.updateDocument(supplierId, documentId, dto);
          set((draft) => { draft.isDocumentLoading = false; draft.cache.lastFetched = null; });
          await get().fetchSupplier(supplierId);
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to update document'; draft.isDocumentLoading = false; });
          throw error;
        }
      },

      patchDocument: async (supplierId: string, documentId: string, dto: Partial<UpdateDocumentDTO>) => {
        set((draft) => { draft.isDocumentLoading = true; draft.error = null; });
        try {
          await supplierService.patchDocument(supplierId, documentId, dto);
          set((draft) => { draft.isDocumentLoading = false; draft.cache.lastFetched = null; });
          await get().fetchSupplier(supplierId);
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to update document'; draft.isDocumentLoading = false; });
          throw error;
        }
      },

      deleteDocument: async (supplierId: string, documentId: string) => {
        set((draft) => { draft.isDocumentLoading = true; draft.error = null; });
        try {
          await supplierService.deleteDocument(supplierId, documentId);
          set((draft) => { draft.isDocumentLoading = false; draft.cache.lastFetched = null; });
          await get().fetchSupplier(supplierId);
        } catch (error: any) {
          set((draft) => { draft.error = error.message || 'Failed to delete document'; draft.isDocumentLoading = false; });
          throw error;
        }
      },    })),
    { name: 'SupplierDetailStore' },
  ),
);
