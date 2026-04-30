import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MoreHorizontal, Plus } from 'lucide-react';
import { supplierInvoiceService } from '../../services/supplier_invoices_services';
import useSupplierInvoiceFilters from '../../hooks/useSupplierInvoiceFilters';
import type { SupplierInvoice, SupplierInvoiceStatus } from '../../types/supplier_invoices_model';
import ProcurementToolbar from '../../components/toolbar';
import type { StatusTabConfig } from '../../components/toolbar';
import SupplierInvoicesTable from '../../components/SupplierInvoicesTable';
import '../../styles/procurement.css';

const INVOICE_STATUS_TABS: StatusTabConfig[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Rejected', value: 'Rejected' },
];

interface SupplierInvoicesPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const SupplierInvoicesPage: React.FC<SupplierInvoicesPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const filters = useSupplierInvoiceFilters();

  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
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
      const result = await supplierInvoiceService.fetchInvoices(params);
      setInvoices(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load supplier invoices');
      console.error('Fetch supplier invoices error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchCounts = useCallback(async () => {
    try {
      const statuses: (SupplierInvoiceStatus | '')[] = ['', 'Draft', 'Approved', 'Paid', 'Rejected'];
      const results = await Promise.allSettled(
        statuses.map((status) =>
          supplierInvoiceService.fetchInvoices({
            ...(status ? { status } : {}),
            warehouse_id: activeWarehouse?.id ?? '',
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
      // non-critical
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
    filters.setFilter('status', status as SupplierInvoiceStatus | '');
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
            Please select a warehouse from the sidebar to view supplier invoices.
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
            <h1>Supplier Invoices</h1>
            <p className="procurement-page-header__breadcrumb">
              Finance / Supplier Invoices
            </p>
          </div>
          <div className="procurement-page-header__actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate('/procurement/invoices/new')}
            >
              <Plus size={18} />
              New Invoice
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
          placeholder="Search invoice number, supplier, PO..."
          tabs={INVOICE_STATUS_TABS}
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
            <span>Loading supplier invoices...</span>
          </div>
        ) : (
          <SupplierInvoicesTable
            invoices={invoices}
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

export default SupplierInvoicesPage;
