import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Download, AlertTriangle, Users } from 'lucide-react';
import { useCustomersStore } from '../../stores/customersStore';
import type { CustomerType } from '../../types/shared';
import ProcurementToolbar from '../../../procurement/components/toolbar';
import type { StatusTabConfig } from '../../../procurement/components/toolbar';
import '../../../procurement/styles/procurement.css';
import '../../styles/sales.css';

// ──────────────────────────────────────────────
// Customer type tabs
// ──────────────────────────────────────────────
const CUSTOMER_TYPE_TABS: StatusTabConfig[] = [
  { label: 'All', value: '' },
  { label: 'Retail', value: 'retail' },
  { label: 'Business', value: 'business' },
];

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items: customers,
    isLoading,
    error,
    fetchAll,
  } = useCustomersStore();

  // Filters
  const [activeType, setActiveType] = useState<CustomerType | ''>('');
  const [activeStatus, setActiveStatus] = useState<boolean | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch customers
  const fetchData = useCallback(async () => {
    const filters: any = {};
    if (activeType) filters.customer_type = activeType;
    if (activeStatus !== undefined) filters.is_active = activeStatus;
    if (debouncedSearch) filters.search = debouncedSearch;
    await fetchAll(filters, true);
  }, [activeType, activeStatus, debouncedSearch, fetchAll]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ensure customers is an array
  const customersList = Array.isArray(customers) ? customers : [];

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        {/* Page Header */}
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <h1>Customers</h1>
            <p className="procurement-page-header__breadcrumb">Sales / Customers</p>
          </div>
          <div className="procurement-page-header__actions">
            <button className="btn btn-outline" type="button" title="Export">
              <Download size={18} />
              Export
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/sales/customers/new')}
              type="button"
            >
              <Plus size={18} />
              New Customer
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

        {/* Toolbar — type tabs + search */}
        <ProcurementToolbar
          searchTerm={searchInput}
          onSearchChange={setSearchInput}
          activeStatus={activeType}
          onStatusChange={(t) => setActiveType(t as CustomerType | '')}
          placeholder="Search customers…"
          tabs={CUSTOMER_TYPE_TABS}
        />

        {/* Active/Inactive filter */}
        <div style={{ display: 'flex', gap: '8px', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveStatus(undefined)}
            className={`status-tab ${activeStatus === undefined ? 'active' : ''}`}
          >
            All Status
          </button>
          <button
            onClick={() => setActiveStatus(true)}
            className={`status-tab ${activeStatus === true ? 'active' : ''}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveStatus(false)}
            className={`status-tab ${activeStatus === false ? 'active' : ''}`}
          >
            Inactive
          </button>
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

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading customers…</span>
          </div>
        ) : customersList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <Users size={48} />
            </div>
            <h3 className="empty-state__title">No customers found</h3>
            <p className="empty-state__description">
              {debouncedSearch
                ? 'Try adjusting your search or filters'
                : 'Add your first customer to get started'}
            </p>
          </div>
        ) : (
          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Payment Terms</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customersList.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => navigate(`/sales/customers/${customer.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span className="table-link">{customer.name}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${customer.customer_type}`}>
                        {customer.customer_type === 'retail' ? 'Retail' : 'Business'}
                      </span>
                    </td>
                    <td>{customer.phone}</td>
                    <td>{customer.email}</td>
                    <td>{customer.company_name || '—'}</td>
                    <td>{customer.payment_terms || '—'}</td>
                    <td>
                      <span className={`badge badge-${customer.is_active ? 'active' : 'inactive'}`}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sales/customers/${customer.id}`);
                        }}
                        aria-label="View customer"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
