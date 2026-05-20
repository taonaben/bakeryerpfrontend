import React from 'react';
import { PackageCheck, PackageX } from 'lucide-react';
import {
  formatNumber,
  isRecord,
  MetricHero,
  toNumber,
} from '../infoletRenderUtils';

export const InventoryExpiredInfolet: React.FC<{ data: unknown }> = ({ data }) => {
  const record = isRecord(data) ? data : {};

  return (
    <MetricHero
      value={formatNumber(record.count, 0)}
      label="Expired batches with stock"
      tone={toNumber(record.count) > 0 ? 'danger' : 'good'}
      icon={toNumber(record.count) > 0 ? <PackageX size={20} /> : <PackageCheck size={20} />}
      secondary={`${formatNumber(record.quantity)} quantity currently affected`}
    />
  );
};

export default InventoryExpiredInfolet;
