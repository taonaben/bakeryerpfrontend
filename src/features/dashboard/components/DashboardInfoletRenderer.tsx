import React from 'react';
import { GenericInfoletRenderer } from './GenericInfoletRenderer';
import { ProductionInventoryInfoletRenderer } from './renderers/ProductionInventoryInfolets';
import type { DashboardResolvedWidget } from '../types/dashboardTypes';

interface DashboardInfoletRendererProps {
  widget: DashboardResolvedWidget;
}

export const DashboardInfoletRenderer: React.FC<DashboardInfoletRendererProps> = ({
  widget,
}) => {
  if (widget.key.startsWith('production_') || widget.key.startsWith('inventory_')) {
    return <ProductionInventoryInfoletRenderer widget={widget} />;
  }

  return (
    <GenericInfoletRenderer
      data={widget.data}
      width={widget.layout.width}
    />
  );
};

export default DashboardInfoletRenderer;
