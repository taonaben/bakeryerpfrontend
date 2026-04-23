import React from 'react';
import { Search } from 'lucide-react';

// ──────────────────────────────────────────────
// Status tabs configuration
// ──────────────────────────────────────────────

export interface StatusTabConfig {
  label: string;
  value: string;
}

const DEFAULT_TABS: StatusTabConfig[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Converted', value: 'Converted' },
];

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface ProcurementToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  statusCounts?: Record<string, number>;
  placeholder?: string;
  tabs?: StatusTabConfig[];
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const ProcurementToolbar: React.FC<ProcurementToolbarProps> = ({
  searchTerm,
  onSearchChange,
  activeStatus,
  onStatusChange,
  statusCounts,
  placeholder = 'Search…',
  tabs = DEFAULT_TABS,
}) => {
  return (
    <div className="procurement-toolbar">
      <div className="procurement-toolbar__left">
        <div className="status-tabs">
          {tabs.map((tab) => {
            const count = statusCounts?.[tab.value];
            const isActive = activeStatus === tab.value;
            return (
              <button
                key={tab.value}
                className={`status-tab${isActive ? ' active' : ''}`}
                onClick={() => onStatusChange(tab.value)}
                aria-pressed={isActive}
                type="button"
              >
                {tab.label}
                {count !== undefined && (
                  <span className="tab-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="procurement-toolbar__right">
        <div className="search-bar">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            aria-label="Search requisitions"
          />
        </div>
      </div>
    </div>
  );
};

export default ProcurementToolbar;
