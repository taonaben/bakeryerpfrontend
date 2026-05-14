import React from 'react';
import { AlertTriangle, ClipboardCheck, FileWarning, ShieldAlert } from 'lucide-react';
import type { ProcurementOverviewSummary } from '../../types/procurement_overview_models';
import { money } from './procurementOverviewUtils';

interface ProcurementKpiStripProps {
  summary: ProcurementOverviewSummary | null;
  isLoading: boolean;
}

const totalPendingApprovals = (summary: ProcurementOverviewSummary | null): number => {
  if (!summary) return 0;
  const approvals = summary.pending_approvals;
  return (
    approvals.submitted_prs +
    approvals.submitted_pos +
    approvals.draft_grns +
    approvals.draft_supplier_invoices
  );
};

const totalMatchExceptions = (summary: ProcurementOverviewSummary | null): number => {
  if (!summary) return 0;
  const exceptions = summary.match_exceptions;
  return (
    exceptions.price_variance_lines +
    exceptions.quantity_variance_lines +
    exceptions.unmatched_lines
  );
};

const totalSupplierRisk = (summary: ProcurementOverviewSummary | null): number => {
  if (!summary) return 0;
  const risk = summary.supplier_risk;
  return (
    risk.suppliers_on_hold +
    risk.inactive_suppliers +
    risk.expired_documents +
    risk.expiring_documents
  );
};

const ProcurementKpiStrip: React.FC<ProcurementKpiStripProps> = ({
  summary,
  isLoading,
}) => (
  <section className="procurement-overview-kpis">
    <KpiCard
      icon={<ClipboardCheck size={20} />}
      label="Open PO Value"
      value={isLoading ? 'Loading...' : money(summary?.open_po_value || 0)}
      helper="Approved or partially received exposure"
    />
    <KpiCard
      icon={<AlertTriangle size={20} />}
      label="Overdue POs"
      value={isLoading ? 'Loading...' : `${summary?.overdue_pos.count || 0}`}
      helper={money(summary?.overdue_pos.value || 0)}
      tone="danger"
    />
    <KpiCard
      icon={<ShieldAlert size={20} />}
      label="Pending Approvals"
      value={isLoading ? 'Loading...' : `${totalPendingApprovals(summary)}`}
      helper="PRs, POs, GRNs, invoices"
      tone="warning"
    />
    <KpiCard
      icon={<FileWarning size={20} />}
      label="Match Exceptions"
      value={isLoading ? 'Loading...' : `${totalMatchExceptions(summary)}`}
      helper={`${summary?.match_exceptions.invoices_with_exceptions || 0} invoices affected`}
      tone={totalMatchExceptions(summary) > 0 ? 'danger' : 'default'}
    />
    <KpiCard
      icon={<ShieldAlert size={20} />}
      label="Supplier Risk"
      value={isLoading ? 'Loading...' : `${totalSupplierRisk(summary)}`}
      helper={`${summary?.supplier_risk.expiring_within_days || 30} day document window`}
      tone={totalSupplierRisk(summary) > 0 ? 'warning' : 'default'}
    />
  </section>
);

const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  tone?: 'default' | 'warning' | 'danger';
}> = ({ icon, label, value, helper, tone = 'default' }) => (
  <article className={`procurement-overview-kpi procurement-overview-kpi--${tone}`}>
    <div className="procurement-overview-kpi__icon">{icon}</div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </div>
  </article>
);

export default ProcurementKpiStrip;
