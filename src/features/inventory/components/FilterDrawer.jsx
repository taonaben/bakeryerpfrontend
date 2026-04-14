import React, { useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useBatchFilters } from '../hooks/useBatchFilters';
import { useStockFilters } from '../hooks/useStockFilters';
import { useMovementFilters } from '../hooks/useMovementFilters';
import BatchesFilterPanel from './filters/BatchesFilterPanel';
import StockFilterPanel from './filters/StockFilterPanel';
import MovementsFilterPanel from './filters/MovementsFilterPanel';
import './FilterDrawer.css';

const TAB_LABELS = {
  batches: 'Batch filters',
  balances: 'Stock balance filters',
  movements: 'Movement filters',
};

const FilterDrawer = ({ isOpen, onClose, activeTab }) => {
  const batchFilters = useBatchFilters();
  const stockFilters = useStockFilters();
  const movementFilters = useMovementFilters();

  const drawerRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus within drawer when open
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  const activeFilterCount = {
    batches: batchFilters.activeFilterCount(),
    balances: stockFilters.activeFilterCount(),
    movements: movementFilters.activeFilterCount(),
  }[activeTab] ?? 0;

  const handleClearAll = () => {
    if (activeTab === 'batches') batchFilters.clearAllFilters();
    else if (activeTab === 'balances') stockFilters.clearAllFilters();
    else if (activeTab === 'movements') movementFilters.clearAllFilters();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="filter-drawer-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`filter-drawer ${isOpen ? 'filter-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter options"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="filter-drawer-header">
          <div className="filter-drawer-title-row">
            <h2 className="filter-drawer-title">
              {TAB_LABELS[activeTab] || 'Filters'}
            </h2>
            {activeFilterCount > 0 && (
              <span className="filter-drawer-count-badge" aria-label={`${activeFilterCount} active filters`}>
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            type="button"
            className="filter-drawer-close"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="filter-drawer-body">
          {activeTab === 'batches' && <BatchesFilterPanel />}
          {activeTab === 'balances' && <StockFilterPanel />}
          {activeTab === 'movements' && <MovementsFilterPanel />}
        </div>

        {/* Footer */}
        <div className="filter-drawer-footer">
          <button
            type="button"
            className="filter-drawer-clear-btn"
            onClick={handleClearAll}
            disabled={activeFilterCount === 0}
          >
            <Trash2 size={14} />
            Clear all filters
            {activeFilterCount > 0 && (
              <span className="filter-drawer-clear-count">({activeFilterCount})</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;
