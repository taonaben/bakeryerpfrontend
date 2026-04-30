import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SupplierInvoice } from '../types/supplier_invoices_model';

interface SupplierInvoicesTableProps {
  invoices: SupplierInvoice[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const SupplierInvoicesTable: React.FC<SupplierInvoicesTableProps> = ({
  invoices = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const rowIds = useMemo(
    () => invoices.map((invoice, index) => invoice.id || String(index)),
    [invoices],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(rowIds));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (Number.isNaN(numericAmount)) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numericAmount);
  };

  const statusClass = (status: string) => status.toLowerCase().replace(/\s+/g, '-');

  const isOverdue = (invoice: SupplierInvoice) => {
    if (invoice.status === 'Paid' || invoice.status === 'Rejected') return false;
    const due = new Date(invoice.due_date);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  if (invoices.length === 0 && !isLoading) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Inbox size={48} />
          </div>
          <h3 className="empty-state__title">No supplier invoices found</h3>
          <p className="empty-state__description">
            There are no supplier invoices matching your filters. Try adjusting your search or create a new invoice.
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
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all supplier invoices"
              />
            </th>
            <th>Invoice #</th>
            <th>Supplier</th>
            <th>PO Reference</th>
            <th>Invoice Date</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => {
            const rowId = invoice.id || String(index);
            const overdue = isOverdue(invoice);

            return (
              <tr
                key={rowId}
                onClick={(event) => {
                  if ((event.target as HTMLElement).tagName !== 'INPUT') {
                    navigate(`/procurement/invoices/${invoice.id}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowId)}
                    onChange={() => toggleRow(rowId)}
                    aria-label={`Select supplier invoice ${invoice.invoice_number}`}
                  />
                </td>
                <td className="po-number-cell">{invoice.invoice_number || '—'}</td>
                <td>
                  <div className="po-supplier-cell">
                    <span className="po-supplier-name">{invoice.supplier_name || '—'}</span>
                  </div>
                </td>
                <td className="po-ref-cell">{invoice.po_number || '—'}</td>
                <td className="text-muted">{formatDate(invoice.invoice_date)}</td>
                <td className="text-muted" style={overdue ? { color: '#b45309', fontWeight: 700 } : undefined}>
                  {formatDate(invoice.due_date)}
                </td>
                <td className="po-amount-cell">{formatCurrency(invoice.total_amount)}</td>
                <td>
                  <span className={`badge ${statusClass(invoice.status)}`}>
                    {overdue && invoice.status !== 'Paid' ? 'Overdue' : invoice.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
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

export default SupplierInvoicesTable;
