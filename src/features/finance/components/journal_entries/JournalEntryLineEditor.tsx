import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ChartOfAccount } from '../../types/chart_of_accounts_models';
import type { DebitCredit } from '../../types/journal_entries_models';

export interface JournalEntryDraftLine {
  id: string;
  account_code: string;
  type: DebitCredit;
  amount: string;
  description: string;
}

interface JournalEntryLineEditorProps {
  accounts: ChartOfAccount[];
  lines: JournalEntryDraftLine[];
  onChange: (lines: JournalEntryDraftLine[]) => void;
}

const JournalEntryLineEditor: React.FC<JournalEntryLineEditorProps> = ({
  accounts,
  lines,
  onChange,
}) => {
  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.is_active !== false),
    [accounts],
  );

  const debitTotal = lines.reduce(
    (sum, line) => sum + (line.type === 'debit' ? Number(line.amount) || 0 : 0),
    0,
  );
  const creditTotal = lines.reduce(
    (sum, line) => sum + (line.type === 'credit' ? Number(line.amount) || 0 : 0),
    0,
  );
  const isBalanced = debitTotal > 0 && Math.abs(debitTotal - creditTotal) < 0.005;

  const updateLine = (id: string, patch: Partial<JournalEntryDraftLine>) => {
    onChange(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const addLine = () => {
    onChange([
      ...lines,
      {
        id: crypto.randomUUID(),
        account_code: '',
        type: 'debit',
        amount: '',
        description: '',
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) return;
    onChange(lines.filter((line) => line.id !== id));
  };

  return (
    <section className="journal-lines-editor">
      <div className="finance-section-header">
        <div>
          <h2>Lines</h2>
          <p>Debit and credit totals must match before the entry can be posted.</p>
        </div>
        <button className="btn btn-outline" type="button" onClick={addLine}>
          <Plus size={16} />
          Add Row
        </button>
      </div>

      <div className="finance-table-container journal-lines-editor__table-wrap">
        <table className="finance-table journal-lines-editor__table">
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Type</th>
              <th className="finance-table__amount">Amount</th>
              <th>Description</th>
              <th aria-label="Remove line" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={line.id}>
                <td>
                  <input
                    className="finance-input"
                    list="journal-account-options"
                    value={line.account_code}
                    onChange={(event) => updateLine(line.id, { account_code: event.target.value })}
                    placeholder="Search code or name"
                    aria-label={`Account for line ${index + 1}`}
                  />
                </td>
                <td>
                  <div className="finance-segmented-control" role="group" aria-label={`Line ${index + 1} type`}>
                    <button
                      type="button"
                      className={line.type === 'debit' ? 'active' : ''}
                      onClick={() => updateLine(line.id, { type: 'debit' })}
                    >
                      Debit
                    </button>
                    <button
                      type="button"
                      className={line.type === 'credit' ? 'active' : ''}
                      onClick={() => updateLine(line.id, { type: 'credit' })}
                    >
                      Credit
                    </button>
                  </div>
                </td>
                <td>
                  <input
                    className="finance-input finance-input--amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.amount}
                    onChange={(event) => updateLine(line.id, { amount: event.target.value })}
                    placeholder="0.00"
                    aria-label={`Amount for line ${index + 1}`}
                  />
                </td>
                <td>
                  <input
                    className="finance-input"
                    value={line.description}
                    onChange={(event) => updateLine(line.id, { description: event.target.value })}
                    placeholder="Line description"
                    aria-label={`Description for line ${index + 1}`}
                  />
                </td>
                <td className="finance-table__icon-cell">
                  <button
                    className="btn-icon"
                    type="button"
                    onClick={() => removeLine(line.id)}
                    disabled={lines.length <= 2}
                    aria-label={`Remove line ${index + 1}`}
                    title="Remove line"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={isBalanced ? 'journal-total-row--balanced' : 'journal-total-row--unbalanced'}>
              <td colSpan={2}>Running Totals</td>
              <td className="finance-table__amount">
                <div className="journal-running-total">
                  <span>Debit</span>
                  <strong>{formatMoney(debitTotal)}</strong>
                </div>
                <div className="journal-running-total">
                  <span>Credit</span>
                  <strong>{formatMoney(creditTotal)}</strong>
                </div>
              </td>
              <td colSpan={2}>{isBalanced ? 'Balanced' : 'Not balanced'}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <datalist id="journal-account-options">
        {activeAccounts.map((account) => (
          <option
            key={account.id}
            value={account.code}
            label={`${account.code} - ${account.name}`}
          />
        ))}
      </datalist>
    </section>
  );
};

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default JournalEntryLineEditor;
