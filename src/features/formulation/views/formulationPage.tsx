
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal } from 'lucide-react';
import ProcurementToolbar from '@/features/procurement/components/toolbar';
import useFormulaFilters from '../hooks/useFormulaFilters';
import { formulationService } from '../services/formulationService';
import type { FormulaStatus } from '../types/models';
import FormulasTable from '../components/FormulasTable';
import '@/features/procurement/styles/procurement.css';
import '@/features/inventory/styles/inventory.css';
import '../styles/formulation.css';

const FORMULA_STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Archived', value: 'archived' },
  { label: 'Deactivated', value: 'deactivated' },
];

const FormulationPage: React.FC = () => {
  const navigate = useNavigate();
  const filters = useFormulaFilters();

  const [formulas, setFormulas] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const countsLoaded = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      filters.setFilter('search', searchInput);
    }, 350);

    return () => clearTimeout(timer);
  }, [filters, searchInput]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = filters.getApiQueryParams();
      const result = await formulationService.fetchFormulas(params);
      setFormulas(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load formulas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCounts = useCallback(async () => {
    try {
      const statuses: Array<FormulaStatus | ''> = ['', 'draft', 'active', 'on_hold', 'archived', 'deactivated'];
      const results = await Promise.allSettled(
        statuses.map((status) =>
          formulationService.fetchFormulas({
            ...(status ? { status } : {}),
            page: 1,
            page_size: 1,
          }),
        ),
      );

      const counts: Record<string, number> = {};
      statuses.forEach((status, index) => {
        const result = results[index];
        if (result.status === 'fulfilled') {
          counts[status] = result.value.count;
        }
      });

      setStatusCounts(counts);
    } catch {
      // Counts are a nice-to-have; keep the page usable if they fail.
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!countsLoaded.current) {
      countsLoaded.current = true;
      fetchCounts();
    }
  }, [fetchCounts]);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchData(), fetchCounts()]);
  }, [fetchCounts, fetchData]);

  const handleStatusChange = (status: string) => {
    filters.setFilter('status', status);
  };

  const handlePageChange = (page: number) => {
    filters.setFilter('page', page);
  };

  return (
    <div className="procurement-page formulation-page">
      <div className="procurement-sticky-stack">
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <h1>Formulas</h1>
            <p className="procurement-page-header__breadcrumb">Formulation / Formulas</p>
          </div>
          <div className="procurement-page-header__actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/formulation/new')}
            >
              <Plus size={18} />
              New Formula
            </button>
            <button className="btn btn-outline" type="button" aria-label="More actions">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <ProcurementToolbar
          searchTerm={searchInput}
          onSearchChange={setSearchInput}
          activeStatus={filters.filters.status}
          onStatusChange={handleStatusChange}
          statusCounts={statusCounts}
          placeholder="Search formulas by name or product…"
          tabs={FORMULA_STATUS_TABS}
        />
      </div>

      <div className="procurement-content">
        {error && (
          <div className="error-banner">
            {error}
            <button type="button" onClick={fetchData} style={{ marginLeft: 12 }}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading formulas…</span>
          </div>
        ) : (
          <FormulasTable
            formulas={formulas}
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

export default FormulationPage;
