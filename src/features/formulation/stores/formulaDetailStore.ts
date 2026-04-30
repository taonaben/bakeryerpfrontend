import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { formulationService } from '../services/formulationService';
import type { Formula, PutFormulaOnHoldDTO, UpdateFormulaDTO } from '../types/models';

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

interface FormulaDetailState {
  formula: Formula | null;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isActivating: boolean;
  isArchiving: boolean;
  isDeactivating: boolean;
  isPuttingOnHold: boolean;
  isReleasingHold: boolean;
  error: string | null;
  updateError: string | null;
  cache: {
    lastFetched: number | null;
    ttl: number;
    isFetching: boolean;
  };
  fetchFormula: (id: string) => Promise<void>;
  updateFormula: (id: string, data: UpdateFormulaDTO) => Promise<void>;
  deleteFormula: (id: string) => Promise<void>;
  activateFormula: (id: string) => Promise<void>;
  archiveFormula: (id: string) => Promise<void>;
  deactivateFormula: (id: string) => Promise<void>;
  putFormulaOnHold: (id: string, data: PutFormulaOnHoldDTO) => Promise<void>;
  releaseFormulaHold: (id: string) => Promise<void>;
  clearFormula: () => void;
  setError: (error: string | null) => void;
}

export const useFormulaDetailStore = create<FormulaDetailState>()(
  devtools(
    immer((set, get) => ({
      formula: null,
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      isActivating: false,
      isArchiving: false,
      isDeactivating: false,
      isPuttingOnHold: false,
      isReleasingHold: false,
      error: null,
      updateError: null,
      cache: createCacheMeta(),

      fetchFormula: async (id: string) => {
        const state = get();
        if (!isCacheStale(state.cache.lastFetched, state.cache.ttl) && state.formula?.id === id) {
          return;
        }
        if (state.cache.isFetching) return;

        set((draft) => {
          draft.cache.isFetching = true;
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const formula = await formulationService.fetchFormula(id);
          set((draft) => {
            draft.formula = formula;
            draft.isLoading = false;
            draft.error = null;
            draft.cache = {
              lastFetched: Date.now(),
              ttl: CACHE_TTL_MS,
              isFetching: false,
            };
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch formula';
            draft.isLoading = false;
            draft.cache.isFetching = false;
          });
        }
      },

      updateFormula: async (id: string, data: UpdateFormulaDTO) => {
        set((draft) => {
          draft.isUpdating = true;
          draft.updateError = null;
        });

        try {
          const updated = await formulationService.patchFormula(id, data);
          set((draft) => {
            draft.formula = updated;
            draft.isUpdating = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.updateError = error.message || 'Failed to update formula';
            draft.isUpdating = false;
          });
          throw error;
        }
      },

      deleteFormula: async (id: string) => {
        set((draft) => {
          draft.isDeleting = true;
          draft.error = null;
        });

        try {
          await formulationService.deleteFormula(id);
          set((draft) => {
            draft.formula = null;
            draft.isDeleting = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to delete formula';
            draft.isDeleting = false;
          });
          throw error;
        }
      },

      activateFormula: async (id: string) => {
        set((draft) => {
          draft.isActivating = true;
          draft.error = null;
        });
        try {
          const updated = await formulationService.activateFormula(id);
          set((draft) => {
            draft.formula = updated;
            draft.isActivating = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to activate formula';
            draft.isActivating = false;
          });
          throw error;
        }
      },

      archiveFormula: async (id: string) => {
        set((draft) => {
          draft.isArchiving = true;
          draft.error = null;
        });
        try {
          const updated = await formulationService.archiveFormula(id);
          set((draft) => {
            draft.formula = updated;
            draft.isArchiving = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to archive formula';
            draft.isArchiving = false;
          });
          throw error;
        }
      },

      deactivateFormula: async (id: string) => {
        set((draft) => {
          draft.isDeactivating = true;
          draft.error = null;
        });
        try {
          const updated = await formulationService.deactivateFormula(id);
          set((draft) => {
            draft.formula = updated;
            draft.isDeactivating = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to deactivate formula';
            draft.isDeactivating = false;
          });
          throw error;
        }
      },

      putFormulaOnHold: async (id: string, data: PutFormulaOnHoldDTO) => {
        set((draft) => {
          draft.isPuttingOnHold = true;
          draft.error = null;
        });
        try {
          const updated = await formulationService.putFormulaOnHold(id, data);
          set((draft) => {
            draft.formula = updated;
            draft.isPuttingOnHold = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to put formula on hold';
            draft.isPuttingOnHold = false;
          });
          throw error;
        }
      },

      releaseFormulaHold: async (id: string) => {
        set((draft) => {
          draft.isReleasingHold = true;
          draft.error = null;
        });
        try {
          const updated = await formulationService.releaseFormulaHold(id);
          set((draft) => {
            draft.formula = updated;
            draft.isReleasingHold = false;
            draft.cache.lastFetched = null;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to release formula hold';
            draft.isReleasingHold = false;
          });
          throw error;
        }
      },

      clearFormula: () => {
        set((draft) => {
          draft.formula = null;
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
    })),
    { name: 'formula-detail-store' },
  ),
);

export default useFormulaDetailStore;
