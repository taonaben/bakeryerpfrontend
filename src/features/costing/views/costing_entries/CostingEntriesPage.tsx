import React, { useEffect, useState, useCallback } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useCostingEntriesStore } from '../../stores/costingEntriesStore';
import useCostingEntryFilters from '../../hooks/useCostingEntryFilters';
import CostingEntriesTable from '../../components/costing_entries/CostingEntriesTable';
import '../../styles/costing.css';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Costed', value: 'costed' },
  { label: 'Pending', value: 'pending' },
];

const CostingEntriesPage: React.FC = () => {
  const { items, isLoading, error, totalPages, fetchAll } = useCostingEntriesStore();
  const filters = useCostingEntryFilters();

  const [searchInput, setSearchInput] = useState('');
  const [activeStatus, setActiveStatus] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => filters.setFilter('search', searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(() => {
    fetchAll(filters.getApiParams(), true);
  }, [filters.filters]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="costing-page">
      <div className="costing-sticky-stack">
        {/* Header */}
        <div className="costing-page-header">
          <div className="costing-page-header__left">
            <h1>Costing Entries</h1>
            <p className="costing-page-header__breadcrumb">Costing / Costing Entries</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="costing-toolbar">
          <div className="costing-toolbar__left">
            <div className="status-tabs">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  className={`status-tab${activeStatus === tab.value ? ' active' : ''}`}
                  onClick={() => setActiveStatus(tab.value)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="costing-toolbar__right">
            <div className="search-bar">
              <Search size={15} color="#64748b" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search batch, product…"
                aria-label="Search costing entries"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="costing-content">
        {error && (
          <div className="costing-error-banner">
            <AlertCircle size={18} />
            {error}
            <button onClick={load} type="button">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="costing-loading">
            <div className="costing-spinner" />
            <span>Loading costing entries…</span>
          </div>
        ) : (
          <CostingEntriesTable
            entries={items}
            currentPage={filters.filters.page ?? 1}
            totalPages={totalPages}
            onPageChange={(p) => filters.setFilter('page', p)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default CostingEntriesPage;
