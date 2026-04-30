import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { grnService } from '../../services/grn_services';
import useGoodsReceiptFilters from '../../hooks/useGoodsReceiptFilters';
import type { GoodsReceipt, GoodsReceiptStatus } from '../../types/grn_models';
import ProcurementToolbar from '../../components/toolbar';
import type { StatusTabConfig } from '../../components/toolbar';
import GoodsReceiptsTable from '../../components/GoodsReceiptsTable';
import '../../styles/procurement.css';

const GRN_STATUS_TABS: StatusTabConfig[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Part. Received', value: 'Partially Received' },
  { label: 'Received', value: 'Received' },
];

interface GoodsReceiptsPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const GoodsReceiptsPage: React.FC<GoodsReceiptsPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const filters = useGoodsReceiptFilters();

  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const countsLoaded = useRef(false);

  useEffect(() => {
    filters.setFilter('warehouse_id', activeWarehouse?.id ?? '');
  }, [activeWarehouse?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      filters.setFilter('search', searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = filters.getApiQueryParams();
      const result = await grnService.fetchReceipts(params);
      setReceipts(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load goods receipts');
      console.error('Fetch goods receipts error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchCounts = useCallback(async () => {
    try {
      const statuses: (GoodsReceiptStatus | '')[] = [
        '',
        'Draft',
        'Confirmed',
        'Rejected',
        'Partially Received',
        'Received',
      ];
      const results = await Promise.allSettled(
        statuses.map((status) =>
          grnService.fetchReceipts({
            ...(status ? { status } : {}),
            warehouse_id: activeWarehouse?.id ?? '',
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
  }, [activeWarehouse?.id]);

  useEffect(() => {
    if (!countsLoaded.current && activeWarehouse?.id) {
      countsLoaded.current = true;
      fetchCounts();
    }
  }, [fetchCounts, activeWarehouse?.id]);

  useEffect(() => {
    countsLoaded.current = false;
    setStatusCounts({});
  }, [activeWarehouse?.id]);

  const handleStatusChange = (status: string) => {
    filters.setFilter('status', status as GoodsReceiptStatus | '');
  };

  const handlePageChange = (page: number) => {
    filters.setFilter('page', page);
  };

  if (!activeWarehouse?.id) {
    return (
      <div className="procurement-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state__icon">
            <AlertTriangle size={48} color="#f59e0b" />
          </div>
          <h3 className="empty-state__title">No Warehouse Selected</h3>
          <p className="empty-state__description">
            Please select a warehouse from the sidebar to view goods receipts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <h1>Goods Receipts</h1>
            <p className="procurement-page-header__breadcrumb">
              Procurement / Goods Receipts
            </p>
          </div>
          <div className="procurement-page-header__actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate('/procurement/goods-receipts/new')}
            >
              <Plus size={18} />
              Receive Goods
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

        <ProcurementToolbar
          searchTerm={searchInput}
          onSearchChange={setSearchInput}
          activeStatus={filters.filters.status}
          onStatusChange={handleStatusChange}
          statusCounts={statusCounts}
          placeholder="Search GR, PO number…"
          tabs={GRN_STATUS_TABS}
        />
      </div>

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
            <span>Loading goods receipts…</span>
          </div>
        ) : (
          <GoodsReceiptsTable
            receipts={receipts}
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

export default GoodsReceiptsPage;
