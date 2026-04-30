/**
 * Overview Card — Requisition Detail
 * Read-only grid of requisition fields + line items table
 */

import React from 'react';
import type { PurchaseRequisition } from '../../types/models';

interface OverviewCardProps {
  requisition: PurchaseRequisition;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ requisition }) => {
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="overview-card">
      {/* Requisition Fields Grid */}
      <div className="overview-grid">
        <div className="overview-item">
          <label className="overview-label">Title</label>
          <div className="overview-value">{requisition.title || '—'}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">PR Number</label>
          <div className="overview-value">
            <code>{requisition.pr_number}</code>
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Warehouse</label>
          <div className="overview-value">{requisition.warehouse_name || '—'}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Requested By</label>
          <div className="overview-value">{requisition.requested_by_name || '—'}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Status</label>
          <div className="overview-value">
            <span className={`badge ${requisition.status.toLowerCase()}`}>{requisition.status}</span>
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Created</label>
          <div className="overview-value">{formatDate(requisition.created_at)}</div>
        </div>

        {requisition.description && (
          <div className="overview-item full-width">
            <label className="overview-label">Description</label>
            <div className="overview-value">{requisition.description}</div>
          </div>
        )}
      </div>

      {/* Line Items Table */}
      <div className="line-items-section">
        <h3 className="line-items-heading">
          Line Items
          <span className="line-items-count">{requisition.line_items?.length ?? 0}</span>
        </h3>

        {requisition.line_items && requisition.line_items.length > 0 ? (
          <table className="line-items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>UoM</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {requisition.line_items.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-muted">{index + 1}</td>
                  <td className="product-cell">{item.product_name || item.product}</td>
                  <td className="quantity-cell">{Number(item.quantity).toLocaleString()}</td>
                  <td>{item.unit_of_measure || '—'}</td>
                  <td className="text-muted">{item.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state-card">No line items</div>
        )}
      </div>

      {/* Audit Footer */}
      <div className="overview-audit">
        <div className="audit-item">
          <span className="audit-label">Created:</span>
          <span className="audit-value">{formatDate(requisition.created_at)}</span>
        </div>
        {requisition.updated_at && (
          <div className="audit-item">
            <span className="audit-label">Last Updated:</span>
            <span className="audit-value">{formatDate(requisition.updated_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewCard;
