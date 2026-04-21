import React from 'react';
import { Search } from 'lucide-react';

interface ProductsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  category?: string;
  onCategoryChange?: (value: string) => void;
  statusCounts?: Record<string, number>;
  placeholder?: string;
}

const ProductsToolbar: React.FC<ProductsToolbarProps> = ({
  searchTerm,
  onSearchChange,
  activeStatus,
  onStatusChange,
  category = '',
  onCategoryChange,
  statusCounts,
  placeholder = 'Search by SKU or name...',
}) => {
  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Has Reorder Policy', value: 'reorder' },
    { label: 'No Reorder Policy', value: 'no-reorder' },
  ];

  return (
    <div className="products-toolbar">
      <div className="products-toolbar__left">
        <div className="status-tabs">
          {statusOptions.map((tab) => {
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

      <div className="products-toolbar__right">
        <select
          className="toolbar-select"
          value={category}
          onChange={(e) => onCategoryChange?.(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          <option value="bakery">Bakery</option>
          <option value="ingredients">Ingredients</option>
          <option value="packaging">Packaging</option>
        </select>

        <div className="search-bar">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            aria-label="Search products"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsToolbar;
