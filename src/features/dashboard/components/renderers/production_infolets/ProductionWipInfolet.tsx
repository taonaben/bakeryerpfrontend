import React from 'react';
import { Factory } from 'lucide-react';
import { formatNumber, MetricHero, toNumber } from '../infoletRenderUtils';

export const ProductionWipInfolet: React.FC<{ data: unknown }> = ({ data }) => (
  <MetricHero
    value={formatNumber(data, 0)}
    label="Orders currently in progress"
    tone={toNumber(data) > 0 ? 'info' : 'neutral'}
    icon={<Factory size={20} />}
    secondary={toNumber(data) > 0 ? 'Production floor has active work.' : 'No active production orders.'}
  />
);

export default ProductionWipInfolet;
