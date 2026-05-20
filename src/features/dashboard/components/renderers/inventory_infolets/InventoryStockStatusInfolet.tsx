import React from 'react';
import { EmptyInfolet, isRecord, StatusBars } from '../infoletRenderUtils';

export const InventoryStockStatusInfolet: React.FC<{ data: unknown }> = ({ data }) => {
  if (!isRecord(data)) return <EmptyInfolet />;
  return <StatusBars data={data} order={['EMPTY', 'ALMOST_OUT', 'GOOD', 'FULL']} />;
};

export default InventoryStockStatusInfolet;
