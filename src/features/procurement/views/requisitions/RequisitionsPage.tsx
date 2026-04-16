import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal } from 'lucide-react';
import { requisitionService } from '../../services/procurement_services';
import useRequisitionFilters from '../../hooks/useRequisitionFilters';
import type { PurchaseRequisition, RequisitionStatus } from '../../types/models';
import ProcurementToolbar from '../../components/toolbar';
import RequisitionsTable from '../../components/RequisitionsTable';
import '../../styles/procurement.css';

const RequisitionsPage: React.FC = () => {
  const navigate = useNavigate();
  const filters = useRequisitionFilters();

  // Data state
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local search state (debounced)
  const [searchInput, setSearchInput] = useState('');

  // Debounce search → filter sync
  useEffect(() => {
    const timer = setTimeout(() => {
      filters.setFilter('search', searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Status counts — fetched once on mount, refreshed only after mutations
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const countsLoaded = useRef(false);

  // ─── Fetch requisitions on filter change ────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = filters.getApiQueryParams();
      const result = await requisitionService.fetchRequisitions(params);
      setRequisitions(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load requisitions');
      console.error('Fetch requisitions error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Fetch counts once on mount ─────────────
  const fetchCounts = useCallback(async () => {
    try {
      const statuses: (RequisitionStatus | '')[] = ['', 'Draft', 'Submitted', 'Approved', 'Rejected', 'Converted'];
      const results = await Promise.allSettled(
        statuses.map((status) =>
          requisitionService.fetchRequisitions({
            ...(status ? { status } : {}),
            page: 1,
            page_size: 1,
          }),
        ),
      );

      const counts: Record<string, number> = {};
      statuses.forEach((status, i) => {
        const r = results[i];
        if (r.status === 'fulfilled') {
          counts[status] = r.value.count;
        }
      });
      setStatusCounts(counts);
    } catch {
      // Non-critical — tabs just won't show counts
    }
  }, []);

  useEffect(() => {
    if (!countsLoaded.current) {
      countsLoaded.current = true;
      fetchCounts();
    }
  }, [fetchCounts]);

  // ─── Handlers ───────────────────────────────
  const handleStatusChange = (status: RequisitionStatus | '') => {
    filters.setFilter('status', status);
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
            <h1>Purchase Requisitions</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Requisitions
            </p>
          </div>
          <div className="procurement-page-header__actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/procurement/requisitions/new')}
              type="button"
            >
              <Plus size={18} />
              New Requisition
            </button>
            <button
              className="btn btn-outline"
              type="button"
              aria-label="More actions"
              title="More actions"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar — status tabs + search */}
        <ProcurementToolbar
          searchTerm={searchInput}
          onSearchChange={setSearchInput}
          activeStatus={filters.filters.status}
          onStatusChange={handleStatusChange}
          statusCounts={statusCounts}
          placeholder="Search PR number, title…"
        />
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
            <span>Loading requisitions…</span>
          </div>
        ) : (
          <RequisitionsTable
            requisitions={requisitions}
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

export default RequisitionsPage;

