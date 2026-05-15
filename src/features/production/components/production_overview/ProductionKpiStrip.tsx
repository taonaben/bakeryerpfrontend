import React from 'react';
import {
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  Factory,
  Gauge,
  PackageCheck,
} from 'lucide-react';
import type { ProductionOverviewSummary } from '../../types/productionOverviewModels';
import { formatPercent, formatQuantity } from './productionOverviewUtils';

interface ProductionKpiStripProps {
  summary: ProductionOverviewSummary | null;
  isLoading: boolean;
}

interface KpiConfig {
  label: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  tone?: 'warning' | 'danger' | 'success';
}

const ProductionKpiStrip: React.FC<ProductionKpiStripProps> = ({ summary, isLoading }) => {
  const items: KpiConfig[] = [
    {
      label: 'WIP orders',
      value: formatQuantity(summary?.wip_order_count),
      caption: 'Orders currently in production',
      icon: <Factory size={19} />,
      tone: summary?.wip_order_count ? 'warning' : undefined,
    },
    {
      label: 'In-progress batches',
      value: formatQuantity(summary?.in_progress_batch_count),
      caption: 'Open batch runs',
      icon: <Boxes size={19} />,
    },
    {
      label: 'Overdue scheduled',
      value: formatQuantity(summary?.scheduled_orders_overdue_to_start),
      caption: 'Scheduled orders late to start',
      icon: <AlertTriangle size={19} />,
      tone: summary?.scheduled_orders_overdue_to_start ? 'danger' : undefined,
    },
    {
      label: 'Completed quantity',
      value: formatQuantity(summary?.completed_quantity),
      caption: 'Finished output in range',
      icon: <PackageCheck size={19} />,
      tone: 'success',
    },
    {
      label: 'Waste rate',
      value: formatPercent(summary?.waste.waste_rate),
      caption: `${formatQuantity(summary?.waste.quantity)} units wasted`,
      icon: <Gauge size={19} />,
      tone: summary?.waste.waste_rate ? 'warning' : undefined,
    },
    {
      label: 'Variance rate',
      value: formatPercent(summary?.variance.variance_rate),
      caption: `${formatQuantity(summary?.variance.quantity)} units variance`,
      icon: <ClipboardCheck size={19} />,
      tone: summary?.variance.variance_rate ? 'warning' : undefined,
    },
  ];

  return (
    <section className="production-overview-kpis">
      {items.map((item) => (
        <article
          key={item.label}
          className={`production-overview-kpi ${
            item.tone ? `production-overview-kpi--${item.tone}` : ''
          }`}
        >
          <div className="production-overview-kpi__icon">{item.icon}</div>
          <span>{item.label}</span>
          {isLoading ? (
            <>
              <strong className="production-overview-skeleton production-overview-skeleton--value" />
              <small className="production-overview-skeleton production-overview-skeleton--text" />
            </>
          ) : (
            <>
              <strong>{item.value}</strong>
              <small>{item.caption}</small>
            </>
          )}
        </article>
      ))}
    </section>
  );
};

export default ProductionKpiStrip;
