import React from 'react';
import { FileText, Filter, Search, Download } from 'lucide-react';

const statusColors: Record<string, { bg: string; color: string }> = {
  draft:     { bg: '#f3f4f6', color: '#6b7280' },
  issued:    { bg: '#eff6ff', color: '#3b82f6' },
  paid:      { bg: '#ecfdf5', color: '#10b981' },
  partial:   { bg: '#fff7ed', color: '#f97316' },
  overdue:   { bg: '#fef2f2', color: '#ef4444' },
  cancelled: { bg: '#f3f4f6', color: '#9ca3af' },
};

const InvoicesPage: React.FC = () => {
  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '10px',
            background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={22} color="#8b5cf6" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Invoices</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
              View and manage sales invoices, track payment status
            </p>
          </div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 16px', background: '#fff', color: '#374151',
          border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
        }}>
          <Download size={15} /> Export
        </button>
      </div>

      {/* Status filter chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['All', 'Draft', 'Issued', 'Paid', 'Partial', 'Overdue', 'Cancelled'].map((s) => {
          const key = s.toLowerCase();
          const style = statusColors[key] ?? { bg: '#f3f4f6', color: '#6b7280' };
          return (
            <button key={s} style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500,
              border: s === 'All' ? '1.5px solid #8b5cf6' : '1px solid #e5e7eb',
              background: s === 'All' ? '#faf5ff' : style.bg,
              color: s === 'All' ? '#8b5cf6' : style.color, cursor: 'pointer',
            }}>{s}</button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
          border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px' }}>
          <Search size={14} color="#9ca3af" />
          <input placeholder="Search invoices…" style={{ border: 'none', outline: 'none', fontSize: '0.82rem', background: 'transparent', width: 160 }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px',
          border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>
          <Filter size={13} /> Filter
        </button>
      </div>

      {/* Placeholder table */}
      <div style={{
        background: 'var(--bg-secondary, #fff)',
        border: '1px solid var(--border-color, #e5e7eb)',
        borderRadius: '10px', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Invoice #', 'Type', 'Order #', 'Customer', 'Issued', 'Due', 'Total', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <FileText size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <div style={{ fontWeight: 500 }}>No invoices found</div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Invoices are generated automatically when orders are confirmed</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesPage;
