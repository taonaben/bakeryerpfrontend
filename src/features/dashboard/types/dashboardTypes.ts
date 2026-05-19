export type DashboardWidgetWidth = 'half' | 'full';

export interface DashboardWidgetDefinition {
  label: string;
  description: string;
  module: string;
  endpoint: string;
  dataPath: string | null;
  width: DashboardWidgetWidth;
}

export type DashboardWidgetRegistry = Record<string, DashboardWidgetDefinition>;

export interface DashboardLayoutItem {
  widget_key: string;
  position: number;
  is_visible: boolean;
  width: DashboardWidgetWidth;
}

export interface DashboardEndpointCacheEntry {
  data: unknown;
  lastFetched: number;
}

export interface DashboardResolvedWidget {
  key: string;
  definition: DashboardWidgetDefinition;
  layout: DashboardLayoutItem;
  data: unknown;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardEndpointGroup {
  endpoint: string;
  widgetKeys: string[];
}
