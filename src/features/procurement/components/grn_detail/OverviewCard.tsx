import React from 'react';
import { Package, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import type { GoodsReceipt } from '../../types/grn_models';

interface GRNOverviewCardProps {
  goodsReceipt: GoodsReceipt;
}

const GRNOverviewCard: React.FC<GRNOverviewCardProps> = ({ goodsReceipt }) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusClass = (status: string) => status.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="overview-card">
      <div className="overview-grid">
        <div className="overview-item">
          <span className="overview-label">
            <Package size={16} /> GR Number
          </span>
          <span className="overview-value">{goodsReceipt.gr_number}</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">
            <FileText size={16} /> PO Reference
          </span>
          <span className="overview-value">{goodsReceipt.purchase_order_number}</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">Supplier</span>
          <span className="overview-value">{goodsReceipt.supplier_name}</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">Warehouse</span>
          <span className="overview-value">{goodsReceipt.warehouse_name}</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">
            <Calendar size={16} /> Received Date
          </span>
          <span className="overview-value">{formatDate(goodsReceipt.received_date)}</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">
            <User size={16} /> Received By
          </span>
          <span className="overview-value">{goodsReceipt.received_by_name}</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">Status</span>
          <span className={`badge ${statusClass(goodsReceipt.status)}`}>
            {goodsReceipt.status}
          </span>
        </div>

        <div className="overview-item">
          <span className="overview-label">Item Count</span>
          <span className="overview-value">{goodsReceipt.item_count}</span>
        </div>

        {goodsReceipt.description && (
          <div className="overview-item overview-item--full">
            <span className="overview-label">Description</span>
            <span className="overview-value">{goodsReceipt.description}</span>
          </div>
        )}

        {goodsReceipt.rejection_reason && (
          <div className="overview-item overview-item--full">
            <span className="overview-label">
              <AlertCircle size={16} /> Rejection Reason
            </span>
            <span className="overview-value rejection-reason">{goodsReceipt.rejection_reason}</span>
          </div>
        )}
      </div>

      {goodsReceipt.line_items && goodsReceipt.line_items.length > 0 && (
        <div className="line-items-section">
          <h3 className="section-subtitle">Line Items</h3>
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Received</th>
                  <th>Unit</th>
                  <th>Batch Ref</th>
                  <th>Mfg Date</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {goodsReceipt.line_items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity_received}</td>
                    <td>{item.unit_of_measure}</td>
                    <td>{item.supplier_batch_ref || '—'}</td>
                    <td>{formatDate(item.manufacturing_date)}</td>
                    <td>{formatDate(item.expiry_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNOverviewCard;
