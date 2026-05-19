import React from 'react';
import type { DashboardWidgetWidth } from '../../../types/dashboardTypes';
import {
  formatLabel,
  formatNumber,
  isRecord,
  readString,
  SimpleTable,
} from '../infoletRenderUtils';

interface InventoryLowStockInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

const StatusPill = ({ status }: { status: string }) => (
  <span className={`dashboard-status-pill dashboard-status-pill--${status.toLowerCase().replace(/_/g, '-')}`}>
    {formatLabel(status)}
  </span>
);

export const InventoryLowStockInfolet: React.FC<InventoryLowStockInfoletProps> = ({
  data,
  width,
}) => {
  const rows = Array.isArray(data) ? data.filter(isRecord) : [];

  return (
    <SimpleTable
      rows={rows}
      width={width}
      emptyMessage="No low stock products."
      columns={[
        {
          key: 'product',
          label: 'Product',
          render: (row) => (
            <span className="dashboard-product-cell">
              <strong>{readString(row, ['product_name', 'name'])}</strong>
              <small>{readString(row, ['warehouse_name', 'sku'], '')}</small>
            </span>
          ),
        },
        {
          key: 'qty',
          label: 'Qty',
          align: 'right',
          render: (row) => formatNumber(row.quantity_on_hand ?? row.quantity),
        },
        {
          key: 'status',
          label: 'Status',
          align: 'right',
          render: (row) => <StatusPill status={readString(row, ['status'], 'LOW_STOCK')} />,
        },
      ]}
    />
  );
};

export default InventoryLowStockInfolet;
