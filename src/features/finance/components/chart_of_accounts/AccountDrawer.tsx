import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type {
  AccountType,
  ChartOfAccount,
  CreateChartOfAccountDTO,
  NormalBalance,
  UpdateChartOfAccountDTO,
} from '../../types/chart_of_accounts_models';

interface AccountDrawerProps {
  account: ChartOfAccount | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateChartOfAccountDTO | UpdateChartOfAccountDTO) => Promise<void>;
}

const ACCOUNT_TYPES: Array<{ label: string; value: AccountType }> = [
  { label: 'Asset', value: 'asset' },
  { label: 'Liability', value: 'liability' },
  { label: 'Equity', value: 'equity' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Expense', value: 'expense' },
];

const NORMAL_BALANCES: Array<{ label: string; value: NormalBalance }> = [
  { label: 'Debit', value: 'debit' },
  { label: 'Credit', value: 'credit' },
];

const AccountDrawer: React.FC<AccountDrawerProps> = ({
  account,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(account);
  const [form, setForm] = useState({
    code: '',
    name: '',
    account_type: 'asset' as AccountType,
    account_subtype: '',
    normal_balance: 'debit' as NormalBalance,
    description: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      code: account?.code ?? '',
      name: account?.name ?? '',
      account_type: account?.account_type ?? 'asset',
      account_subtype: account?.account_subtype ?? '',
      normal_balance: account?.normal_balance ?? 'debit',
      description: account?.description ?? '',
    });
  }, [account, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const dto = {
      code: form.code.trim(),
      name: form.name.trim(),
      account_type: form.account_type,
      account_subtype: form.account_subtype.trim() || undefined,
      normal_balance: form.normal_balance,
      description: form.description.trim() || undefined,
    };

    if (isEdit && account?.is_system_account) {
      const { code, ...editableDto } = dto;
      await onSubmit(editableDto);
      return;
    }

    await onSubmit(dto);
  };

  return (
    <>
      <div className="finance-drawer-backdrop" onClick={onClose} />
      <aside className="finance-drawer coa-account-drawer" aria-labelledby="coa-drawer-title">
        <div className="finance-drawer__header">
          <div>
            <h2 id="coa-drawer-title">{isEdit ? 'Edit Account' : 'Add Account'}</h2>
            <p>{isEdit ? 'Maintain chart of accounts master data.' : 'Create a new account in the chart.'}</p>
          </div>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Close account drawer">
            <X size={17} />
          </button>
        </div>

        <form className="finance-drawer__body" onSubmit={handleSubmit}>
          <div className="finance-form-field">
            <label htmlFor="account-code">
              Code <span className="required">*</span>
            </label>
            <input
              id="account-code"
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              disabled={isEdit && account?.is_system_account}
              required
            />
            {isEdit && account?.is_system_account && (
              <span className="finance-field-note">System account code cannot be changed.</span>
            )}
          </div>

          <div className="finance-form-field">
            <label htmlFor="account-name">
              Name <span className="required">*</span>
            </label>
            <input
              id="account-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>

          <div className="finance-form-field">
            <label htmlFor="account-type">
              Account Type <span className="required">*</span>
            </label>
            <select
              id="account-type"
              value={form.account_type}
              onChange={(event) => setForm((prev) => ({ ...prev, account_type: event.target.value as AccountType }))}
              required
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="finance-form-field">
            <label htmlFor="account-subtype">Account Subtype</label>
            <input
              id="account-subtype"
              value={form.account_subtype}
              onChange={(event) => setForm((prev) => ({ ...prev, account_subtype: event.target.value }))}
              placeholder="Current assets, payables, direct costs..."
            />
          </div>

          <div className="finance-form-field">
            <label htmlFor="normal-balance">
              Normal Balance <span className="required">*</span>
            </label>
            <select
              id="normal-balance"
              value={form.normal_balance}
              onChange={(event) => setForm((prev) => ({ ...prev, normal_balance: event.target.value as NormalBalance }))}
              required
            >
              {NORMAL_BALANCES.map((balance) => (
                <option key={balance.value} value={balance.value}>
                  {balance.label}
                </option>
              ))}
            </select>
          </div>

          <div className="finance-form-field">
            <label htmlFor="account-description">Description</label>
            <textarea
              id="account-description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={4}
              placeholder="Optional accounting notes"
            />
          </div>

          <div className="finance-drawer__footer">
            <button className="btn btn-outline" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Account' : 'Add Account'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

export default AccountDrawer;
