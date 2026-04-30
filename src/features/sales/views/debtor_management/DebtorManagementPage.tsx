import React from 'react';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';

const DebtorManagementPage: React.FC = () => {
  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '10px',
            background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Debtor Management</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
              Outstanding balances, overdue invoices, and customer debt overview
            </p>
          </div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 16px', background: '#fff', color: '#374151',
          border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
        }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Outstanding', value: '—', color: '#ef4444', bg: '#fef2f2' },
          { label: 'Overdue (30+ days)', value: '—', color: '#f97316', bg: '#fff7ed' },
          { label: 'Overdue (60+ days)', value: '—', color: '#d97706', bg: '#fef3c7' },
          { label: 'Customers Over Limit', value: '—', color: '#8b5cf6', bg: '#faf5ff' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            padding: '16px 18px', borderRadius: '10px', background: bg,
            border: `1px solid ${color}22`,
          }}>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1,
          border: '1px solid #e5e7eb', borderRadius: '6px', padding: '7px 10px' }}>
          <Search size={14} color="#9ca3af" />
          <input placeholder="Search debtors…" style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', background: 'transparent' }} />
        </div>
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
              {['Customer', 'Company', 'Outstanding Balance', 'Oldest Due Date', 'Days Overdue', ''].map((h) => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <AlertTriangle size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <div style={{ fontWeight: 500 }}>No outstanding debtors</div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>All customer balances are settled</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DebtorManagementPage;
