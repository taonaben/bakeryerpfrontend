import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, FilePlus2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JournalEntryLineEditor, {
  type JournalEntryDraftLine,
} from '../../components/journal_entries/JournalEntryLineEditor';
import { useChartOfAccountsStore } from '../../stores/chartOfAccountsStore';
import { useJournalEntriesStore } from '../../stores/journalEntriesStore';
import type { CreateJournalEntryDTO } from '../../types/journal_entries_models';
import '../../styles/finance.css';

const CreateJournalEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items: accounts,
    fetchAll: fetchAccounts,
    isLoading: accountsLoading,
    error: accountsError,
    clearError: clearAccountsError,
  } = useChartOfAccountsStore();

  const {
    create,
    isSubmitting,
    error: journalError,
    clearError: clearJournalError,
  } = useJournalEntriesStore();

  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalEntryDraftLine[]>(() => [
    createDraftLine('debit'),
    createDraftLine('credit'),
  ]);

  useEffect(() => {
    fetchAccounts({ is_active: true }, true);
  }, [fetchAccounts]);

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        const amount = Number(line.amount) || 0;
        if (line.type === 'debit') acc.debit += amount;
        if (line.type === 'credit') acc.credit += amount;
        return acc;
      },
      { debit: 0, credit: 0 },
    );
  }, [lines]);

  const isBalanced = totals.debit > 0 && Math.abs(totals.debit - totals.credit) < 0.005;
  const hasValidLines = lines.every(
    (line) => line.account_code.trim() && Number(line.amount) > 0,
  );
  const canSubmit = Boolean(entryDate && description.trim() && isBalanced && hasValidLines && !isSubmitting);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const dto: CreateJournalEntryDTO = {
      entry_date: entryDate,
      description: description.trim(),
      lines: lines.map((line) => ({
        account_code: line.account_code.trim(),
        type: line.type,
        amount: Number(line.amount),
        description: line.description.trim() || undefined,
      })),
    };

    const entry = await create(dto);
    navigate('/finance/journal-entries', {
      state: { createdEntryId: entry.id },
    });
  };

  return (
    <div className="finance-page finance-create-page">
      <div className="finance-sticky-stack">
        <div className="finance-page-header">
          <div className="finance-page-title">
            <div className="finance-page-title__icon">
              <FilePlus2 size={22} />
            </div>
            <div>
              <h1>New Journal Entry</h1>
              <p>Finance / Journal Entries / New</p>
            </div>
          </div>

          <div className="finance-page-header__actions">
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => navigate('/finance/journal-entries')}
            >
              <ArrowLeft size={16} />
              Back to Journal
            </button>
          </div>
        </div>
      </div>

      <div className="finance-content">
        {(journalError || accountsError) && (
          <div className="finance-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{journalError || accountsError}</span>
            <button
              type="button"
              onClick={() => {
                clearJournalError();
                clearAccountsError();
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <form className="finance-form" onSubmit={handleSubmit}>
          <section className="finance-form-section">
            <div className="finance-section-header">
              <div>
                <h2>Header</h2>
                <p>Manual journal entries are posted directly to the general ledger.</p>
              </div>
            </div>

            <div className="finance-form-grid">
              <div className="finance-form-field">
                <label htmlFor="journal-entry-date">
                  Entry Date <span className="required">*</span>
                </label>
                <input
                  id="journal-entry-date"
                  type="date"
                  value={entryDate}
                  onChange={(event) => setEntryDate(event.target.value)}
                  required
                />
              </div>

              <div className="finance-form-field finance-form-field--wide">
                <label htmlFor="journal-entry-description">
                  Description <span className="required">*</span>
                </label>
                <input
                  id="journal-entry-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Reason for this manual adjustment"
                  required
                />
              </div>
            </div>
          </section>

          <JournalEntryLineEditor
            accounts={accounts}
            lines={lines}
            onChange={setLines}
          />

          <footer className="journal-entry-submit-bar">
            <div className="journal-entry-submit-bar__totals">
              <div>
                <span>Total Debits</span>
                <strong>{formatMoney(totals.debit)}</strong>
              </div>
              <div>
                <span>Total Credits</span>
                <strong>{formatMoney(totals.credit)}</strong>
              </div>
              <span className={`finance-balance-chip ${isBalanced ? 'finance-balance-chip--balanced' : 'finance-balance-chip--unbalanced'}`}>
                {isBalanced ? 'Balanced' : 'Not balanced'}
              </span>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={!canSubmit || accountsLoading}
              title={!isBalanced ? 'Debit and credit totals must match' : undefined}
            >
              {isSubmitting ? 'Posting...' : 'Post Journal Entry'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

function createDraftLine(type: 'debit' | 'credit'): JournalEntryDraftLine {
  return {
    id: crypto.randomUUID(),
    account_code: '',
    type,
    amount: '',
    description: '',
  };
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default CreateJournalEntryPage;
