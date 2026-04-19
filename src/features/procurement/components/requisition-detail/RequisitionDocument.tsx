/**
 * Requisition Document — Print Template
 *
 * Pure presentational component. Renders the A4-formatted content for a
 * Purchase Requisition. Designed to be passed as children to the shared
 * PrintPreviewModal:
 *
 *   <PrintPreviewModal ...>
 *     <RequisitionDocument requisition={requisition} />
 *   </PrintPreviewModal>
 *
 * Relies on the base classes defined in SHARED_PRINT_STYLES (pr-doc,
 * pr-doc-header, pr-meta-grid, pr-line-items, pr-footer, etc.).
 */

import React from 'react';
import type { PurchaseRequisition } from '../../types/models';

interface RequisitionDocumentProps {
  requisition: PurchaseRequisition;
}

const statusBadgeClass: Record<string, string> = {
  Draft: 'pr-badge-draft',
  Submitted: 'pr-badge-submitted',
  Approved: 'pr-badge-approved',
  Rejected: 'pr-badge-rejected',
  Converted: 'pr-badge-converted',
};

const fmt = (date: string | null) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const RequisitionDocument: React.FC<RequisitionDocumentProps> = ({ requisition }) => {
  const metaRows: { label: string; value: string }[] = [
    { label: 'PR Number',     value: requisition.pr_number },
    { label: 'Status',        value: requisition.status },
    { label: 'Requested By',  value: requisition.requested_by_name || '—' },
    { label: 'Warehouse',     value: requisition.warehouse_name || '—' },
    { label: 'Created',       value: fmt(requisition.created_at) },
    ...(requisition.submitted_at ? [{ label: 'Submitted', value: fmt(requisition.submitted_at) }] : []),
    ...(requisition.approved_at  ? [{ label: 'Approved',  value: fmt(requisition.approved_at) }]  : []),
    ...(requisition.rejected_at  ? [{ label: 'Rejected',  value: fmt(requisition.rejected_at) }]  : []),
    ...(requisition.converted_at ? [{ label: 'Converted', value: fmt(requisition.converted_at) }] : []),
  ];

  return (
    <div className="pr-doc">
      {/* Document header */}
      <div className="pr-doc-header">
        <div>
          <h1>Purchase Requisition</h1>
          <span className="pr-number">{requisition.pr_number}</span>
        </div>
        <span className={`pr-badge ${statusBadgeClass[requisition.status] ?? 'pr-badge-draft'}`}>
          {requisition.status}
        </span>
      </div>

      {/* Metadata grid */}
      <div className="pr-meta-grid">
        {metaRows.map(({ label, value }) => (
          <div key={label} className="pr-meta-item">
            <label>{label}</label>
            <div className="value">{value}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      {requisition.description && (
        <div className="pr-description-box">
          <strong>Description</strong>
          {requisition.description}
        </div>
      )}

      {/* Line items */}
      <h3 className="pr-section-title">
        Line Items ({requisition.line_items?.length ?? 0})
      </h3>
      <table className="pr-line-items">
        <thead>
          <tr>
            <th style={{ width: 32 }}>#</th>
            <th>Product</th>
            <th style={{ width: 90 }}>Quantity</th>
            <th style={{ width: 80 }}>UoM</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {requisition.line_items && requisition.line_items.length > 0 ? (
            requisition.line_items.map((item, i) => (
              <tr key={item.id}>
                <td className="num">{i + 1}</td>
                <td>{item.product_name || item.product}</td>
                <td>{Number(item.quantity).toLocaleString()}</td>
                <td>{item.unit_of_measure || '—'}</td>
                <td style={{ color: '#6b7280' }}>{item.description || '—'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '16px' }}>
                No line items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Rejection reason */}
      {requisition.rejection_reason && (
        <div className="pr-alert-box pr-alert-box--danger">
          <strong>Rejection Reason</strong>
          {requisition.rejection_reason}
        </div>
      )}

      {/* Footer */}
      <div className="pr-footer">
        <span>
          Generated{' '}
          {new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <span>{requisition.pr_number}</span>
      </div>
    </div>
  );
};

export default RequisitionDocument;
