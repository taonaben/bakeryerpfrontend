/**
 * Lot Tracking Placeholder
 * Future feature stub for lot & traceability
 */

import React from 'react';
import { Link, Lock } from 'lucide-react';

const LotTrackingPlaceholder: React.FC = () => {
  return (
    <div className="placeholder-card">
      <div className="placeholder-icon">
        <Link size={40} />
      </div>
      <div className="placeholder-content">
        <h3>Lot & Traceability Documents</h3>
        <p>
          Track parent/child batch relationships, split/merge operations, and supply chain lineage.
        </p>
        <div className="placeholder-status">
          <Lock size={16} />
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default LotTrackingPlaceholder;
