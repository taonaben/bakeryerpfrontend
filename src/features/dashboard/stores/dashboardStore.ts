import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { dashboardService } from '../services/dashboardService';
import type {
  DashboardEndpointCacheEntry,
  DashboardLayoutItem,
  DashboardWidgetRegistry,
} from '../types/dashboardTypes';

interface DashboardState {
  registry: DashboardWidgetRegistry;
  layout: DashboardLayoutItem[];
  endpointData: Record<string, DashboardEndpointCacheEntry>;
  endpointLoading: Record<string, boolean>;
  endpointErrors: Record<string, string | null>;
  isLoading: boolean;
  isSavingLayout: boolean;
  error: string | null;
  lastLoadedAt: number | null;
  loadDashboard: (force?: boolean) => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshWidget: (widgetKey: string) => Promise<void>;
  saveLayout: (layout: DashboardLayoutItem[]) => Promise<DashboardLayoutItem[]>;
  addWidget: (widgetKey: string) => Promise<void>;
  removeWidget: (widgetKey: string) => Promise<void>;
  resizeWidget: (widgetKey: string) => Promise<void>;
  reorderWidgets: (widgetKeys: string[]) => Promise<void>;
  clearError: () => void;
}

const hasRegistry = (registry: DashboardWidgetRegistry): boolean =>
  Object.keys(registry).length > 0;

export const useDashboardStore = create<DashboardState>()(
  devtools(
    immer((set, get) => ({
      registry: {},
      layout: [],
      endpointData: {},
      endpointLoading: {},
      endpointErrors: {},
      isLoading: false,
      isSavingLayout: false,
      error: null,
      lastLoadedAt: null,

      loadDashboard: async (force = false) => {
        const state = get();
        if (!force && state.lastLoadedAt && hasRegistry(state.registry)) return;

        set((draft) => {
          draft.isLoading = true;
          draft.error = null;
        });

        try {
          const [registry, layout] = await Promise.all([
            dashboardService.fetchRegistry(),
            dashboardService.fetchLayout(),
          ]);

          set((draft) => {
            draft.registry = registry;
            draft.layout = dashboardService.normalizeLayout(layout);
            draft.lastLoadedAt = Date.now();
            draft.isLoading = false;
          });

          await get().refreshAll();
        } catch (error) {
          const message = dashboardService.getErrorMessage(
            error,
            'Failed to load dashboard',
          );
          set((draft) => {
            draft.error = message;
            draft.isLoading = false;
          });
        }
      },

      refreshAll: async () => {
        const { registry, layout } = get();
        const groups = dashboardService.groupEndpoints(registry, layout);
        if (groups.length === 0) return;

        set((draft) => {
          groups.forEach(({ endpoint }) => {
            draft.endpointLoading[endpoint] = true;
            draft.endpointErrors[endpoint] = null;
          });
        });

        await Promise.all(
          groups.map(async ({ endpoint }) => {
            try {
              const data = await dashboardService.fetchEndpoint(endpoint);
              set((draft) => {
                draft.endpointData[endpoint] = {
                  data,
                  lastFetched: Date.now(),
                };
                draft.endpointLoading[endpoint] = false;
                draft.endpointErrors[endpoint] = null;
              });
            } catch (error) {
              const message = dashboardService.getErrorMessage(
                error,
                'Failed to load widget data',
              );
              set((draft) => {
                draft.endpointLoading[endpoint] = false;
                draft.endpointErrors[endpoint] = message;
              });
            }
          }),
        );
      },

      refreshWidget: async (widgetKey: string) => {
        const { registry, layout } = get();
        const definition = registry[widgetKey];
        if (!definition?.endpoint) return;
        const existsInLayout = layout.some(
          (item) => item.widget_key === widgetKey && item.is_visible,
        );
        if (!existsInLayout) return;

        set((draft) => {
          draft.endpointLoading[definition.endpoint] = true;
          draft.endpointErrors[definition.endpoint] = null;
        });

        try {
          const data = await dashboardService.fetchEndpoint(definition.endpoint);
          set((draft) => {
            draft.endpointData[definition.endpoint] = {
              data,
              lastFetched: Date.now(),
            };
            draft.endpointLoading[definition.endpoint] = false;
            draft.endpointErrors[definition.endpoint] = null;
          });
        } catch (error) {
          const message = dashboardService.getErrorMessage(
            error,
            'Failed to refresh widget',
          );
          set((draft) => {
            draft.endpointLoading[definition.endpoint] = false;
            draft.endpointErrors[definition.endpoint] = message;
          });
        }
      },

      saveLayout: async (layout: DashboardLayoutItem[]) => {
        set((draft) => {
          draft.isSavingLayout = true;
          draft.error = null;
        });

        try {
          const saved = await dashboardService.saveLayout(layout);
          const normalized = dashboardService.normalizeLayout(saved);
          set((draft) => {
            draft.layout = normalized;
            draft.isSavingLayout = false;
          });
          return normalized;
        } catch (error) {
          const message = dashboardService.getErrorMessage(
            error,
            'Failed to save dashboard layout',
          );
          set((draft) => {
            draft.error = message;
            draft.isSavingLayout = false;
          });
          throw error;
        }
      },

      addWidget: async (widgetKey: string) => {
        const state = get();
        const definition = state.registry[widgetKey];
        if (!definition) return;
        if (state.layout.some((item) => item.widget_key === widgetKey)) return;

        const previousLayout = state.layout;
        const nextLayout = dashboardService.normalizeLayout([
          ...previousLayout,
          {
            widget_key: widgetKey,
            position: dashboardService.getNextPosition(previousLayout),
            is_visible: true,
            width: dashboardService.normalizeWidth(definition.width),
          },
        ]);

        set((draft) => {
          draft.layout = nextLayout;
        });

        try {
          await get().saveLayout(nextLayout);
          await get().refreshWidget(widgetKey);
        } catch (error) {
          set((draft) => {
            draft.layout = previousLayout;
          });
        }
      },

      removeWidget: async (widgetKey: string) => {
        const previousLayout = get().layout;
        const nextLayout = dashboardService.reindexLayout(
          previousLayout.filter((item) => item.widget_key !== widgetKey),
        );

        set((draft) => {
          draft.layout = nextLayout;
        });

        try {
          await get().saveLayout(nextLayout);
        } catch (error) {
          set((draft) => {
            draft.layout = previousLayout;
          });
        }
      },

      resizeWidget: async (widgetKey: string) => {
        const previousLayout = get().layout;
        const nextLayout = previousLayout.map((item) =>
          item.widget_key === widgetKey
            ? { ...item, width: item.width === 'full' ? 'half' : 'full' }
            : item,
        );

        set((draft) => {
          draft.layout = dashboardService.normalizeLayout(nextLayout);
        });

        try {
          await get().saveLayout(nextLayout);
        } catch (error) {
          set((draft) => {
            draft.layout = previousLayout;
          });
        }
      },

      reorderWidgets: async (widgetKeys: string[]) => {
        const previousLayout = get().layout;
        const order = new Map(widgetKeys.map((widgetKey, index) => [widgetKey, index]));
        const orderedItems = [...previousLayout].sort((a, b) => {
          const aOrder = order.get(a.widget_key);
          const bOrder = order.get(b.widget_key);

          if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
          if (aOrder !== undefined) return -1;
          if (bOrder !== undefined) return 1;
          return a.position - b.position;
        });
        const nextLayout = orderedItems.map((item, index) => ({
          ...item,
          position: index,
        }));

        set((draft) => {
          draft.layout = nextLayout;
        });

        try {
          await get().saveLayout(nextLayout);
        } catch (error) {
          set((draft) => {
            draft.layout = previousLayout;
          });
        }
      },

      clearError: () => {
        set((draft) => {
          draft.error = null;
        });
      },
    })),
    { name: 'dashboard-store' },
  ),
);

export default useDashboardStore;
