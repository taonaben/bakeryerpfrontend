import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Lock,
  Pencil,
  Plus,
  PowerOff,
  RefreshCw,
} from 'lucide-react';
import AccountDrawer from '../../components/chart_of_accounts/AccountDrawer';
import { useChartOfAccountsStore } from '../../stores/chartOfAccountsStore';
import type {
  AccountType,
  ChartOfAccount,
  CreateChartOfAccountDTO,
  UpdateChartOfAccountDTO,
} from '../../types/chart_of_accounts_models';
import '../../styles/finance.css';

const ACCOUNT_TYPES: Array<{ label: string; value: AccountType | '' }> = [
  { label: 'All', value: '' },
  { label: 'Asset', value: 'asset' },
  { label: 'Liability', value: 'liability' },
  { label: 'Equity', value: 'equity' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Expense', value: 'expense' },
];

const ACCOUNT_TYPE_ORDER: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense'];

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses',
};

type ActiveFilter = 'all' | 'active' | 'inactive';

const ChartOfAccountsPage: React.FC = () => {
  const {
    items,
    isLoading,
    isSubmitting,
    error,
    fetchAll,
    create,
    update,
    delete: deactivate,
    seed,
    clearError,
  } = useChartOfAccountsStore();

  const [accountType, setAccountType] = useState<AccountType | ''>('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);

  const loadAccounts = useCallback(async () => {
    await fetchAll(
      {
        account_type: accountType || undefined,
        is_active: activeFilter === 'all' ? undefined : activeFilter === 'active',
      },
      true,
    );
  }, [accountType, activeFilter, fetchAll]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const groupedAccounts = useMemo(() => {
    const groups = new Map<AccountType, ChartOfAccount[]>();
    ACCOUNT_TYPE_ORDER.forEach((type) => groups.set(type, []));

    items.forEach((account) => {
      const group = groups.get(account.account_type);
      if (group) group.push(account);
    });

    groups.forEach((group) => {
      group.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    });

    return ACCOUNT_TYPE_ORDER.map((type) => ({
      type,
      accounts: groups.get(type) ?? [],
    })).filter((group) => group.accounts.length > 0);
  }, [items]);

  const openAddDrawer = () => {
    setEditingAccount(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingAccount(null);
  };

  const handleDrawerSubmit = async (dto: CreateChartOfAccountDTO | UpdateChartOfAccountDTO) => {
    if (editingAccount) {
      await update(editingAccount.id, dto as UpdateChartOfAccountDTO);
    } else {
      await create(dto as CreateChartOfAccountDTO);
    }
    closeDrawer();
    await loadAccounts();
  };

  const handleSeed = async () => {
    const confirmed = window.confirm(
      'Seed system accounts? This is idempotent, but it may create or update required accounting control accounts.',
    );
    if (!confirmed) return;

    await seed();
    await loadAccounts();
  };

  const handleDeactivate = async (account: ChartOfAccount) => {
    const confirmed = window.confirm(`Deactivate account ${account.code} - ${account.name}?`);
    if (!confirmed) return;

    await deactivate(account.id);
    await loadAccounts();
  };

  return (
    <div className="finance-page">
      <div className="finance-sticky-stack">
        <div className="finance-page-header">
          <div className="finance-page-title">
            <div className="finance-page-title__icon">
              <BookOpen size={22} />
            </div>
            <div>
              <h1>Chart of Accounts</h1>
              <p>Finance / Configuration / Chart of Accounts</p>
            </div>
          </div>

          <div className="finance-page-header__actions">
            <button className="btn btn-outline" type="button" onClick={handleSeed} disabled={isSubmitting}>
              <RefreshCw size={16} />
              Seed System Accounts
            </button>
            <button className="btn btn-primary" type="button" onClick={openAddDrawer}>
              <Plus size={16} />
              Add Account
            </button>
          </div>
        </div>

        <div className="finance-filter-bar coa-filter-bar">
          <div className="finance-entry-type-tabs" role="tablist" aria-label="Account type filters">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.value || 'all'}
                className={`finance-pill ${accountType === type.value ? 'finance-pill--active' : ''}`}
                type="button"
                onClick={() => setAccountType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="finance-segmented-control coa-active-filter" role="group" aria-label="Active status filter">
            <button
              className={activeFilter === 'all' ? 'active' : ''}
              type="button"
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={activeFilter === 'active' ? 'active' : ''}
              type="button"
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button
              className={activeFilter === 'inactive' ? 'active' : ''}
              type="button"
              onClick={() => setActiveFilter('inactive')}
            >
              Inactive
            </button>
          </div>
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
            <span>Loading chart of accounts...</span>
          </div>
        ) : groupedAccounts.length === 0 ? (
          <div className="finance-table-container">
            <div className="finance-empty-state">
              <div className="finance-empty-state__icon">
                <BookOpen size={44} />
              </div>
              <h3>No accounts found</h3>
              <p>Adjust the filters or seed the system accounts to initialize the chart.</p>
            </div>
          </div>
        ) : (
          <div className="finance-table-container">
            <table className="finance-table coa-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Subtype</th>
                  <th>Normal Balance</th>
                  <th>System Key</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedAccounts.map((group) => (
                  <React.Fragment key={group.type}>
                    <tr className="coa-group-row">
                      <td colSpan={8}>{ACCOUNT_TYPE_LABELS[group.type]}</td>
                    </tr>
                    {group.accounts.map((account) => (
                      <tr key={account.id}>
                        <td>
                          <div className="coa-code-cell">
                            {account.is_system_account && (
                              <span
                                className="coa-lock-icon"
                                title="System account - code cannot be changed."
                                aria-label="System account - code cannot be changed."
                              >
                                <Lock size={14} />
                              </span>
                            )}
                            <span className="finance-mono-link">{account.code}</span>
                          </div>
                        </td>
                        <td>{account.name}</td>
                        <td>{formatAccountType(account.account_type)}</td>
                        <td>{account.account_subtype || '-'}</td>
                        <td>{formatNormalBalance(account.normal_balance)}</td>
                        <td>
                          {account.system_key ? (
                            <span className="finance-badge finance-badge--system">{account.system_key}</span>
                          ) : (
                            <span className="finance-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span className={`finance-badge ${account.is_active ? 'finance-badge--active' : 'finance-badge--inactive'}`}>
                            {account.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="coa-actions">
                            <button
                              className="btn-icon"
                              type="button"
                              onClick={() => openEditDrawer(account)}
                              aria-label={`Edit account ${account.code}`}
                              title="Edit account"
                            >
                              <Pencil size={16} />
                            </button>
                            {account.is_active && (
                              <button
                                className="btn-icon btn-icon--danger"
                                type="button"
                                onClick={() => handleDeactivate(account)}
                                disabled={isSubmitting}
                                aria-label={`Deactivate account ${account.code}`}
                                title="Deactivate account"
                              >
                                <PowerOff size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AccountDrawer
        account={editingAccount}
        isOpen={drawerOpen}
        isSubmitting={isSubmitting}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />
    </div>
  );
};

function formatAccountType(type: AccountType): string {
  return type.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNormalBalance(balance: string): string {
  return balance.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default ChartOfAccountsPage;
