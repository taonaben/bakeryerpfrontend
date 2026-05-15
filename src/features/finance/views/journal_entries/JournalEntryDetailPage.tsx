import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User } from '../../../auth/types/models';
import { useUserStore } from '../../../auth/stores/userStore';
import { useJournalEntriesStore } from '../../stores/journalEntriesStore';
import type { JournalEntry } from '../../types/journal_entries_models';
import {
  formatDate,
  formatEntryType,
  formatMoney,
  getEntryTotals,
  getLinkedEntryNumber,
  isEntryBalanced,
  toNumber,
} from '../../components/journal_entries/journalEntryDisplay';
import '../../styles/finance.css';

const FINANCE_REVERSAL_ROLES = new Set(['accountant', 'manager', 'owner_director', 'system_admin']);

const JournalEntryDetailPage: React.FC = () => {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const sessionUser = useMemo(() => user ?? getStoredUser(), [user]);

  const {
    fetchById,
    reverse,
    isLoading,
    isSubmitting,
    error,
    clearError,
  } = useJournalEntriesStore();

  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (!entryId) {
      navigate('/finance/journal-entries', { replace: true });
      return;
    }

    let isMounted = true;
    fetchById(entryId)
      .then((data) => {
        if (isMounted) setEntry(data);
      })
      .catch(() => {
        if (isMounted) setEntry(null);
      });

    return () => {
      isMounted = false;
    };
  }, [entryId, fetchById, navigate]);

  const totals = useMemo(
    () => (entry ? getEntryTotals(entry) : { debit: 0, credit: 0 }),
    [entry],
  );
  const balanced = isEntryBalanced(totals);
  const canReverse = Boolean(
    entry &&
    !entry.is_reversed &&
    sessionUser?.role &&
    FINANCE_REVERSAL_ROLES.has(sessionUser.role),
  );

  const handleReverse = async () => {
    if (!entry) return;
    const shouldReverse = window.confirm(`Reverse journal entry ${entry.entry_number || entry.id}?`);
    if (!shouldReverse) return;

    await reverse(entry.id);
    const refreshed = await fetchById(entry.id);
    setEntry(refreshed);
  };

  if (isLoading && !entry) {
    return (
      <div className="finance-page">
        <div className="finance-content">
          <div className="finance-loading">
            <div className="finance-spinner" />
            <span>Loading journal entry...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="finance-page">
        <div className="finance-sticky-stack">
          <div className="finance-page-header">
            <button className="btn btn-outline" type="button" onClick={() => navigate('/finance/journal-entries')}>
              <ArrowLeft size={16} />
              Back to Journal
            </button>
          </div>
        </div>
        <div className="finance-content">
          {error ? (
            <div className="finance-error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button type="button" onClick={() => entryId && fetchById(entryId).then(setEntry)}>
                Retry
              </button>
            </div>
          ) : (
            <div className="finance-empty-state">
              <div className="finance-empty-state__icon">
                <FileText size={44} />
              </div>
              <h3>Journal entry not found</h3>
              <p>The journal entry could not be loaded.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const reversedBy = getLinkedEntryNumber(entry, 'reversed_by');
  const reversalOf = getLinkedEntryNumber(entry, 'reversal_of');
  const lines = entry.lines ?? [];
  const createdByLabel = getCreatedByLabel(entry.created_by, sessionUser);

  return (
    <div className="finance-page journal-entry-detail-page">
      <div className="finance-sticky-stack">
        <div className="finance-page-header">
          <div className="finance-page-title">
            <div className="finance-page-title__icon">
              <FileText size={22} />
            </div>
            <div>
              <button
                className="btn btn-outline journal-entry-detail-back"
                type="button"
                onClick={() => navigate('/finance/journal-entries')}
              >
                <ArrowLeft size={16} />
                Back to Journal
              </button>
              <h1>{entry.entry_number || entry.id}</h1>
              <p>Finance / Journal Entries / {entry.entry_number || entry.id}</p>
            </div>
          </div>

          <div className="finance-page-header__actions">
            {canReverse && (
              <button
                className="btn btn-danger"
                type="button"
                onClick={handleReverse}
                disabled={isSubmitting}
              >
                <RotateCcw size={16} />
                {isSubmitting ? 'Reversing...' : 'Reverse this Entry'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="finance-content journal-entry-detail-content">
        {error && (
          <div className="finance-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={clearError}>
              Dismiss
            </button>
          </div>
        )}

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

        <div className="journal-entry-detail-layout">
          <aside className="journal-entry-detail-side">
            <div className="journal-entry-status-card">
              {balanced ? (
                <CheckCircle2 size={28} className="finance-icon-status--success" />
              ) : (
                <XCircle size={28} className="finance-icon-status--danger" />
              )}
              <div>
                <span>Status</span>
                <strong>{balanced ? 'Balanced' : 'Not balanced'}</strong>
              </div>
            </div>

            <div className="journal-entry-side-metric journal-entry-side-metric--primary">
              <span>Total Debits</span>
              <strong>{formatMoney(totals.debit)}</strong>
            </div>
            <div className="journal-entry-side-metric">
              <span>Total Credits</span>
              <strong>{formatMoney(totals.credit)}</strong>
            </div>
            <div className="journal-entry-side-metric">
              <span>Entry Type</span>
              <strong>{formatEntryType(entry.entry_type)}</strong>
            </div>
            <div className="journal-entry-side-metric">
              <span>Line Count</span>
              <strong>{lines.length}</strong>
            </div>
          </aside>

          <main className="journal-entry-detail-main">
            <section className="finance-form-section">
              <div className="finance-section-header">
                <div>
                  <h2>Header Metadata</h2>
                  <p>{entry.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="journal-entry-meta-grid journal-entry-detail-meta">
                <div>
                  <span>Entry Number</span>
                  <strong>{entry.entry_number || entry.id}</strong>
                </div>
                <div>
                  <span>Entry Date</span>
                  <strong>{formatDate(entry.entry_date)}</strong>
                </div>
                <div>
                  <span>Fiscal Period</span>
                  <strong>{entry.fiscal_period_name || entry.fiscal_period || '-'}</strong>
                </div>
                <div>
                  <span>Reference Type</span>
                  <strong>{entry.reference_type || '-'}</strong>
                </div>
                <div>
                  <span>Reference ID</span>
                  <strong>{entry.reference_id || '-'}</strong>
                </div>
                <div>
                  <span>Created By</span>
                  {entry.created_by ? (
                    <button
                      className="finance-text-link"
                      type="button"
                      onClick={() => navigate('/profile')}
                    >
                      {createdByLabel}
                    </button>
                  ) : (
                    <span className="journal-entry-meta-value">-</span>
                  )}
                </div>
                <div>
                  <span>Created Date</span>
                  <strong>{formatDate(entry.created_at)}</strong>
                </div>
                <div>
                  <span>Reversed</span>
                  <strong>{entry.is_reversed ? 'Yes' : 'No'}</strong>
                </div>
              </div>
            </section>

            <section className="finance-form-section">
              <div className="finance-section-header">
                <div>
                  <h2>Journal Lines</h2>
                  <p>Full debit and credit posting lines for this ledger entry.</p>
                </div>
              </div>

              <div className="finance-table-container journal-entry-full-lines-wrap">
                <table className="finance-table journal-entry-full-lines-table">
                  <thead>
                    <tr>
                      <th>Account Code</th>
                      <th>Account Name</th>
                      <th className="finance-table__amount">Debit</th>
                      <th className="finance-table__amount">Credit</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={line.id || `${line.account_code}-${index}`}>
                        <td className="finance-mono-link">{line.account_code || line.account || '-'}</td>
                        <td>{line.account_name || '-'}</td>
                        <td className="finance-table__amount">
                          {line.type === 'debit' ? formatMoney(toNumber(line.amount)) : '-'}
                        </td>
                        <td className="finance-table__amount">
                          {line.type === 'credit' ? formatMoney(toNumber(line.amount)) : '-'}
                        </td>
                        <td>{line.description || '-'}</td>
                      </tr>
                    ))}
                    {lines.length === 0 && (
                      <tr>
                        <td colSpan={5} className="finance-empty-cell">
                          No journal lines were returned for this entry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className={balanced ? 'journal-total-row--balanced' : 'journal-total-row--unbalanced'}>
                      <td colSpan={2}>Totals</td>
                      <td className="finance-table__amount">{formatMoney(totals.debit)}</td>
                      <td className="finance-table__amount">{formatMoney(totals.credit)}</td>
                      <td>{balanced ? 'Balanced' : 'Not balanced'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

function getCreatedByLabel(createdBy: string | undefined, user: User | null): string {
  if (!createdBy) return '-';
  if (user?.id && user.id === createdBy) {
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || user.emp_code;
  }
  return createdBy;
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('erp_user');
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    return null;
  }
}

export default JournalEntryDetailPage;
