import React from 'react';
import { Link } from 'react-router-dom';
import type { AccountsReceivable } from '../../types/accounts_receivable_models';
import { formatDateTime } from '../../utils/receivablesPayablesDisplay';

interface AccountsReceivablePreviewProps {
  record: AccountsReceivable;
}

const AccountsReceivablePreview: React.FC<AccountsReceivablePreviewProps> = ({ record }) => (
  <div className="ar-inline-preview">
    <div className="journal-entry-preview__meta">
      <div>
        <span>AR Record</span>
        <strong>{record.id}</strong>
      </div>
      <div>
        <span>Linked Journal Entry</span>
        {record.journal_entry ? (
          <Link className="finance-text-link" to={`/finance/journal-entries/${record.journal_entry}`}>
            {record.entry_number || record.journal_entry}
          </Link>
        ) : (
          <strong>-</strong>
        )}
      </div>
      <div>
        <span>Created</span>
        <strong>{formatDateTime(record.created_at)}</strong>
      </div>
      <div>
        <span>Last Updated</span>
        <strong>{formatDateTime(record.updated_at)}</strong>
      </div>
    </div>

    <div className="ar-inline-preview__note">
      AR is read-only here. Payments are recorded in the Sales module and reflected automatically.
    </div>
  </div>
);

export default AccountsReceivablePreview;
