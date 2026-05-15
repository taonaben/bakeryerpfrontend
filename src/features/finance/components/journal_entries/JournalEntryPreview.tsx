import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { JournalEntry } from '../../types/journal_entries_models';
import {
  formatDate,
  formatMoney,
  getLinkedEntryNumber,
  isEntryBalanced,
  toNumber,
} from './journalEntryDisplay';

interface JournalEntryPreviewProps {
  entry: JournalEntry;
  totals: { debit: number; credit: number };
}

const JournalEntryPreview: React.FC<JournalEntryPreviewProps> = ({ entry, totals }) => {
  const lines = entry.lines ?? [];
  const previewLines = lines.slice(0, 3);
  const reversedBy = getLinkedEntryNumber(entry, 'reversed_by');
  const reversalOf = getLinkedEntryNumber(entry, 'reversal_of');
  const balanced = isEntryBalanced(totals);

  return (
    <div className="journal-entry-preview">
      <div className="journal-entry-preview__topline">
        <div className="journal-entry-preview__metrics">
          <div>
            <span>Debit Total</span>
            <strong>{formatMoney(totals.debit)}</strong>
          </div>
          <div>
            <span>Credit Total</span>
            <strong>{formatMoney(totals.credit)}</strong>
          </div>
          <span className={`finance-balance-chip ${balanced ? 'finance-balance-chip--balanced' : 'finance-balance-chip--unbalanced'}`}>
            {balanced ? 'Balanced' : 'Not balanced'}
          </span>
        </div>

        <Link
          className="btn btn-primary"
          to={`/finance/journal-entries/${entry.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          <ExternalLink size={16} />
          View Details
        </Link>
      </div>

      {entry.is_reversed && (
        <div className="finance-entry-banner finance-entry-banner--warning">
          This entry was reversed{reversedBy ? ` by ${reversedBy}` : ''}.
        </div>
      )}

      {entry.entry_type === 'reversal' && (
        <div className="finance-entry-banner finance-entry-banner--info">
          This is a reversal{reversalOf ? ` of ${reversalOf}` : ''}.
        </div>
      )}

      <div className="journal-entry-preview__meta">
        <div>
          <span>Entry Date</span>
          <strong>{formatDate(entry.entry_date)}</strong>
        </div>
        <div>
          <span>Fiscal Period</span>
          <strong>{entry.fiscal_period_name || entry.fiscal_period || '-'}</strong>
        </div>
        <div>
          <span>Reference</span>
          <strong>{entry.reference_type || '-'}{entry.reference_id ? ` #${entry.reference_id}` : ''}</strong>
        </div>
        <div>
          <span>Created</span>
          <strong>{formatDate(entry.created_at)}</strong>
        </div>
      </div>

      <div className="journal-entry-preview__lines">
        <div className="finance-section-header journal-entry-preview__section-header">
          <div>
            <h2>Line Preview</h2>
            <p>
              {lines.length > 0
                ? `Showing ${previewLines.length} of ${lines.length} lines`
                : 'Open the detail page to load the complete journal lines.'}
            </p>
          </div>
        </div>

        {previewLines.length > 0 ? (
          <table className="finance-table journal-entry-preview-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="finance-table__amount">Debit</th>
                <th className="finance-table__amount">Credit</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {previewLines.map((line, index) => (
                <tr key={line.id || `${line.account_code}-${index}`}>
                  <td>
                    <span className="finance-mono-link">{line.account_code || line.account || '-'}</span>
                    <small>{line.account_name || '-'}</small>
                  </td>
                  <td className="finance-table__amount">
                    {line.type === 'debit' ? formatMoney(toNumber(line.amount)) : '-'}
                  </td>
                  <td className="finance-table__amount">
                    {line.type === 'credit' ? formatMoney(toNumber(line.amount)) : '-'}
                  </td>
                  <td>{line.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="journal-entry-preview__empty">
            No line preview was returned with the ledger list.
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalEntryPreview;
