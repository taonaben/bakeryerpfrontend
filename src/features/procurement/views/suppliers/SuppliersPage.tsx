import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { supplierService } from '../../services/suppliers_services';
import useSupplierFilters from '../../hooks/useSupplierFilters';
import type { Supplier } from '../../types/models';
import SuppliersTable from '../../components/SuppliersTable';
import '../../styles/procurement.css';

// ──────────────────────────────────────────────
// Tab definitions
// ──────────────────────────────────────────────

type ActiveTab = 'all' | 'active' | 'inactive';

interface TabDef {
  id: ActiveTab;
  label: string;
  isActive: 'true' | 'false' | '';
}

const TABS: TabDef[] = [
  { id: 'all', label: 'All', isActive: '' },
  { id: 'active', label: 'Active', isActive: 'true' },
  { id: 'inactive', label: 'Inactive', isActive: 'false' },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const filters = useSupplierFilters();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  // Derive active tab from filter state
  const activeTab: ActiveTab =
    filters.filters.is_active === 'true'
      ? 'active'
      : filters.filters.is_active === 'false'
        ? 'inactive'
        : 'all';

  // Debounce search → filter sync
  useEffect(() => {
    const timer = setTimeout(() => {
      filters.setFilter('search', searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─── Fetch suppliers on filter change ────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filters.getApiQueryParams();
      const result = await supplierService.fetchSuppliers(params);
      setSuppliers(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load suppliers');
      console.error('Fetch suppliers error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Handlers ────────────────────────────────

  const handleTabChange = (tab: ActiveTab) => {
    const def = TABS.find((t) => t.id === tab)!;
    filters.setFilter('is_active', def.isActive);
  };

  const handlePageChange = (page: number) => {
    filters.setFilter('page', page);
  };

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        {/* Page Header */}
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <h1>Suppliers</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Suppliers
            </p>
          </div>
          <div className="procurement-page-header__actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/procurement/suppliers/new')}
              type="button"
            >
              <Plus size={18} />
              Add Supplier
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="procurement-toolbar">
          <div className="procurement-toolbar__left">
            <div className="status-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`status-tab${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="procurement-toolbar__right">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search suppliers…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search suppliers"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="procurement-content">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={fetchData} type="button">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading suppliers…</span>
          </div>
        ) : (
          <SuppliersTable
            suppliers={suppliers}
            currentPage={filters.filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default SuppliersPage;
