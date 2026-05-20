import React from 'react';
import { EmptyInfolet, isRecord, StatusBars } from '../infoletRenderUtils';

export const ProductionStatusInfolet: React.FC<{ data: unknown }> = ({ data }) => {
  if (!isRecord(data)) return <EmptyInfolet />;
  return <StatusBars data={data} order={['scheduled', 'in_progress', 'completed', 'cancelled']} />;
};

export default ProductionStatusInfolet;
