import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartFrame,
  formatNumber,
  isRecord,
  StatTiles,
  toNumber,
} from '../infoletRenderUtils';

export const ProductionOutputInfolet: React.FC<{ data: unknown }> = ({ data }) => {
  const record = isRecord(data) ? data : {};
  const expected = toNumber(record.expected_output);
  const actual = toNumber(record.actual_output);
  const variance = actual - expected;
  const chartData = [
    { name: 'Expected', value: expected, fill: '#2563eb' },
    { name: 'Actual', value: actual, fill: actual >= expected ? '#16a34a' : '#dc2626' },
  ];

  return (
    <div className="dashboard-module-renderer">
      <StatTiles
        items={[
          {
            label: 'Variance',
            value: formatNumber(variance),
            tone: variance >= 0 ? 'good' : 'danger',
            icon: variance >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />,
          },
        ]}
      />
      <ChartFrame size="small">
        <BarChart data={chartData}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip cursor={false} formatter={(value) => formatNumber(value)} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartFrame>
    </div>
  );
};

export default ProductionOutputInfolet;
