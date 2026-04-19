import React, { useState } from 'react';
import { Plus, Star, Package } from 'lucide-react';
import type { SupplierProduct } from '../../types/models';
import AddProductModal from './AddProductModal';

interface ProductsSectionProps {
  supplierId: string;
  products: SupplierProduct[];
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ supplierId, products }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="detail-section">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <h2 className="section-title" style={{ margin: 0 }}>
          Products
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        >
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: '#6b7280',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #d1d5db',
          }}
        >
          <Package size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>No products linked to this supplier yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="line-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit Price</th>
                <th>Lead Time</th>
                <th>Preferred</th>
                <th>Status</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.product_name}</td>
                  <td>{p.price}</td>
                  <td>
                    {p.lead_time_days != null && p.lead_time_days > 0
                      ? `${p.lead_time_days} day${p.lead_time_days !== 1 ? 's' : ''}`
                      : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td>
                    {p.is_preferred ? (
                      <span title="Preferred supplier for this product" aria-label="Preferred">
                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${p.is_active ? 'active' : 'inactive'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplierId={supplierId}
      />
    </section>
  );
};

export default ProductsSection;
