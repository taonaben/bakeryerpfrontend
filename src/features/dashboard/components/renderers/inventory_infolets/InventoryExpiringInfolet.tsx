import React from 'react';
import {
  formatNumber,
  type InfoletTone,
  isRecord,
  toNumber,
} from '../infoletRenderUtils';

export const InventoryExpiringInfolet: React.FC<{ data: unknown }> = ({ data }) => {
  const record = isRecord(data) ? data : {};
  const buckets = [
    { key: 'within_7_days', label: '7 days', tone: 'danger' as InfoletTone },
    { key: 'within_14_days', label: '14 days', tone: 'warning' as InfoletTone },
    { key: 'within_30_days', label: '30 days', tone: 'info' as InfoletTone },
  ].map((bucket) => {
    const value = isRecord(record[bucket.key])
      ? record[bucket.key] as Record<string, unknown>
      : {};
    return {
      ...bucket,
      count: toNumber(value.count),
      quantity: toNumber(value.quantity),
    };
  });

  return (
    <div className="dashboard-expiry-grid">
      {buckets.map((bucket) => (
        <div key={bucket.key} className={`dashboard-expiry-card dashboard-expiry-card--${bucket.tone}`}>
          <strong>{formatNumber(bucket.count, 0)}</strong>
          <span>{bucket.label}</span>
          <small>{formatNumber(bucket.quantity)} qty</small>
        </div>
      ))}
    </div>
  );
};

export default InventoryExpiringInfolet;
