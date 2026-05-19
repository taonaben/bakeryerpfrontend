import React from 'react';
import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartFrame,
  EmptyInfolet,
  formatLabel,
  formatNumber,
  isRecord,
  STATUS_COLORS,
  toNumber,
} from '../infoletRenderUtils';

export const InventoryAlertsInfolet: React.FC<{ data: unknown }> = ({ data }) => {
  if (!isRecord(data)) return <EmptyInfolet />;

  const chartData = ['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRY']
    .filter((key) => key in data)
    .map((key) => ({
      name: formatLabel(key),
      value: toNumber(data[key]),
      fill: STATUS_COLORS[key],
    }));

  if (chartData.length === 0) return <EmptyInfolet message="No open inventory alerts." />;

  return (
    <div className="dashboard-module-renderer">
      <ChartFrame size="small">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={94} tickLine={false} axisLine={false} />
          <Tooltip cursor={false} formatter={(value) => formatNumber(value, 0)} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartFrame>
    </div>
  );
};

export default InventoryAlertsInfolet;
