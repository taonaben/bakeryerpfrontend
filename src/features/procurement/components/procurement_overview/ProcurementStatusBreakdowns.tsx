import React from 'react';
import type { ProcurementOverviewSummary, ProcurementStatusCounts } from '../../types/procurement_overview_models';
import { countTotal, statusClassName } from './procurementOverviewUtils';

interface ProcurementStatusBreakdownsProps {
  summary: ProcurementOverviewSummary | null;
  isLoading: boolean;
}

const ProcurementStatusBreakdowns: React.FC<ProcurementStatusBreakdownsProps> = ({
  summary,
  isLoading,
}) => (
  <section className="procurement-overview-section">
    <div className="procurement-overview-section__head">
      <div>
        <h2>Status Breakdown</h2>
        <p>Operational counts by document lifecycle.</p>
      </div>
    </div>

    <div className="procurement-overview-status-grid">
      <StatusBreakdownCard title="Purchase Requisitions" counts={summary?.pr_counts_by_status || {}} isLoading={isLoading} />
      <StatusBreakdownCard title="Purchase Orders" counts={summary?.po_counts_by_status || {}} isLoading={isLoading} />
      <StatusBreakdownCard title="Goods Receipts" counts={summary?.grn_counts_by_status || {}} isLoading={isLoading} />
      <StatusBreakdownCard
        title="Supplier Invoices"
        counts={summary?.supplier_invoice_counts_by_status || {}}
        isLoading={isLoading}
      />
    </div>
  </section>
);

const StatusBreakdownCard: React.FC<{
  title: string;
  counts: ProcurementStatusCounts;
  isLoading: boolean;
}> = ({ title, counts, isLoading }) => {
  const total = countTotal(counts);
  const entries = Object.entries(counts).filter(([, value]) => value > 0);

  return (
    <article className="procurement-overview-panel procurement-overview-status-card">
      <div className="procurement-overview-card-title">
        <h3>{title}</h3>
        <span>{total}</span>
      </div>

      {isLoading ? (
        <div className="procurement-overview-status-skeleton" aria-label="Loading status breakdown">
          <span className="procurement-skeleton procurement-skeleton--bar" />
          <span className="procurement-skeleton procurement-skeleton--line" />
          <span className="procurement-skeleton procurement-skeleton--line procurement-skeleton--short" />
          <span className="procurement-skeleton procurement-skeleton--line" />
        </div>
      ) : (
        <>
      <div className="procurement-overview-segmented" aria-label={`${title} status split`}>
        {entries.length === 0 ? (
          <span className="procurement-overview-segment procurement-overview-segment--empty" />
        ) : (
          entries.map(([status, value]) => (
            <span
              key={status}
              className={`procurement-overview-segment procurement-overview-segment--${statusClassName(status)}`}
              style={{ width: `${Math.max((value / total) * 100, 4)}%` }}
              title={`${status}: ${value}`}
            />
          ))
        )}
      </div>

      <div className="procurement-overview-status-list">
        {entries.length === 0 ? (
          <span className="procurement-overview-muted">No records</span>
        ) : (
          entries.map(([status, value]) => (
            <div key={status} className="procurement-overview-status-item">
              <span className={`procurement-overview-status-dot procurement-overview-status-dot--${statusClassName(status)}`} />
              <span>{status}</span>
              <strong>{value}</strong>
            </div>
          ))
        )}
      </div>
        </>
      )}
    </article>
  );
};

export default ProcurementStatusBreakdowns;
