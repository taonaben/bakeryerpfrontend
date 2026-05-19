import React from 'react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardWidgetWidth } from '../../../types/dashboardTypes';
import {
  ChartFrame,
  type DashboardChartPoint,
  EmptyInfolet,
  formatNumber,
  getRowLimit,
  isRecord,
  readString,
  toNumber,
} from '../infoletRenderUtils';

interface InventoryMovementInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

export const InventoryMovementInfolet: React.FC<InventoryMovementInfoletProps> = ({
  data,
  width,
}) => {
  const record = isRecord(data) ? data : {};
  const movementTypes = [
    { key: 'inbound', label: 'Inbound', stroke: '#16a34a' },
    { key: 'outbound', label: 'Outbound', stroke: '#dc2626' },
    { key: 'adjustments', label: 'Adjustments', stroke: '#2563eb' },
    { key: 'returns', label: 'Returns', stroke: '#7c3aed' },
  ];
  const periods = new Map<string, DashboardChartPoint>();

  movementTypes.forEach((type) => {
    const rows = Array.isArray(record[type.key]) ? record[type.key].filter(isRecord) : [];
    rows.forEach((row) => {
      const period = readString(row, ['period'], '');
      if (!period) return;
      const existing = periods.get(period) || { period };
      existing[type.key] = Math.abs(toNumber(row.total_quantity ?? row.count));
      periods.set(period, existing);
    });
  });

  const chartData = Array.from(periods.values()).slice(-getRowLimit(width, 5));
  if (chartData.length === 0) return <EmptyInfolet message="No movement trend data found." />;

  return (
    <div className="dashboard-module-renderer">
      <ChartFrame>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip formatter={(value) => formatNumber(value)} />
          {movementTypes.map((type) => (
            <Line
              key={type.key}
              type="monotone"
              dataKey={type.key}
              name={type.label}
              stroke={type.stroke}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ChartFrame>
    </div>
  );
};

export default InventoryMovementInfolet;
