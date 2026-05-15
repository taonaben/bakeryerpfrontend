import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Receipt,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AccountsPayable } from '../../types/accounts_payable_models';
import {
  canPay,
  formatDate,
  formatMoney,
  formatStatus,
  getDaysOverdue,
  getEffectiveStatus,
  getStatusClass,
  toNumber,
} from '../../utils/receivablesPayablesDisplay';
import AccountsPayableDetail from './AccountsPayableDetail';

interface AccountsPayableTableProps {
  records: AccountsPayable[];
  detailById: Record<string, AccountsPayable>;
  detailLoadingIds: Set<string>;
  expandedIds: Set<string>;
  onPay: (record: AccountsPayable) => void;
  onToggleRow: (record: AccountsPayable) => void;
}

const AccountsPayableTable: React.FC<AccountsPayableTableProps> = ({
  records,
  detailById,
  detailLoadingIds,
  expandedIds,
  onPay,
  onToggleRow,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const rowIds = useMemo(() => records.map((record) => record.id), [records]);
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageRecords = records.slice(pageStart, pageStart + pageSize);
  const visibleStart = records.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, records.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowIds.join('|')]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  if (records.length === 0) {
    return (
      <div className="finance-table-container">
        <div className="finance-empty-state">
          <div className="finance-empty-state__icon">
            <Receipt size={44} />
          </div>
          <h3>No payables found</h3>
          <p>Adjust the filters to review supplier invoice balances.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-table-container ar-table-wrap">
      <table className="finance-table ar-table">
        <thead>
          <tr>
            <th aria-label="Expand row" />
            <th>Invoice Number</th>
            <th>Supplier</th>
            <th className="finance-table__amount">Original Amount</th>
            <th className="finance-table__amount">Amount Paid</th>
            <th className="finance-table__amount">Outstanding</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Days Overdue</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pageRecords.map((record) => {
            const detail = detailById[record.id] || record;
            const expanded = expandedIds.has(record.id);
            const daysOverdue = getDaysOverdue(record);
            const overdue = daysOverdue > 0;
            const payable = canPay(record);

            return (
              <React.Fragment key={record.id}>
                <tr
                  className={`finance-table__clickable-row ${overdue ? 'ar-row--overdue' : ''}`}
                  onClick={() => onToggleRow(record)}
                  aria-expanded={expanded}
                >
                  <td className="finance-table__icon-cell">
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </td>
                  <td>
                    <Link
                      className="finance-mono-link"
                      to={`/procurement/invoices/${record.supplier_invoice}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {record.invoice_number}
                    </Link>
                  </td>
                  <td>{record.supplier_name}</td>
                  <td className="finance-table__amount">{formatMoney(toNumber(record.original_amount))}</td>
                  <td className="finance-table__amount">{formatMoney(toNumber(record.amount_paid))}</td>
                  <td className="finance-table__amount">{formatMoney(toNumber(record.amount_outstanding))}</td>
                  <td>{formatDate(record.due_date)}</td>
                  <td>
                    <span className={`finance-badge ${getStatusClass(record)}`}>
                      {formatStatus(getEffectiveStatus(record))}
                    </span>
                  </td>
                  <td>
                    {overdue ? (
                      <span className="ar-days-overdue">{daysOverdue}d overdue</span>
                    ) : (
                      <span className="finance-muted">-</span>
                    )}
                  </td>
                  <td>
                    {payable ? (
                      <button
                        className="btn btn-primary ar-table-action"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onPay(detail);
                        }}
                      >
                        <CreditCard size={14} />
                        Pay
                      </button>
                    ) : (
                      <span className="finance-muted">-</span>
                    )}
                  </td>
                </tr>

                {expanded && (
                  <tr className="journal-entry-expanded-row">
                    <td colSpan={10}>
                      <AccountsPayableDetail
                        record={detail}
                        isLoading={detailLoadingIds.has(record.id)}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {rowIds.length > 0 && (
        <footer className="finance-pagination-footer" aria-label="Table pagination" role="contentinfo">
          <div className="finance-pagination-summary">
            Showing <strong>{visibleStart}-{visibleEnd}</strong> of{' '}
            <strong>{rowIds.length}</strong> payable {rowIds.length === 1 ? 'record' : 'records'}
          </div>

          <div className="finance-pagination-controls">
            <button
              type="button"
              className="finance-pagination-btn"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              aria-label={`Go to previous page (page ${currentPage - 1})`}
              title="Previous page"
            >
              <ChevronLeft size={17} />
              <span>Previous</span>
            </button>

            <span className="finance-pagination-info" aria-live="polite" aria-atomic="true">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              className="finance-pagination-btn"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              aria-label={`Go to next page (page ${currentPage + 1})`}
              title="Next page"
            >
              <span>Next</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default AccountsPayableTable;
