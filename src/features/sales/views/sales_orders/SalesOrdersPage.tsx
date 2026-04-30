import React from 'react';
import { ShoppingCart, Plus, Filter, Search } from 'lucide-react';

const SalesOrdersPage: React.FC = () => {
  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '10px',
            background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingCart size={22} color="#10b981" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Sales Orders</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
              Create and manage B2B and POS sales orders
            </p>
          </div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 16px', background: '#10b981', color: '#fff',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
        }}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Filters bar */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '20px',
        padding: '14px 16px', background: 'var(--bg-secondary, #fff)',
        border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1,
          border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px' }}>
          <Search size={15} color="#9ca3af" />
          <input placeholder="Search orders…" style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', background: 'transparent' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
          border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
          <Filter size={14} /> Filters
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
              {['Order #', 'Customer', 'Warehouse', 'Type', 'Status', 'Date', 'Total', ''].map((h) => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <ShoppingCart size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <div style={{ fontWeight: 500 }}>No sales orders yet</div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Create your first order to get started</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesOrdersPage;
