import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { JournalEntry } from '../../types/journal_entries_models';
import JournalEntryPreview from './JournalEntryPreview';
import { formatDate, formatEntryType, formatMoney, getEntryTotals } from './journalEntryDisplay';

interface JournalEntriesTableProps {
  entries: JournalEntry[];
  isLoading?: boolean;
}

const JournalEntriesTable: React.FC<JournalEntriesTableProps> = ({
  entries,
  isLoading = false,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const rowIds = useMemo(() => entries.map((entry) => entry.id), [entries]);
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageEntries = entries.slice(pageStart, pageStart + pageSize);
  const visibleStart = entries.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, entries.length);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedIds(new Set());
  }, [rowIds.join('|')]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const toggleRow = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isLoading && entries.length === 0) {
    return (
      <div className="finance-table-container">
        <div className="finance-empty-state">
          <div className="finance-empty-state__icon">
            <FileText size={44} />
          </div>
          <h3>No journal entries found</h3>
          <p>Manual adjustments and automated ledger postings will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-table-container">
      <table className="finance-table journal-entries-table">
        <thead>
          <tr>
            <th aria-label="Expand row" />
            <th>Entry Number</th>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th>Fiscal Period</th>
            <th className="finance-table__amount">Debit Total</th>
            <th className="finance-table__amount">Credit Total</th>
            <th>Balanced</th>
            <th>Reversed</th>
          </tr>
        </thead>
        <tbody>
          {pageEntries.map((entry) => {
            const isExpanded = expandedIds.has(entry.id);
            const totals = getEntryTotals(entry);

            return (
              <React.Fragment key={entry.id}>
                <tr
                  className="finance-table__clickable-row"
                  onClick={() => toggleRow(entry.id)}
                  aria-expanded={isExpanded}
                >
                  <td className="finance-table__icon-cell">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </td>
                  <td>
                    <Link
                      className="finance-mono-link"
                      to={`/finance/journal-entries/${entry.id}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {entry.entry_number || entry.id}
                    </Link>
                  </td>
                  <td className="finance-muted">{formatDate(entry.entry_date)}</td>
                  <td>
                    <div className="journal-entry-description">
                      <span>{entry.description || '-'}</span>
                      {entry.reference_type && (
                        <small>{entry.reference_type}{entry.reference_id ? ` #${entry.reference_id}` : ''}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`finance-badge finance-badge--${entry.entry_type}`}>
                      {formatEntryType(entry.entry_type)}
                    </span>
                  </td>
                  <td>{entry.fiscal_period_name || entry.fiscal_period || '-'}</td>
                  <td className="finance-table__amount">{formatMoney(totals.debit)}</td>
                  <td className="finance-table__amount">{formatMoney(totals.credit)}</td>
                  <td>
                    {entry.is_balanced ? (
                      <span className="finance-icon-status finance-icon-status--success" title="Balanced">
                        <CheckCircle2 size={17} />
                      </span>
                    ) : (
                      <span className="finance-icon-status finance-icon-status--danger" title="Not balanced">
                        <XCircle size={17} />
                      </span>
                    )}
                  </td>
                  <td>
                    {entry.is_reversed ? (
                      <span className="finance-icon-status finance-icon-status--warning" title="Reversed">
                        <RotateCcw size={17} />
                      </span>
                    ) : (
                      <span className="finance-muted">-</span>
                    )}
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="journal-entry-expanded-row">
                    <td colSpan={10}>
                      <JournalEntryPreview entry={entry} totals={totals} />
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
            <strong>{rowIds.length}</strong> journal {rowIds.length === 1 ? 'entry' : 'entries'}
          </div>

          <div className="finance-pagination-controls">
            <button
              type="button"
              className="finance-pagination-btn"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || isLoading}
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
              disabled={currentPage === totalPages || isLoading}
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

export default JournalEntriesTable;
