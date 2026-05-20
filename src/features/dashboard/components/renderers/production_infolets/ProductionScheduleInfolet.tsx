import React from 'react';
import type { DashboardWidgetWidth } from '../../../types/dashboardTypes';
import {
  formatNumber,
  isRecord,
  optionalNumber,
  ProgressMetric,
  readString,
  SimpleTable,
} from '../infoletRenderUtils';

interface ProductionScheduleInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

export const ProductionScheduleInfolet: React.FC<ProductionScheduleInfoletProps> = ({
  data,
  width,
}) => {
  const record = isRecord(data) ? data : {};
  const orders = Array.isArray(record.orders) ? record.orders.filter(isRecord) : [];

  return (
    <div className="dashboard-module-renderer dashboard-module-renderer--stacked">
      <div className="dashboard-progress-grid">
        <ProgressMetric
          label="Start on time"
          value={optionalNumber(record.on_time_start_rate)}
          tone="good"
        />
        <ProgressMetric
          label="Finish on time"
          value={optionalNumber(record.on_time_finish_rate)}
          tone="info"
        />
      </div>
      {width === 'full' && (
        <SimpleTable
          rows={orders}
          width={width}
          emptyMessage="No delayed orders in this range."
          columns={[
            {
              key: 'product',
              label: 'Order',
              render: (row) => <strong>{readString(row, ['product_name', 'order_id'])}</strong>,
            },
            {
              key: 'start',
              label: 'Start delay',
              align: 'right',
              render: (row) => `${formatNumber(row.start_delay_minutes, 0)} min`,
            },
            {
              key: 'finish',
              label: 'Finish delay',
              align: 'right',
              render: (row) => `${formatNumber(row.finish_delay_minutes, 0)} min`,
            },
          ]}
        />
      )}
    </div>
  );
};

export default ProductionScheduleInfolet;
