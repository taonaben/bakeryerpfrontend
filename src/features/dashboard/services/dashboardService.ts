import { dashboardClient } from '../api/dashboardClient';
import type {
  DashboardEndpointGroup,
  DashboardLayoutItem,
  DashboardWidgetRegistry,
  DashboardWidgetWidth,
} from '../types/dashboardTypes';

const PATH_PART_PATTERN = /([^[.\]]+)|\[(\d+)\]/g;

const toPosition = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return fallback;
};

export const dashboardService = {
  async fetchRegistry(): Promise<DashboardWidgetRegistry> {
    return dashboardClient.getWidgets();
  },

  async fetchLayout(): Promise<DashboardLayoutItem[]> {
    return dashboardClient.getLayout();
  },

  async saveLayout(layout: DashboardLayoutItem[]): Promise<DashboardLayoutItem[]> {
    return dashboardClient.saveLayout(this.normalizeLayout(layout));
  },

  async fetchEndpoint(endpoint: string): Promise<unknown> {
    return dashboardClient.fetchWidgetEndpoint(endpoint);
  },

  normalizeLayout(layout: DashboardLayoutItem[]): DashboardLayoutItem[] {
    return [...layout]
      .map((item, index) => ({
        widget_key: item.widget_key,
        position: toPosition(item.position, index),
        is_visible: item.is_visible !== false,
        width: this.normalizeWidth(item.width),
      }))
      .sort((a, b) => a.position - b.position);
  },

  normalizeWidth(width: unknown): DashboardWidgetWidth {
    return width === 'full' ? 'full' : 'half';
  },

  getVisibleLayout(layout: DashboardLayoutItem[]): DashboardLayoutItem[] {
    return this.normalizeLayout(layout).filter((item) => item.is_visible);
  },

  getNextPosition(layout: DashboardLayoutItem[]): number {
    if (layout.length === 0) return 0;
    return Math.max(...layout.map((item) => toPosition(item.position, 0))) + 1;
  },

  reindexLayout(layout: DashboardLayoutItem[]): DashboardLayoutItem[] {
    return this.normalizeLayout(layout).map((item, index) => ({
      ...item,
      position: index,
    }));
  },

  groupEndpoints(
    registry: DashboardWidgetRegistry,
    layout: DashboardLayoutItem[],
    widgetKeys?: string[],
  ): DashboardEndpointGroup[] {
    const allowedKeys = widgetKeys ? new Set(widgetKeys) : null;
    const groups = new Map<string, string[]>();

    this.getVisibleLayout(layout).forEach((item) => {
      if (allowedKeys && !allowedKeys.has(item.widget_key)) return;

      const definition = registry[item.widget_key];
      if (!definition?.endpoint) return;

      const existing = groups.get(definition.endpoint) || [];
      existing.push(item.widget_key);
      groups.set(definition.endpoint, existing);
    });

    return Array.from(groups.entries()).map(([endpoint, keys]) => ({
      endpoint,
      widgetKeys: keys,
    }));
  },

  extractData(source: unknown, dataPath: string | null): unknown {
    if (!dataPath) return source;
    if (source === null || source === undefined) return undefined;

    const parts = Array.from(dataPath.matchAll(PATH_PART_PATTERN)).map(
      (match) => match[1] ?? match[2],
    );

    return parts.reduce<unknown>((current, part) => {
      if (current === null || current === undefined) return undefined;

      if (Array.isArray(current)) {
        const index = Number(part);
        return Number.isInteger(index) ? current[index] : undefined;
      }

      if (typeof current === 'object') {
        return (current as Record<string, unknown>)[part];
      }

      return undefined;
    }, source);
  },

  getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  },
};
