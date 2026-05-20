import React, { useMemo, useState } from 'react';
import {
  Calculator,
  Factory,
  Landmark,
  Package,
  Search,
  ShoppingCart,
  Truck,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardWidgetRegistry } from '../types/dashboardTypes';
import { getDashboardModuleKey, getDashboardModuleToneClass } from '../utils/dashboardModuleTheme';

interface WidgetPickerModalProps {
  isOpen: boolean;
  registry: DashboardWidgetRegistry;
  activeWidgetKeys: string[];
  isSaving: boolean;
  onClose: () => void;
  onAdd: (widgetKey: string) => void | Promise<void>;
}

interface WidgetPickerGroup {
  module: string;
  widgets: Array<{
    key: string;
    label: string;
    description: string;
  }>;
}

const normalize = (value: string): string => value.trim().toLowerCase();

const MODULE_ICONS: Record<string, LucideIcon> = {
  production: Factory,
  inventory: Package,
  purchasing: Truck,
  sales: ShoppingCart,
  costing: Calculator,
  finance: Landmark,
};

export const WidgetPickerModal: React.FC<WidgetPickerModalProps> = ({
  isOpen,
  registry,
  activeWidgetKeys,
  isSaving,
  onClose,
  onAdd,
}) => {
  const [query, setQuery] = useState('');
  const activeKeys = useMemo(() => new Set(activeWidgetKeys), [activeWidgetKeys]);

  const groups = useMemo<WidgetPickerGroup[]>(() => {
    const normalizedQuery = normalize(query);
    const grouped = new Map<string, WidgetPickerGroup['widgets']>();

    Object.entries(registry).forEach(([key, definition]) => {
      const haystack = normalize(
        `${definition.label} ${definition.description} ${definition.module}`,
      );
      if (normalizedQuery && !haystack.includes(normalizedQuery)) return;

      const moduleName = definition.module || 'Other';
      const widgets = grouped.get(moduleName) || [];
      widgets.push({
        key,
        label: definition.label,
        description: definition.description,
      });
      grouped.set(moduleName, widgets);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, widgets]) => ({
        module,
        widgets: widgets.sort((a, b) => a.label.localeCompare(b.label)),
      }));
  }, [query, registry]);

  if (!isOpen) return null;

  return (
    <div className="dashboard-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="dashboard-widget-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-widget-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="dashboard-widget-picker__header">
          <div>
            <span className="dashboard-eyebrow">Customize</span>
            <h2 id="dashboard-widget-picker-title">Add infolet</h2>
            <p>
              {activeKeys.size} added from {Object.keys(registry).length} available
            </p>
          </div>
          <button
            type="button"
            className="dashboard-icon-button"
            onClick={onClose}
            aria-label="Close add infolet"
          >
            <X size={18} />
          </button>
        </header>

        <label className="dashboard-widget-picker__search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search infolets"
            autoFocus
          />
        </label>

        <div className="dashboard-widget-picker__groups">
          {groups.length === 0 ? (
            <div className="dashboard-infolet-empty">No matching infolets.</div>
          ) : (
            groups.map((group) => (
              <section
                key={group.module}
                className={`dashboard-widget-picker__group ${getDashboardModuleToneClass(group.module)}`}
              >
                <div className="dashboard-widget-picker__group-head">
                  <span className="dashboard-widget-picker__module-icon">
                    {React.createElement(
                      MODULE_ICONS[getDashboardModuleKey(group.module)] || Package,
                      { size: 17 },
                    )}
                  </span>
                  <h3>{group.module}</h3>
                  <span className="dashboard-widget-picker__count">
                    {group.widgets.filter((widget) => activeKeys.has(widget.key)).length}/
                    {group.widgets.length}
                  </span>
                </div>
                <div className="dashboard-widget-picker__list">
                  {group.widgets.map((widget) => {
                    const alreadyAdded = activeKeys.has(widget.key);
                    return (
                      <button
                        key={widget.key}
                        type="button"
                        className={`dashboard-widget-option ${
                          alreadyAdded ? 'dashboard-widget-option--added' : ''
                        }`}
                        disabled={alreadyAdded || isSaving}
                        onClick={() => onAdd(widget.key)}
                      >
                        <span>
                          <strong>{widget.label}</strong>
                          <small>{widget.description}</small>
                        </span>
                        <em>{alreadyAdded ? 'Added' : 'Add'}</em>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default WidgetPickerModal;
