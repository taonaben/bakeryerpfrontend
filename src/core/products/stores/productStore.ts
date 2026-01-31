import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { productService } from '../services/productServices';
import type { product, productDTO } from '../types/models';
import type { ProductStoreState, CacheMetadata } from '../types/store';

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const isCacheStale = (lastFetched: number | null): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL_MS;
};

const createCacheMeta = (): CacheMetadata => ({
  lastFetched: null,
  isStale: true,
  isFetching: false,
});

interface ProductStore extends ProductStoreState {
  // UI Actions
  setSearchTerm: (term: string) => void;

  // Data fetching with cache guards
  fetchProducts: (force?: boolean) => Promise<void>;
  fetchProduct: (productId: string, force?: boolean) => Promise<product | null>;

  // Mutations
  createProduct: (productData: productDTO) => Promise<product>;

  // Cache invalidation
  invalidateProducts: () => void;
  invalidateProduct: (productId: string) => void;
  invalidateAll: () => void;
}

export const useProductStore = create<ProductStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      products: [],
      productMap: {},
      searchTerm: '',
      productsCache: createCacheMeta(),
      productCache: {},
      loading: false,
      error: null,

      // UI Actions
      setSearchTerm: (term) => set({ searchTerm: term }),

      // Data Fetching with Cache Guards
      fetchProducts: async (force = false) => {
        const state = get();

        if (!force && !isCacheStale(state.productsCache.lastFetched) && state.products.length > 0) {
          return;
        }

        if (state.productsCache.isFetching) return;

        set((draft) => {
          draft.productsCache.isFetching = true;
          draft.loading = true;
          draft.error = null;
        });

        try {
          const products = await productService.getProducts();
          set((draft) => {
            draft.products = products;
            draft.productMap = products.reduce<Record<string, product>>((acc, item) => {
              acc[item.id] = item;
              return acc;
            }, {});
            draft.productsCache = {
              lastFetched: Date.now(),
              isStale: false,
              isFetching: false,
            };
            draft.loading = false;
          });
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch products';
            draft.productsCache.isFetching = false;
            draft.loading = false;
          });
        }
      },

      fetchProduct: async (productId, force = false) => {
        const state = get();
        const cached = state.productMap[productId];
        const cacheMeta = state.productCache[productId];

        if (!force && cached && cacheMeta && !isCacheStale(cacheMeta.lastFetched)) {
          return cached;
        }

        if (cacheMeta?.isFetching) return cached || null;

        set((draft) => {
          draft.productCache[productId] = {
            ...(draft.productCache[productId] || createCacheMeta()),
            isFetching: true,
          };
          draft.loading = true;
          draft.error = null;
        });

        try {
          const productItem = await productService.getProduct(productId);
          set((draft) => {
            draft.productMap[productId] = productItem;
            draft.productCache[productId] = {
              lastFetched: Date.now(),
              isStale: false,
              isFetching: false,
            };
            draft.loading = false;
          });
          return productItem;
        } catch (error: any) {
          set((draft) => {
            draft.error = error.message || 'Failed to fetch product';
            draft.productCache[productId] = {
              ...(draft.productCache[productId] || createCacheMeta()),
              isFetching: false,
            };
            draft.loading = false;
          });
          return null;
        }
      },

      // Mutations
      createProduct: async (productData) => {
        try {
          const created = await productService.createProduct(productData);
          set((draft) => {
            draft.productMap[created.id] = created;
            draft.products = [created, ...draft.products.filter((p) => p.id !== created.id)];
          });
          get().invalidateProducts();
          return created;
        } catch (error: any) {
          set({ error: error.message || 'Failed to create product' });
          throw error;
        }
      },

      // Cache Invalidation
      invalidateProducts: () =>
        set((draft) => {
          draft.productsCache.isStale = true;
          draft.productsCache.lastFetched = null;
        }),

      invalidateProduct: (productId) =>
        set((draft) => {
          if (!draft.productCache[productId]) {
            draft.productCache[productId] = createCacheMeta();
          }
          draft.productCache[productId].isStale = true;
          draft.productCache[productId].lastFetched = null;
        }),

      invalidateAll: () => {
        get().invalidateProducts();
        Object.keys(get().productCache).forEach((id) => get().invalidateProduct(id));
      },
    }))
  )
);

// Selectors
export const selectFilteredProducts = (state: ProductStore) => {
  const term = state.searchTerm.toLowerCase();
  if (!term) return state.products;
  return state.products.filter((p) =>
    p.name.toLowerCase().includes(term) ||
    p.sku.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term)
  );
};
