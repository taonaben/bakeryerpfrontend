import React from 'react';
import { ArrowUpRight, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import {
  formatNumber,
  formatPercent,
  isRecord,
  optionalNumber,
  StatTiles,
  toNumber,
} from '../infoletRenderUtils';

export const ProductionWasteInfolet: React.FC<{ data: unknown }> = ({ data }) => {
  const record = isRecord(data) ? data : {};
  const quantity = record.quantity ?? record.waste_quantity;
  const rate = record.waste_rate;
  const rateNumber = optionalNumber(rate);

  return (
    <StatTiles
      items={[
        {
          label: 'Waste quantity',
          value: formatNumber(quantity),
          tone: toNumber(quantity) > 0 ? 'warning' : 'good',
          icon: toNumber(quantity) > 0 ? <ArrowUpRight size={16} /> : <CheckCircle2 size={16} />,
        },
        {
          label: 'Waste rate',
          value: formatPercent(rate),
          tone: rateNumber !== null && rateNumber > 0 ? 'danger' : 'good',
          icon: rateNumber !== null && rateNumber > 0
            ? <TrendingUp size={16} />
            : <TrendingDown size={16} />,
        },
      ]}
    />
  );
};

export default ProductionWasteInfolet;
