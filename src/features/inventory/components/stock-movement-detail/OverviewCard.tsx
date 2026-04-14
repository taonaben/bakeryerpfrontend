/**
 * Overview Card - Stock Movement
 * Displays all movement fields in a read-only grid layout
 */

import React from 'react';
import { StockMovementDetailResponse } from '../../types/stockMovementDetail';

interface OverviewCardProps {
  movement: StockMovementDetailResponse;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ movement }) => {
  const getMovementTypeColor = (type: string): string => {
    switch (type) {
      case 'IN':
        return 'movement-type-in';
      case 'OUT':
        return 'movement-type-out';
      case 'ADJUSTMENT':
        return 'movement-type-adjustment';
      default:
        return 'movement-type-neutral';
    }
  };

  const getMovementTypeLabel = (type: string): string => {
    switch (type) {
      case 'IN':
        return 'Stock In';
      case 'OUT':
        return 'Stock Out';
      case 'ADJUSTMENT':
        return 'Adjustment';
      default:
        return type;
    }
  };

  return (
    <div className="overview-card">
      <div className="overview-grid">
        {/* Row 1 */}
        <div className="overview-item">
          <label className="overview-label">Movement Type</label>
          <div className="overview-value">
            <span className={`badge ${getMovementTypeColor(movement.movement_type)}`}>
              {getMovementTypeLabel(movement.movement_type)}
            </span>
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Total Quantity</label>
          <div
            className="overview-value"
            style={{ fontWeight: '700', color: movement.total_quantity < 0 ? '#ef4444' : '#10b981' }}
          >
            {typeof movement.total_quantity === 'string'
              ? parseFloat(movement.total_quantity).toLocaleString()
              : movement.total_quantity.toLocaleString()}
          </div>
        </div>

        {/* Row 2 */}
        <div className="overview-item">
          <label className="overview-label">Reference Number</label>
          <div className="overview-value">
            <code>{movement.reference_number}</code>
          </div>
        </div>

        <div className="overview-item">
          <label className="overview-label">Batches Count</label>
          <div className="overview-value">{movement.batches_detail.length} batch(es)</div>
        </div>

        {/* Row 3 */}
        <div className="overview-item full-width">
          <label className="overview-label">Notes</label>
          <div className="overview-value">
            {movement.notes && movement.notes.trim() ? (
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{movement.notes}</p>
            ) : (
              <span className="text-muted">---</span>
            )}
          </div>
        </div>

        {/* Row 4 */}
        <div className="overview-item full-width">
          <label className="overview-label">Movement ID (Full)</label>
          <div className="overview-value">
            <code className="full-id">{movement.id}</code>
          </div>
        </div>
      </div>

      {/* Audit Info Footer */}
      <div className="overview-audit">
        <div className="audit-item">
          <span className="audit-label">Created:</span>
          <span className="audit-value">
            {new Date(movement.created_at).toLocaleDateString()} at{' '}
            {new Date(movement.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {movement.updated_at && (
          <div className="audit-item">
            <span className="audit-label">Last Updated:</span>
            <span className="audit-value">
              {new Date(movement.updated_at).toLocaleDateString()} at{' '}
              {new Date(movement.updated_at).toLocaleTimeString([], {
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
