import React from 'react';
import { AlertTriangle, FileWarning, ShieldAlert } from 'lucide-react';
import type { ProcurementOverviewSummary } from '../../types/procurement_overview_models';
import { money } from './procurementOverviewUtils';

interface ProcurementAttentionPanelsProps {
  summary: ProcurementOverviewSummary | null;
}

const ProcurementAttentionPanels: React.FC<ProcurementAttentionPanelsProps> = ({
  summary,
}) => {
  const approvals = summary?.pending_approvals;
  const risk = summary?.supplier_risk;
  const exceptions = summary?.match_exceptions;

  return (
    <section className="procurement-overview-section">
      <div className="procurement-overview-section__head">
        <div>
          <h2>Needs Attention</h2>
          <p>Items that can block purchasing, receiving, or supplier trust.</p>
        </div>
      </div>

      <div className="procurement-overview-attention-grid">
        <article className="procurement-overview-panel procurement-overview-attention-card procurement-overview-attention-card--danger">
          <div className="procurement-overview-attention-card__head">
            <AlertTriangle size={18} />
            <h3>Overdue PO Exposure</h3>
          </div>
          <strong>{summary?.overdue_pos.count || 0}</strong>
          <span>{money(summary?.overdue_pos.value || 0)} overdue</span>
        </article>

        <article className="procurement-overview-panel procurement-overview-attention-card">
          <div className="procurement-overview-attention-card__head">
            <ShieldAlert size={18} />
            <h3>Pending Approvals</h3>
          </div>
          <dl>
            <Metric label="Submitted PRs" value={approvals?.submitted_prs || 0} />
            <Metric label="Submitted POs" value={approvals?.submitted_pos || 0} />
            <Metric label="Draft GRNs" value={approvals?.draft_grns || 0} />
            <Metric
              label="Draft Supplier Invoices"
              value={approvals?.draft_supplier_invoices || 0}
            />
          </dl>
        </article>

        <article className="procurement-overview-panel procurement-overview-attention-card">
          <div className="procurement-overview-attention-card__head">
            <ShieldAlert size={18} />
            <h3>Supplier Risk</h3>
          </div>
          <dl>
            <Metric label="On hold" value={risk?.suppliers_on_hold || 0} />
            <Metric label="Inactive" value={risk?.inactive_suppliers || 0} />
            <Metric label="Expired docs" value={risk?.expired_documents || 0} />
            <Metric label="Expiring docs" value={risk?.expiring_documents || 0} />
          </dl>
        </article>

        <article className="procurement-overview-panel procurement-overview-attention-card procurement-overview-attention-card--exceptions">
          <div className="procurement-overview-attention-card__head">
            <FileWarning size={18} />
            <h3>Match Exceptions</h3>
          </div>
          <dl>
            <Metric label="Price variance lines" value={exceptions?.price_variance_lines || 0} />
            <Metric
              label="Quantity variance lines"
              value={exceptions?.quantity_variance_lines || 0}
            />
            <Metric label="Unmatched lines" value={exceptions?.unmatched_lines || 0} />
            <Metric
              label="Invoices affected"
              value={exceptions?.invoices_with_exceptions || 0}
            />
          </dl>
        </article>
      </div>
    </section>
  );
};

const Metric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
);

export default ProcurementAttentionPanels;
