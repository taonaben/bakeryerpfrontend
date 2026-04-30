/**
 * Shelf-Life Placeholder
 * Future feature stub for shelf-life management
 */

import React from 'react';
import { Clock, Lock } from 'lucide-react';

const ShelfLifePlaceholder: React.FC = () => {
  return (
    <div className="placeholder-card">
      <div className="placeholder-icon">
        <Clock size={40} />
      </div>
      <div className="placeholder-content">
        <h3>Shelf-Life Alerts & Management</h3>
        <p>
          Automatic alerts for approaching expiry dates, FIFO recommendations, and shelf-life tracking.
        </p>
        <div className="placeholder-status">
          <Lock size={16} />
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default ShelfLifePlaceholder;
