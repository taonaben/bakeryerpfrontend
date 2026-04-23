import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import type { Supplier, PaymentTerms } from '../types/models';

// ──────────────────────────────────────────────
// Payment terms human labels
// ──────────────────────────────────────────────

const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  NET_30: 'Net 30',
  NET_60: 'Net 60',
  COD: 'Cash on Delivery',
  EOM: 'End of Month',
  PREPAID: 'Prepaid',
  IMMEDIATE: 'Immediate',
};

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface SuppliersTableProps {
  suppliers: Supplier[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const SuppliersTable: React.FC<SuppliersTableProps> = ({
  suppliers = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (supplier: Supplier) => {
    if (supplier.on_hold) {
      return <span className="badge on-hold">On Hold</span>;
    }
    if (supplier.is_active) {
      return <span className="badge active">Active</span>;
    }
    return <span className="badge inactive">Inactive</span>;
  };

  const getPrimaryContact = (supplier: Supplier) => {
    const primaryContact = supplier.contacts?.find((c) => c.is_primary);
    if (primaryContact) {
      return { name: primaryContact.name, phone: primaryContact.phone };
    }
    return { name: supplier.primary_email, phone: supplier.primary_phone };
  };

  if (suppliers.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Inbox size={48} />
          </div>
          <h3 className="empty-state__title">No suppliers found</h3>
          <p className="empty-state__description">
            There are no suppliers matching your filters. Try adjusting your search or add a new supplier.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Contact</th>
            <th>Payment Terms</th>
            <th>Currency</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => {
            const contact = getPrimaryContact(supplier);
            return (
              <tr
                key={supplier.id}
                onClick={() => navigate(`/procurement/suppliers/${supplier.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div className="supplier-name-cell">
                    <span>{supplier.name}</span>
                    {supplier.primary_email && (
                      <div className="supplier-subtitle">{supplier.primary_email}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="supplier-contact-cell">
                    <span>{contact.name}</span>
                    {contact.phone && (
                      <div className="supplier-subtitle">{contact.phone}</div>
                    )}
                  </div>
                </td>
                <td>
                  {supplier.payment_terms
                    ? PAYMENT_TERMS_LABELS[supplier.payment_terms] ?? supplier.payment_terms
                    : '—'}
                </td>
                <td>{supplier.currency || '—'}</td>
                <td>{getStatusBadge(supplier)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages >= 1 && (
        <footer
          className="pagination-footer"
          aria-label="Table pagination"
          role="contentinfo"
        >
          <div className="pagination-container">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="pagination-btn pagination-btn--prev"
              aria-label={`Go to previous page (page ${currentPage - 1})`}
              title="Previous page"
              type="button"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            <div className="pagination-info" aria-live="polite" aria-atomic="true">
              <span className="page-number">
                Page <strong>{currentPage}</strong> of{' '}
                <strong>{totalPages}</strong>
              </span>
            </div>

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="pagination-btn pagination-btn--next"
              aria-label={`Go to next page (page ${currentPage + 1})`}
              title="Next page"
              type="button"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default SuppliersTable;
