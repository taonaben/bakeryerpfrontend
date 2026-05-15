import React from 'react';
import { Plus, Search } from 'lucide-react';

interface InventoryListToolbarTab {
  label: string;
  value: string;
}

interface InventoryListToolbarSortOption {
  label: string;
  value: string;
}

interface InventoryListToolbarAction {
  label: string;
  onClick: () => void;
}

interface InventoryListToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  tabs: InventoryListToolbarTab[];
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: InventoryListToolbarSortOption[];
  placeholder: string;
  action?: InventoryListToolbarAction;
}

const InventoryListToolbar: React.FC<InventoryListToolbarProps> = ({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  tabs,
  sortValue,
  onSortChange,
  sortOptions,
  placeholder,
  action,
}) => (
  <div className="products-toolbar inventory-list-toolbar">
    <div className="products-toolbar__left">
      <div className="status-tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              className={`status-tab${isActive ? ' active' : ''}`}
              onClick={() => onTabChange(tab.value)}
              aria-pressed={isActive}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>

    <div className="products-toolbar__right">
      <select
        className="toolbar-select"
        value={sortValue}
        onChange={(event) => onSortChange(event.target.value)}
        aria-label="Sort list"
      >
        <option value="">Default sort</option>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="search-bar">
        <Search size={16} color="#64748b" />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </div>

      {action && (
        <button className="btn btn-primary inventory-list-toolbar__action" type="button" onClick={action.onClick}>
          <Plus size={18} />
          {action.label}
        </button>
      )}
    </div>
  </div>
);

export default InventoryListToolbar;
