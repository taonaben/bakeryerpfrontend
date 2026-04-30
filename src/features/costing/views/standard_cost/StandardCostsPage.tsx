import React, { useEffect, useState, useCallback } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useStandardCostsStore } from '../../stores/standardCostsStore';
import useStandardCostFilters from '../../hooks/useStandardCostFilters';
import StandardCostsTable from '../../components/StandardCostsTable';
import '../../styles/costing.css';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Superseded', value: 'superseded' },
];

const StandardCostsPage: React.FC = () => {
  const { items, isLoading, error, totalPages, fetchAll } = useStandardCostsStore();
  const filters = useStandardCostFilters();

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

  useEffect(() => { load(); }, [load]);

  return (
    <div className="costing-page">
      <div className="costing-sticky-stack">
        <div className="costing-page-header">
          <div className="costing-page-header__left">
            <h1>Standard Costs</h1>
            <p className="costing-page-header__breadcrumb">Costing / Standard Costs</p>
          </div>
        </div>

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
                placeholder="Search product, formula…"
                aria-label="Search standard costs"
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
            <span>Loading standard costs…</span>
          </div>
        ) : (
          <StandardCostsTable
            items={items}
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

export default StandardCostsPage;
