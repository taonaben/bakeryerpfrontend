import React from 'react';
import { Scale } from 'lucide-react';
import type { SupplierInvoiceMatchLine, SupplierInvoiceMatchResult } from '../../types/supplier_invoices_model';

interface MatchSectionProps {
  matchResult: SupplierInvoiceMatchResult | null;
  isLoading: boolean;
  error: string | null;
  onRunMatch: () => void;
}

const columns = [
  'Product',
  'Inv Qty',
  'Inv Price',
  'GR Qty',
  'GR Price',
  'PO Qty',
  'PO Price',
  'Reason',
];

const MatchTable: React.FC<{ rows: SupplierInvoiceMatchLine[] }> = ({ rows }) => {
  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);

  if (!rows.length) {
    return <div className="empty-state-card">No items in this match group</div>;
  }

  return (
    <table className="line-items-table po-detail-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.invoice_line_id}-${row.product_id}-${row.reason}`}>
            <td>{row.product_name || row.product_id}</td>
            <td className="numeric">{formatNumber(row.invoice_qty)}</td>
            <td className="numeric">{formatNumber(row.invoice_unit_price)}</td>
            <td className="numeric">{formatNumber(row.gr_qty)}</td>
            <td className="numeric">{formatNumber(row.gr_unit_price)}</td>
            <td className="numeric">{formatNumber(row.po_qty)}</td>
            <td className="numeric">{formatNumber(row.po_unit_price)}</td>
            <td className="text-muted">{row.reason || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const MatchSection: React.FC<MatchSectionProps> = ({
  matchResult,
  isLoading,
  error,
  onRunMatch,
}) => {
  const sections = [
    { title: 'Matched', rows: matchResult?.matched || [] },
    { title: 'Price Variance', rows: matchResult?.price_variance || [] },
    { title: 'Quantity Variance', rows: matchResult?.qty_variance || [] },
    { title: 'Unmatched', rows: matchResult?.unmatched || [] },
  ];

  return (
    <div className="overview-card">
      <div className="line-items-header">
        <div>
          <h3 className="line-items-heading" style={{ marginBottom: 0 }}>
            3-Way Match
          </h3>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Compare invoice lines against the goods receipt and purchase order.
          </p>
        </div>
        <button onClick={onRunMatch} className="btn btn-outline" type="button" disabled={isLoading}>
          <Scale size={16} />
          {isLoading ? 'Matching...' : 'Run Match'}
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginTop: 16 }}>
          {error}
        </div>
      )}

      {!matchResult && !isLoading && !error && (
        <div className="empty-state-card" style={{ marginTop: 16 }}>
          Run a 3-way match to view invoice variances and matched items.
        </div>
      )}

      {sections.map((section) => (
        <div key={section.title} className="line-items-section">
          <h3 className="line-items-heading">
            {section.title}
            <span className="line-items-count">{section.rows.length}</span>
          </h3>
          <MatchTable rows={section.rows} />
        </div>
      ))}
    </div>
  );
};

export default MatchSection;
