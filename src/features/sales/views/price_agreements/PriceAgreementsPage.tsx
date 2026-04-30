import React from 'react';
import { Tag, Plus, Search, Filter } from 'lucide-react';

const PriceAgreementsPage: React.FC = () => {
  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '10px',
            background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Tag size={22} color="#d97706" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Price Agreements</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
              Customer-specific product pricing agreements and validity windows
            </p>
          </div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 16px', background: '#d97706', color: '#fff',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
        }}>
          <Plus size={16} /> New Agreement
        </button>
      </div>

      {/* Active / Inactive toggle + search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
        {['All', 'Active', 'Inactive'].map((t) => (
          <button key={t} style={{
            padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500,
            border: t === 'All' ? '1.5px solid #d97706' : '1px solid #e5e7eb',
            background: t === 'All' ? '#fef3c7' : '#fff',
            color: t === 'All' ? '#d97706' : '#6b7280', cursor: 'pointer',
          }}>{t}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
          border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px' }}>
          <Search size={14} color="#9ca3af" />
          <input placeholder="Search agreements…" style={{ border: 'none', outline: 'none', fontSize: '0.82rem', background: 'transparent', width: 180 }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
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
              {['Customer', 'Product', 'Unit Price', 'Min Qty', 'Valid From', 'Valid Until', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <Tag size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <div style={{ fontWeight: 500 }}>No pricing agreements</div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  Create customer-specific prices that override the default pricing rules
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceAgreementsPage;
