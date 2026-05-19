import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, LayoutDashboard, Plus, RefreshCw } from 'lucide-react';
import {
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
  type Layout,
  type ResponsiveLayouts,
} from 'react-grid-layout';
import type { Warehouse } from '../../../core/warehouses/types/models';
import type { User } from '../../auth/types/models';
import { BaseInfoletCard } from '../components/BaseInfoletCard';
import { WidgetPickerModal } from '../components/WidgetPickerModal';
import { dashboardService } from '../services/dashboardService';
import { useDashboardStore } from '../stores/dashboardStore';
import type { DashboardResolvedWidget } from '../types/dashboardTypes';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/dashboard.css';

const GRID_COLUMNS = {
  lg: 4,
  md: 4,
  sm: 2,
  xs: 1,
  xxs: 1,
};

const CHART_WIDGET_KEYS = new Set([
  'production_output',
  'production_yield_trends',
  'production_schedule',
  'inventory_alerts',
  'inventory_movement',
]);

const TABLE_WIDGET_KEYS = new Set([
  'production_top_products',
  'inventory_low_stock',
]);

const STATUS_WIDGET_KEYS = new Set([
  'production_orders_status',
  'production_waste',
  'inventory_stock_status',
  'inventory_expiring',
  'inventory_expired',
]);

const getWidgetHeight = (widget: DashboardResolvedWidget): number => {
  if (widget.isLoading || widget.error) return 3;
  if (CHART_WIDGET_KEYS.has(widget.key)) return widget.layout.width === 'full' ? 5 : 4;
  if (TABLE_WIDGET_KEYS.has(widget.key)) return widget.layout.width === 'full' ? 5 : 4;
  if (STATUS_WIDGET_KEYS.has(widget.key)) return 3;
  if (
    typeof widget.data === 'number' ||
    typeof widget.data === 'string' ||
    typeof widget.data === 'boolean'
  ) {
    return 2;
  }
  if (Array.isArray(widget.data)) return widget.layout.width === 'full' ? 4 : 3;
  if (widget.data && typeof widget.data === 'object') {
    return widget.layout.width === 'full' ? 4 : 3;
  }
  return 2;
};

const buildGridLayout = (
  widgets: DashboardResolvedWidget[],
  columns: number,
): Layout[] => {
  let cursorX = 0;
  let cursorY = 0;

  return widgets.map((widget) => {
    const width = columns === 1 ? 1 : widget.layout.width === 'full' ? columns : columns / 2;
    const height = getWidgetHeight(widget);

    if (cursorX + width > columns) {
      cursorX = 0;
      cursorY += 1;
    }

    const item = {
      i: widget.key,
      x: cursorX,
      y: cursorY,
      w: width,
      h: height,
      minW: columns === 1 ? 1 : Math.min(width, 2),
      maxW: columns,
      minH: 2,
    };

    cursorX += width;
    if (cursorX >= columns) {
      cursorX = 0;
      cursorY += 1;
    }

    return item;
  });
};

const orderWidgetKeysFromGrid = (gridLayout: Layout[]): string[] =>
  [...gridLayout]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((item) => item.i);

interface DashboardProps {
  user: User | null;
  activeWarehouse: Warehouse | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, activeWarehouse }) => {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [highlightedWidgetKey, setHighlightedWidgetKey] = useState<string | null>(null);
  const widgetRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { width: gridWidth, containerRef: gridContainerRef, mounted: gridMounted } =
    useContainerWidth();
  const registry = useDashboardStore((state) => state.registry);
  const layout = useDashboardStore((state) => state.layout);
  const endpointData = useDashboardStore((state) => state.endpointData);
  const endpointLoading = useDashboardStore((state) => state.endpointLoading);
  const endpointErrors = useDashboardStore((state) => state.endpointErrors);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const isSavingLayout = useDashboardStore((state) => state.isSavingLayout);
  const error = useDashboardStore((state) => state.error);
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);
  const refreshAll = useDashboardStore((state) => state.refreshAll);
  const refreshWidget = useDashboardStore((state) => state.refreshWidget);
  const addWidget = useDashboardStore((state) => state.addWidget);
  const removeWidget = useDashboardStore((state) => state.removeWidget);
  const resizeWidget = useDashboardStore((state) => state.resizeWidget);
  const reorderWidgets = useDashboardStore((state) => state.reorderWidgets);
  const clearError = useDashboardStore((state) => state.clearError);

  const activeWidgetKeys = useMemo(
    () => layout.map((item) => item.widget_key),
    [layout],
  );
  const widgets = useMemo(
    () =>
      dashboardService
        .getVisibleLayout(layout)
        .map((item) => {
          const definition = registry[item.widget_key];
          if (!definition) return null;
          const endpointCache = endpointData[definition.endpoint];

          return {
            key: item.widget_key,
            definition,
            layout: item,
            data: dashboardService.extractData(
              endpointCache?.data,
              definition.dataPath,
            ),
            isLoading: !!endpointLoading[definition.endpoint],
            error: endpointErrors[definition.endpoint] || null,
          };
        })
        .filter((widget): widget is DashboardResolvedWidget => Boolean(widget)),
    [endpointData, endpointErrors, endpointLoading, layout, registry],
  );
  const visibleWidgetCount = widgets.length;
  const registryCount = Object.keys(registry).length;
  const gridLayouts = useMemo<ResponsiveLayouts>(
    () => ({
      lg: buildGridLayout(widgets, GRID_COLUMNS.lg),
      md: buildGridLayout(widgets, GRID_COLUMNS.md),
      sm: buildGridLayout(widgets, GRID_COLUMNS.sm),
      xs: buildGridLayout(widgets, GRID_COLUMNS.xs),
      xxs: buildGridLayout(widgets, GRID_COLUMNS.xxs),
    }),
    [widgets],
  );
  const userDisplayName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(' ') || user?.username || 'Current user';

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleAddWidget = async (widgetKey: string) => {
    await addWidget(widgetKey);
    setPickerOpen(false);
    setHighlightedWidgetKey(widgetKey);
  };

  useEffect(() => {
    if (!highlightedWidgetKey) return undefined;

    const widgetExists = widgets.some((widget) => widget.key === highlightedWidgetKey);
    if (!widgetExists) {
      setHighlightedWidgetKey(null);
      return undefined;
    }

    const scrollTimer = window.setTimeout(() => {
      widgetRefs.current[highlightedWidgetKey]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 180);

    const clearTimer = window.setTimeout(() => {
      setHighlightedWidgetKey(null);
    }, 2800);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [highlightedWidgetKey, widgets]);

  const handleDragStop = (currentLayout: Layout[]) => {
    const nextOrder = orderWidgetKeysFromGrid(currentLayout);
    const currentOrder = widgets.map((widget) => widget.key);
    const hasChanged = nextOrder.some((widgetKey, index) => widgetKey !== currentOrder[index]);
    if (hasChanged) void reorderWidgets(nextOrder);
  };

  return (
    <div className="dashboard-content">
      <header className="dashboard-page-header">
        <div className="dashboard-page-header__title">
          <div className="dashboard-page-header__icon">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <span className="dashboard-eyebrow">Operational overview</span>
            <h1>Dashboard</h1>
            <p>
              {userDisplayName} viewing {activeWarehouse?.name || 'all warehouse data'}
            </p>
          </div>
        </div>
        <div className="dashboard-page-header__actions">
          <span className="dashboard-save-state">
            {isSavingLayout ? 'Saving layout' : `${visibleWidgetCount} active infolets`}
          </span>
          <button
            type="button"
            className="btn btn-secondary dashboard-action-button"
            onClick={() => void refreshAll()}
            disabled={isLoading || visibleWidgetCount === 0}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary dashboard-action-button"
            onClick={() => setPickerOpen(true)}
            disabled={isLoading || registryCount === 0}
          >
            <Plus size={16} />
            Add infolet
          </button>
        </div>
      </header>

      {error && (
        <div className="dashboard-page-alert" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <section className="dashboard-infolet-skeleton-grid" aria-label="Loading dashboard">
          {Array.from({ length: 6 }).map((_, index) => (
            <article
              key={index}
              className="dashboard-infolet dashboard-infolet--half dashboard-infolet--skeleton"
            >
              <div className="dashboard-skeleton-line dashboard-skeleton-line--short" />
              <div className="dashboard-skeleton-line" />
              <div className="dashboard-skeleton-block" />
            </article>
          ))}
        </section>
      ) : visibleWidgetCount === 0 ? (
        <section className="dashboard-empty-state">
          <div className="dashboard-empty-state__icon">
            <LayoutDashboard size={30} />
          </div>
          <h2>Your dashboard is empty</h2>
          <p>Add infolets from production, inventory, purchasing, sales, costing, or finance.</p>
          <button
            type="button"
            className="btn btn-primary dashboard-action-button"
            onClick={() => setPickerOpen(true)}
            disabled={registryCount === 0}
          >
            <Plus size={16} />
            Add your first infolet
          </button>
        </section>
      ) : (
        <section className="dashboard-infolet-grid-wrap" aria-label="Dashboard infolets">
          <div ref={gridContainerRef}>
            {gridMounted && (
              <ResponsiveGridLayout
                className="dashboard-infolet-grid"
                width={gridWidth}
                layouts={gridLayouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={GRID_COLUMNS}
                rowHeight={86}
                margin={[18, 18]}
                containerPadding={[0, 0]}
                compactor={verticalCompactor}
                resizeConfig={{ enabled: false, handles: [] }}
                dragConfig={{
                  enabled: true,
                  bounded: false,
                  handle: '.dashboard-infolet__drag-handle',
                  cancel: 'button,input,select,textarea,a',
                  threshold: 3,
                }}
                onDragStop={handleDragStop}
              >
                {widgets.map((widget) => (
                  <div
                    key={widget.key}
                    ref={(element) => {
                      widgetRefs.current[widget.key] = element;
                    }}
                    className="dashboard-grid-item"
                  >
                    <BaseInfoletCard
                      widget={widget}
                      isSaving={isSavingLayout}
                      isHighlighted={highlightedWidgetKey === widget.key}
                      onRefresh={(widgetKey) => void refreshWidget(widgetKey)}
                      onRemove={(widgetKey) => void removeWidget(widgetKey)}
                      onResize={(widgetKey) => void resizeWidget(widgetKey)}
                    />
                  </div>
                ))}
              </ResponsiveGridLayout>
            )}
          </div>
        </section>
      )}

      <WidgetPickerModal
        isOpen={isPickerOpen}
        registry={registry}
        activeWidgetKeys={activeWidgetKeys}
        isSaving={isSavingLayout}
        onClose={() => setPickerOpen(false)}
        onAdd={(widgetKey) => void handleAddWidget(widgetKey)}
      />
    </div>
  );
};

export default Dashboard;
