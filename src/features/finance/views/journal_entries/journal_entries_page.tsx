import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, FileText, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JournalEntriesTable from '../../components/journal_entries/JournalEntriesTable';
import { useJournalEntriesStore } from '../../stores/journalEntriesStore';
import type { EntryType, JournalEntry } from '../../types/journal_entries_models';
import '../../styles/finance.css';

const ENTRY_TYPE_FILTERS: Array<{ label: string; value: EntryType | '' }> = [
  { label: 'All', value: '' },
  { label: 'Manual', value: 'manual' },
  { label: 'Automated', value: 'automated' },
  { label: 'Reversal', value: 'reversal' },
];

const FALLBACK_REFERENCE_TYPES = [
  'SalesInvoice',
  'SupplierInvoice',
  'Payment',
  'GoodsReceipt',
  'ProductionOrder',
  'InventoryMovement',
];

const JournalEntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    isLoading,
    error,
    fetchAll,
    clearError,
  } = useJournalEntriesStore();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [entryType, setEntryType] = useState<EntryType | ''>('');
  const [referenceType, setReferenceType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadEntries = useCallback(async () => {
    await fetchAll(
      {
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        entry_type: entryType || undefined,
        reference_type: referenceType || undefined,
      },
      true,
    );
  }, [dateFrom, dateTo, entryType, fetchAll, referenceType]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const referenceTypes = useMemo(() => {
    const fromEntries = new Set(
      items
        .map((entry) => entry.reference_type)
        .filter((value): value is string => Boolean(value)),
    );

    return Array.from(new Set([...FALLBACK_REFERENCE_TYPES, ...fromEntries])).sort();
  }, [items]);

  const filteredEntries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((entry: JournalEntry) =>
      [
        entry.entry_number,
        entry.description,
        entry.reference_type,
        entry.reference_id,
        entry.fiscal_period_name,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchTerm]);

  return (
    <div className="finance-page">
      <div className="finance-sticky-stack">
        <div className="finance-page-header">
          <div className="finance-page-title">
            <div className="finance-page-title__icon">
              <FileText size={22} />
            </div>
            <div>
              <h1>Journal Entries</h1>
              <p>Finance / General Ledger</p>
            </div>
          </div>

          <div className="finance-page-header__actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate('/finance/journal-entries/new')}
            >
              <Plus size={16} />
              New Journal Entry
            </button>
          </div>
        </div>

        <div className="finance-filter-bar">
          <label className="finance-filter-field finance-search-field">
            <Search size={15} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search entry number or description"
            />
          </label>

          <label className="finance-filter-field">
            <CalendarDays size={15} />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              aria-label="From date"
            />
          </label>

          <label className="finance-filter-field">
            <CalendarDays size={15} />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              aria-label="To date"
            />
          </label>

          <label className="finance-filter-field">
            <select
              value={referenceType}
              onChange={(event) => setReferenceType(event.target.value)}
              aria-label="Reference type"
            >
              <option value="">All reference types</option>
              {referenceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="finance-entry-type-tabs" role="tablist" aria-label="Entry type filters">
          {ENTRY_TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value || 'all'}
              type="button"
              role="tab"
              aria-selected={entryType === filter.value}
              className={`finance-pill ${entryType === filter.value ? 'finance-pill--active' : ''}`}
              onClick={() => setEntryType(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="finance-content">
        {error && (
          <div className="finance-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={clearError}>
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="finance-loading">
            <div className="finance-spinner" />
            <span>Loading journal entries...</span>
          </div>
        ) : (
          <JournalEntriesTable entries={filteredEntries} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default JournalEntriesPage;
