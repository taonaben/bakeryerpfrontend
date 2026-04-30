/**
 * Overview Card
 * Displays all batch fields in a read-only grid layout
 */

import React from 'react';
import { BatchDetailResponse } from '../../types/batchDetail';
import { getExpiryStatus } from '../../utils/getExpiryStatus';

interface OverviewCardProps {
  batch: BatchDetailResponse;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ batch }) => {
  const expiryStatus = getExpiryStatus(batch.expiry_date);
  const expiryDate = new Date(batch.expiry_date);
  const manufactureddateDate = new Date(batch.manufacture_date);

  return (
    <div className="overview-card">
      <div className="overview-grid">
        {/* Row 1 */}
        <div className="overview-item">
          <label className="overview-label">Batch Number</label>
          <div className="overview-value">
            <code>{batch.batch_number}</code>
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Quantity</label>
          <div className="overview-value">
            <span className="quantity">{parseFloat(batch.quantity as any).toLocaleString()}</span>
          </div>
        </div>

        {/* Row 2 */}
        <div className="overview-item">
          <label className="overview-label">Product</label>
          <div className="overview-value">{batch.product_name || batch.product}</div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Warehouse</label>
          <div className="overview-value">{batch.warehouse_name || batch.warehouse}</div>
        </div>

        {/* Row 3 */}
        <div className="overview-item">
          <label className="overview-label">Manufacture Date</label>
          <div className="overview-value">
            {manufactureddateDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Expiry Date</label>
          <div className={`overview-value expiry-${expiryStatus}`}>
            <span>
              {expiryDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            {expiryStatus === 'expired' && <span className="expiry-badge expired">EXPIRED</span>}
            {expiryStatus === 'near' && <span className="expiry-badge near">NEAR EXPIRY</span>}
          </div>
        </div>

        {/* Row 4 */}
        <div className="overview-item full-width">
          <label className="overview-label">Batch ID (Full)</label>
          <div className="overview-value">
            <code className="full-id">{batch.id}</code>
          </div>
        </div>

        {/* Row 5 - Rework Flag */}
        {batch.rework_consumed && (
          <div className="overview-item full-width rework-flag">
            <label className="overview-label">Rework Status</label>
            <div className="overview-value">
              <span className="badge rework">This batch was flagged for rework</span>
            </div>
          </div>
        )}
      </div>

      {/* Audit Info Footer */}
      <div className="overview-audit">
        <div className="audit-item">
          <span className="audit-label">Created:</span>
          <span className="audit-value">
            {new Date(batch.created_at).toLocaleDateString()} at{' '}
            {new Date(batch.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        {batch.updated_at && (
          <div className="audit-item">
            <span className="audit-label">Updated:</span>
            <span className="audit-value">
              {new Date(batch.updated_at).toLocaleDateString()} at{' '}
              {new Date(batch.updated_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewCard;
