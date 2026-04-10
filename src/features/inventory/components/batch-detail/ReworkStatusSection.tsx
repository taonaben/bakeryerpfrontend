/**
 * Rework Status Section
 * Shows rework flag information when batch has been reworked
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { BatchDetailResponse } from '../../types/batchDetail';

interface ReworkStatusSectionProps {
  batch: BatchDetailResponse;
}

const ReworkStatusSection: React.FC<ReworkStatusSectionProps> = ({ batch }) => {
  return (
    <div className="rework-status-section">
      <div className="rework-alert">
        <div className="rework-alert__icon">
          <RefreshCw size={24} />
        </div>
        <div className="rework-alert__content">
          <h3>Rework Flagged</h3>
          <p>
            This batch has been flagged for rework. The quantity has been set to zero and this batch
            is no longer available for use.
          </p>
          <div className="rework-metadata">
            <div className="rework-item">
              <span className="label">Current Quantity:</span>
              <span className="value">{parseFloat(batch.quantity as any).toLocaleString()}</span>
            </div>
            {/* TODO: Link to rework order when order tracking is implemented */}
            {/* <div className="rework-item">
              <span className="label">Rework Order:</span>
              <a href={`/production/rework-orders/${batch.rework_order_id}`}>
                View Rework Order
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReworkStatusSection;
