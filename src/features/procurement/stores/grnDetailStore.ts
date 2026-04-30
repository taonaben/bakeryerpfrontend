import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { grnService } from '../services/grn_services';
import type { GoodsReceiptDetailState } from '../types/store';
import type { UpdateGoodsReceiptDTO } from '../types/grn_models';

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

export const useGoodsReceiptDetailStore = create<GoodsReceiptDetailState>()(
  devtools(
    immer((set, get) => ({
      goodsReceipt: null,
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      isConfirming: false,
      isRejecting: false,
      error: null,
      updateError: null,
      cache: createCacheMeta(),

      fetchReceipt: async (id: string) => {
        const state = get();
        if (
          !isCacheStale(state.cache.lastFetched, state.cache.ttl) &&
          state.goodsReceipt?.id === id
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
          const receipt = await grnService.fetchReceipt(id);
          set((draft) => {
            draft.goodsReceipt = receipt;
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
            draft.error = error.message || 'Failed to fetch goods receipt';
            draft.isLoading = false;
            draft.cache.isFetching = false;
          });
        }
      },

      updateReceipt: async (id: string, data: UpdateGoodsReceiptDTO) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await grnService.updateReceipt(id, data);
          set((draft) => {
            draft.goodsReceipt = updated;
            draft.isUpdating = false;
            draft.updateError = null;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to update goods receipt';
            draft.isUpdating = false;
          });
          throw error;
        }
      },

      deleteReceipt: async (id: string) => {
        set((draft) => {
          draft.isDeleting = true;
          draft.error = null;
        });

        try {
          await grnService.deleteReceipt(id);
          set((draft) => {
            draft.isDeleting = false;
            draft.goodsReceipt = null;
            draft.cache.lastFetched = null;
            draft.error = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to delete goods receipt';
            draft.isDeleting = false;
          });
          throw error;
        }
      },

      clearReceipt: () => {
        set((draft) => {
          draft.goodsReceipt = null;
          draft.error = null;
          draft.updateError = null;
          draft.cache.lastFetched = null;
        });
      },

      confirmReceipt: async (id: string) => {
        set((draft) => {
          draft.isConfirming = true;
          draft.error = null;
        });

        try {
          const updated = await grnService.confirmReceipt(id);
          set((draft) => {
            draft.goodsReceipt = updated;
            draft.isConfirming = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to confirm goods receipt';
            draft.isConfirming = false;
          });
          throw error;
        }
      },

      rejectReceipt: async (id: string, reason: string) => {
        set((draft) => {
          draft.isRejecting = true;
          draft.error = null;
        });

        try {
          const updated = await grnService.rejectReceipt(id, reason);
          set((draft) => {
            draft.goodsReceipt = updated;
            draft.isRejecting = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to reject goods receipt';
            draft.isRejecting = false;
          });
          throw error;
        }
      },

      setError: (error: string | null) => {
        set((draft) => {
          draft.error = error;
        });
      },
    })),
    { name: 'goods-receipt-detail-store' },
  ),
);

export default useGoodsReceiptDetailStore;
