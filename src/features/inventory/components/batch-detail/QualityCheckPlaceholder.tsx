/**
 * Quality Check Placeholder
 * Future feature stub for quality certifications
 */

import React from 'react';
import { CheckCircle, Lock } from 'lucide-react';

const QualityCheckPlaceholder: React.FC = () => {
  return (
    <div className="placeholder-card">
      <div className="placeholder-icon">
        <CheckCircle size={40} />
      </div>
      <div className="placeholder-content">
        <h3>Quality Certifications & Inspections</h3>
        <p>
          Track quality checks, certifications, and inspection results for this batch.
        </p>
        <div className="placeholder-status">
          <Lock size={16} />
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default QualityCheckPlaceholder;
