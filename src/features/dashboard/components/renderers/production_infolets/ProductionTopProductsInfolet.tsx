import React from 'react';
import type { DashboardWidgetWidth } from '../../../types/dashboardTypes';
import {
  formatNumber,
  isRecord,
  readString,
  SimpleTable,
} from '../infoletRenderUtils';

interface ProductionTopProductsInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

export const ProductionTopProductsInfolet: React.FC<ProductionTopProductsInfoletProps> = ({
  data,
  width,
}) => {
  const rows = Array.isArray(data) ? data.filter(isRecord) : [];

  return (
    <SimpleTable
      rows={rows}
      width={width}
      emptyMessage="No product output found."
      columns={[
        {
          key: 'product',
          label: 'Product',
          render: (row) => <strong>{readString(row, ['product_name', 'name'])}</strong>,
        },
        {
          key: 'quantity',
          label: 'Qty',
          align: 'right',
          render: (row) => formatNumber(row.total_quantity ?? row.quantity),
        },
        {
          key: 'batches',
          label: 'Batches',
          align: 'right',
          render: (row) => formatNumber(row.batch_count, 0),
        },
      ]}
    />
  );
};

export default ProductionTopProductsInfolet;
