import React from 'react';
import { CreditCard, Filter, Search } from 'lucide-react';

const methodColors: Record<string, string> = {
  cash:           '#10b981',
  bank_transfer:  '#3b82f6',
  mobile_money:   '#f59e0b',
  cheque:         '#8b5cf6',
};

const PaymentsPage: React.FC = () => {
  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '10px',
            background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CreditCard size={22} color="#10b981" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Payments</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
              All payments received across invoices and customers
            </p>
          </div>
        </div>
      </div>

      {/* Method chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['All', 'Cash', 'Bank Transfer', 'Mobile Money', 'Cheque'].map((m) => (
          <button key={m} style={{
            padding: '5px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500,
            border: m === 'All' ? '1.5px solid #10b981' : '1px solid #e5e7eb',
            background: m === 'All' ? '#ecfdf5' : '#fff',
            color: m === 'All' ? '#10b981' : '#6b7280', cursor: 'pointer',
          }}>{m}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
          border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px' }}>
          <Search size={14} color="#9ca3af" />
          <input placeholder="Search payments…" style={{ border: 'none', outline: 'none', fontSize: '0.82rem', background: 'transparent', width: 160 }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px',
          border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>
          <Filter size={13} /> Filter
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {Object.entries(methodColors).map(([method, color]) => (
          <div key={method} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#6b7280' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            {method.replace('_', ' ')}
          </div>
        ))}
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
              {['Invoice #', 'Customer', 'Amount', 'Method', 'Date', 'Reference', 'Received By', 'Notes'].map((h) => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <CreditCard size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <div style={{ fontWeight: 500 }}>No payments recorded</div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Payments are recorded against invoices</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsPage;
