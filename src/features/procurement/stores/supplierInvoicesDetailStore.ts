import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { supplierInvoiceService } from '../services/supplier_invoices_services';
import type { SupplierInvoiceDetailState } from '../types/store';
import type { UpdateSupplierInvoiceDTO } from '../types/supplier_invoices_model';

const CACHE_TTL_MS = 5 * 60 * 1000;

const isCacheStale = (lastFetched: number | null, ttl: number): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > ttl;
};

const createCacheMeta = (ttl: number = CACHE_TTL_MS) => ({
  lastFetched: null as number | null,
  ttl,
  isFetching: false,
});

export const useSupplierInvoicesDetailStore = create<SupplierInvoiceDetailState>()(
  devtools(
    immer((set, get) => ({
      supplierInvoice: null,
      matchResult: null,
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      isApproving: false,
      isRejecting: false,
      isMarkingPaid: false,
      isMatching: false,
      error: null,
      updateError: null,
      matchError: null,
      cache: createCacheMeta(),

      fetchInvoice: async (id: string) => {
        const state = get();
        if (
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.supplierInvoice?.id === id
        ) {
          return;
        }
        if (state.cache.isFetching) return;

        set((draft) => {
          draft.cache.isFetching = true;
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const invoice = await supplierInvoiceService.fetchInvoice(id);
          set((draft) => {
            draft.supplierInvoice = invoice;
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
            draft.error = error.message || 'Failed to fetch supplier invoice';
            draft.isLoading = false;
            draft.cache.isFetching = false;
          });
        }
      },

      updateInvoice: async (id: string, data: UpdateSupplierInvoiceDTO) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await supplierInvoiceService.updateInvoice(id, data);
          set((draft) => {
            draft.supplierInvoice = updated;
            draft.isUpdating = false;
            draft.updateError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to update supplier invoice';
            draft.isUpdating = false;
          });
          throw error;
        }
      },

      patchInvoice: async (id: string, data: Partial<UpdateSupplierInvoiceDTO>) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await supplierInvoiceService.patchInvoice(id, data);
          set((draft) => {
            draft.supplierInvoice = updated;
            draft.isUpdating = false;
            draft.updateError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to patch supplier invoice';
            draft.isUpdating = false;
          });
          throw error;
        }
      },

      deleteInvoice: async (id: string) => {
        set((draft) => {
          draft.isDeleting = true;
          draft.error = null;
        });

        try {
          await supplierInvoiceService.deleteInvoice(id);
          set((draft) => {
            draft.isDeleting = false;
            draft.supplierInvoice = null;
            draft.matchResult = null;
            draft.cache.lastFetched = null;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to delete supplier invoice';
            draft.isDeleting = false;
          });
          throw error;
        }
      },

      approveInvoice: async (id: string) => {
        set((draft) => {
          draft.isApproving = true;
          draft.error = null;
        });

        try {
          const updated = await supplierInvoiceService.approveInvoice(id);
          set((draft) => {
            draft.supplierInvoice = updated;
            draft.isApproving = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to approve supplier invoice';
            draft.isApproving = false;
          });
          throw error;
        }
      },

      rejectInvoice: async (id: string, reason: string) => {
        set((draft) => {
          draft.isRejecting = true;
          draft.error = null;
        });

        try {
          const updated = await supplierInvoiceService.rejectInvoice(id, reason);
          set((draft) => {
            draft.supplierInvoice = updated;
            draft.isRejecting = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to reject supplier invoice';
            draft.isRejecting = false;
          });
          throw error;
        }
      },

      markInvoicePaid: async (id: string, paymentReference: string) => {
        set((draft) => {
          draft.isMarkingPaid = true;
          draft.error = null;
        });

        try {
          const updated = await supplierInvoiceService.markInvoicePaid(id, paymentReference);
          set((draft) => {
            draft.supplierInvoice = updated;
            draft.isMarkingPaid = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to mark supplier invoice as paid';
            draft.isMarkingPaid = false;
          });
          throw error;
        }
      },

      fetchMatch: async (id: string, force: boolean = false) => {
        const state = get();
        if (!force && state.matchResult && state.supplierInvoice?.id === id) return;

        set((draft) => {
          draft.isMatching = true;
          draft.matchError = null;
        });

        try {
          const matchResult = await supplierInvoiceService.fetchInvoiceMatch(id);
          set((draft) => {
            draft.matchResult = matchResult;
            draft.isMatching = false;
            draft.matchError = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.matchError = error.message || 'Failed to fetch supplier invoice match data';
            draft.isMatching = false;
          });
          throw error;
        }
      },

      clearInvoice: () => {
        set((draft) => {
          draft.supplierInvoice = null;
          draft.matchResult = null;
          draft.error = null;
          draft.updateError = null;
          draft.matchError = null;
          draft.cache.lastFetched = null;
        });
      },

      clearMatch: () => {
        set((draft) => {
          draft.matchResult = null;
          draft.matchError = null;
        });
      },

      setError: (error: string | null) => {
        set((draft) => {
          draft.error = error;
        });
      },
    })),
    { name: 'supplier-invoices-detail-store' },
  ),
);

export default useSupplierInvoicesDetailStore;
