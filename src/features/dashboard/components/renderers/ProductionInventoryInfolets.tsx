import React from 'react';
import { GenericInfoletRenderer } from '../GenericInfoletRenderer';
import type { DashboardResolvedWidget } from '../../types/dashboardTypes';
import {
  InventoryAlertsInfolet,
  InventoryExpiredInfolet,
  InventoryExpiringInfolet,
  InventoryLowStockInfolet,
  InventoryMovementInfolet,
  InventoryStockStatusInfolet,
} from './inventory_infolets';
import {
  ProductionOutputInfolet,
  ProductionScheduleInfolet,
  ProductionStatusInfolet,
  ProductionTopProductsInfolet,
  ProductionWasteInfolet,
  ProductionWipInfolet,
  ProductionYieldTrendsInfolet,
} from './production_infolets';

export const ProductionInventoryInfoletRenderer: React.FC<{
  widget: DashboardResolvedWidget;
}> = ({ widget }) => {
  switch (widget.key) {
    case 'production_wip':
      return <ProductionWipInfolet data={widget.data} />;
    case 'production_orders_status':
      return <ProductionStatusInfolet data={widget.data} />;
    case 'production_waste':
      return <ProductionWasteInfolet data={widget.data} />;
    case 'production_output':
      return <ProductionOutputInfolet data={widget.data} />;
    case 'production_top_products':
      return <ProductionTopProductsInfolet data={widget.data} width={widget.layout.width} />;
    case 'production_yield_trends':
      return <ProductionYieldTrendsInfolet data={widget.data} width={widget.layout.width} />;
    case 'production_schedule':
      return <ProductionScheduleInfolet data={widget.data} width={widget.layout.width} />;
    case 'inventory_stock_status':
      return <InventoryStockStatusInfolet data={widget.data} />;
    case 'inventory_low_stock':
      return <InventoryLowStockInfolet data={widget.data} width={widget.layout.width} />;
    case 'inventory_expiring':
      return <InventoryExpiringInfolet data={widget.data} />;
    case 'inventory_expired':
      return <InventoryExpiredInfolet data={widget.data} />;
    case 'inventory_alerts':
      return <InventoryAlertsInfolet data={widget.data} />;
    case 'inventory_movement':
      return <InventoryMovementInfolet data={widget.data} width={widget.layout.width} />;
    default:
      return (
        <GenericInfoletRenderer
          data={widget.data}
          width={widget.layout.width}
        />
      );
  }
};

export default ProductionInventoryInfoletRenderer;
