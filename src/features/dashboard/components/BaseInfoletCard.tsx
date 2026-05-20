import React from 'react';
import {
  AlertCircle,
  GripVertical,
  Maximize2,
  Minimize2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { DashboardInfoletRenderer } from './DashboardInfoletRenderer';
import type { DashboardResolvedWidget } from '../types/dashboardTypes';
import { getDashboardModuleToneClass } from '../utils/dashboardModuleTheme';

interface BaseInfoletCardProps {
  widget: DashboardResolvedWidget;
  isSaving: boolean;
  onRefresh: (widgetKey: string) => void;
  onRemove: (widgetKey: string) => void;
  onResize: (widgetKey: string) => void;
  isHighlighted?: boolean;
}

export const BaseInfoletCard: React.FC<BaseInfoletCardProps> = ({
  widget,
  isSaving,
  onRefresh,
  onRemove,
  onResize,
  isHighlighted = false,
}) => {
  const isFull = widget.layout.width === 'full';

  return (
    <article
      className={`dashboard-infolet dashboard-infolet--${widget.layout.width} ${getDashboardModuleToneClass(widget.definition.module)} ${
        isHighlighted ? 'dashboard-infolet--newly-added' : ''
      }`}
    >
      <header className="dashboard-infolet__header">
        <span
          className="dashboard-infolet__drag-handle"
          title="Drag infolet"
          aria-label="Drag infolet"
        >
          <GripVertical size={16} />
        </span>
        <div className="dashboard-infolet__title-group">
          <span className="dashboard-infolet__module">{widget.definition.module}</span>
          <h3>{widget.definition.label}</h3>
          {widget.definition.description && (
            <p>{widget.definition.description}</p>
          )}
        </div>

        <div className="dashboard-infolet__actions">
          <button
            type="button"
            className="dashboard-icon-button"
            onClick={() => onRefresh(widget.key)}
            disabled={widget.isLoading}
            title="Refresh infolet"
            aria-label={`Refresh ${widget.definition.label}`}
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            className="dashboard-icon-button"
            onClick={() => onResize(widget.key)}
            disabled={isSaving}
            title={isFull ? 'Make half width' : 'Make full width'}
            aria-label={isFull ? 'Make half width' : 'Make full width'}
          >
            {isFull ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            type="button"
            className="dashboard-icon-button dashboard-icon-button--danger"
            onClick={() => onRemove(widget.key)}
            disabled={isSaving}
            title="Remove infolet"
            aria-label={`Remove ${widget.definition.label}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      <div className="dashboard-infolet__body">
        {widget.isLoading ? (
          <div className="dashboard-infolet-loading" aria-label="Loading infolet">
            <span />
            <span />
            <span />
          </div>
        ) : widget.error ? (
          <div className="dashboard-infolet-error" role="alert">
            <AlertCircle size={18} />
            <div>
              <strong>Failed to load</strong>
              <span>{widget.error}</span>
            </div>
          </div>
        ) : (
          <DashboardInfoletRenderer widget={widget} />
        )}
      </div>
    </article>
  );
};

export default BaseInfoletCard;
