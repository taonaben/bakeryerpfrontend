import React from 'react';
import { Truck, Filter, Search } from 'lucide-react';

const DeliveriesPage: React.FC = () => {
  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '10px',
            background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Truck size={22} color="#3b82f6" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Deliveries</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
              Track dispatched deliveries and confirm receipts
            </p>
          </div>
        </div>
      </div>

      {/* Status chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['All', 'Dispatched', 'Delivered', 'Failed'].map((s) => (
          <button key={s} style={{
            padding: '5px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500,
            border: s === 'All' ? '1.5px solid #3b82f6' : '1px solid #e5e7eb',
            background: s === 'All' ? '#eff6ff' : '#fff',
            color: s === 'All' ? '#3b82f6' : '#6b7280', cursor: 'pointer',
          }}>{s}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
          border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px' }}>
          <Search size={14} color="#9ca3af" />
          <input placeholder="Search deliveries…" style={{ border: 'none', outline: 'none', fontSize: '0.82rem', background: 'transparent', width: 160 }} />
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
              {['Delivery #', 'Order #', 'Warehouse', 'Status', 'Dispatched At', 'Delivered At', ''].map((h) => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <Truck size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <div style={{ fontWeight: 500 }}>No deliveries found</div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Deliveries are created automatically when an order is dispatched</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveriesPage;
