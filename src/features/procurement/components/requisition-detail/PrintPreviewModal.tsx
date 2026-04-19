/**
 * Print Preview Modal — Requisition Detail
 * Shows a formatted document preview with Print and Save as PDF actions.
 */

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Printer, Download } from 'lucide-react';
import type { PurchaseRequisition } from '../../types/models';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: PurchaseRequisition;
}

const PRINT_STYLES = `
  /* Override the app-wide @media print { body * { visibility: hidden } } rule */
  body, body * { visibility: visible !important; }

  @page { size: A4; margin: 20mm; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #111; margin: 0; }
  .pr-doc { max-width: 100%; }
  .pr-doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #1a1a2e; margin-bottom: 18px; }
  .pr-doc-header h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #1a1a2e; }
  .pr-doc-header .pr-number { font-size: 13px; color: #555; font-family: monospace; }
  .pr-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .pr-badge-draft { background: #f3f4f6; color: #374151; }
  .pr-badge-submitted { background: #eff6ff; color: #1e40af; }
  .pr-badge-approved { background: #f0fdf4; color: #166534; }
  .pr-badge-rejected { background: #fef2f2; color: #991b1b; }
  .pr-badge-converted { background: #faf5ff; color: #6b21a8; }
  .pr-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin-bottom: 18px; }
  .pr-meta-item label { display: block; font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
  .pr-meta-item .value { font-size: 12px; color: #111; }
  .pr-description-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; font-size: 12px; }
  .pr-description-box strong { display: block; font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .pr-section-title { font-size: 13px; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin: 0 0 10px; }
  .pr-line-items { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  .pr-line-items thead th { text-align: left; padding: 6px 10px; background: #f1f5f9; font-size: 10px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #e2e8f0; }
  .pr-line-items tbody td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .pr-line-items tbody tr:last-child td { border-bottom: none; }
  .pr-line-items .num { color: #9ca3af; }
  .pr-reject-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; margin-top: 18px; font-size: 12px; color: #991b1b; }
  .pr-reject-box strong { display: block; font-size: 10px; margin-bottom: 4px; }
  .pr-footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }
`;

const statusBadgeClass: Record<string, string> = {
  Draft: 'pr-badge-draft',
  Submitted: 'pr-badge-submitted',
  Approved: 'pr-badge-approved',
  Rejected: 'pr-badge-rejected',
  Converted: 'pr-badge-converted',
};

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, onClose, requisition }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: PRINT_STYLES,
  });

  const handleDownload = useReactToPrint({
    contentRef: printRef,
    documentTitle: requisition.pr_number,
    pageStyle: PRINT_STYLES,
  });

  if (!isOpen) return null;

  const fmt = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const metaRows: { label: string; value: string }[] = [
    { label: 'PR Number', value: requisition.pr_number },
    { label: 'Status', value: requisition.status },
    { label: 'Requested By', value: requisition.requested_by_name || '—' },
    { label: 'Warehouse', value: requisition.warehouse_name || '—' },
    { label: 'Created', value: fmt(requisition.created_at) },
    ...(requisition.submitted_at ? [{ label: 'Submitted', value: fmt(requisition.submitted_at) }] : []),
    ...(requisition.approved_at ? [{ label: 'Approved', value: fmt(requisition.approved_at) }] : []),
    ...(requisition.rejected_at ? [{ label: 'Rejected', value: fmt(requisition.rejected_at) }] : []),
  ];

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content print-preview-modal" role="dialog" aria-modal="true" aria-label="Print Preview">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Preview — {requisition.pr_number}</h2>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="print-preview-body">
          <div className="print-preview-paper">
            {/* ── Printable Document ── */}
            <div ref={printRef} className="pr-doc">
              {/* Document Header */}
              <div className="pr-doc-header">
                <div>
                  <h1>Purchase Requisition</h1>
                  <span className="pr-number">{requisition.pr_number}</span>
                </div>
                <span className={`pr-badge ${statusBadgeClass[requisition.status] || 'pr-badge-draft'}`}>
                  {requisition.status}
                </span>
              </div>

              {/* Meta Grid */}
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

              {/* Line Items */}
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

              {/* Rejection Reason */}
              {requisition.rejection_reason && (
                <div className="pr-reject-box">
                  <strong>Rejection Reason</strong>
                  {requisition.rejection_reason}
                </div>
              )}

              {/* Footer */}
              <div className="pr-footer">
                <span>Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>{requisition.pr_number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-footer print-preview-footer">
          <button onClick={onClose} className="btn btn-secondary" type="button">
            Close
          </button>
          <div className="print-preview-actions">
            <button onClick={handleDownload} className="btn btn-secondary" type="button">
              <Download size={16} />
              Save as PDF
            </button>
            <button onClick={handlePrint} className="btn btn-primary" type="button">
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintPreviewModal;
