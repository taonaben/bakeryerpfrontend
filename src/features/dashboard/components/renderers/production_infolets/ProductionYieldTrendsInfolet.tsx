import React from 'react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardWidgetWidth } from '../../../types/dashboardTypes';
import {
  ChartFrame,
  EmptyInfolet,
  formatNumber,
  getRowLimit,
  isRecord,
  readString,
  toNumber,
} from '../infoletRenderUtils';

interface ProductionYieldTrendsInfoletProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

export const ProductionYieldTrendsInfolet: React.FC<ProductionYieldTrendsInfoletProps> = ({
  data,
  width,
}) => {
  const record = isRecord(data) ? data : {};
  const outputRows = Array.isArray(data)
    ? data.filter(isRecord)
    : Array.isArray(record.output)
      ? record.output.filter(isRecord)
      : [];
  const chartData = outputRows.slice(-getRowLimit(width, 5)).map((row) => ({
    period: readString(row, ['period'], ''),
    expected: toNumber(row.expected_output),
    actual: toNumber(row.actual_output),
    variance: toNumber(row.variance),
  }));

  if (chartData.length === 0) return <EmptyInfolet message="No yield trend data found." />;

  return (
    <div className="dashboard-module-renderer">
      <ChartFrame>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip formatter={(value) => formatNumber(value)} />
          <Line type="monotone" dataKey="expected" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartFrame>
    </div>
  );
};

export default ProductionYieldTrendsInfolet;
