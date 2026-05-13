import React from 'react';
import { Link } from 'react-router-dom';
import type { AccountsPayable } from '../../types/accounts_payable_models';
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatPaymentMethod,
  toNumber,
} from '../../utils/receivablesPayablesDisplay';

interface AccountsPayableDetailProps {
  record: AccountsPayable;
  isLoading: boolean;
}

const AccountsPayableDetail: React.FC<AccountsPayableDetailProps> = ({ record, isLoading }) => {
  const payments = record.payments || [];
  const original = toNumber(record.original_amount);
  const paid = toNumber(record.amount_paid);
  const paidPercent = original > 0 ? Math.min(100, Math.max(0, (paid / original) * 100)) : 0;

  return (
    <div className="ap-inline-detail">
      {isLoading && <div className="finance-field-note">Loading payment history...</div>}

      <div className="journal-entry-preview__meta">
        <div>
          <span>AP Record</span>
          <strong>{record.id}</strong>
        </div>
        <div>
          <span>Supplier Invoice</span>
          <Link className="finance-text-link" to={`/procurement/invoices/${record.supplier_invoice}`}>
            {record.invoice_number}
          </Link>
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

      <div className="ap-payment-progress">
        <div>
          <span>Payment progress</span>
          <strong>{formatMoney(paid)} paid of {formatMoney(original)}</strong>
        </div>
        <div className="ap-payment-progress__track" aria-hidden="true">
          <span style={{ width: `${paidPercent}%` }} />
        </div>
      </div>

      <div className="ap-payments-timeline" aria-label="Payment timeline">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <span key={payment.id} title={`${formatDate(payment.payment_date)} ${formatMoney(toNumber(payment.amount))}`} />
          ))
        ) : (
          <span className="ap-payments-timeline__empty">No payments recorded yet.</span>
        )}
      </div>

      <div className="journal-entry-preview__lines">
        <table className="finance-table ap-payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th className="finance-table__amount">Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Paid By</th>
              <th>Journal Entry</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.payment_date)}</td>
                  <td className="finance-table__amount">{formatMoney(toNumber(payment.amount))}</td>
                  <td>{formatPaymentMethod(payment.payment_method)}</td>
                  <td>{payment.reference || '-'}</td>
                  <td>{payment.paid_by || '-'}</td>
                  <td>
                    {payment.journal_entry ? (
                      <Link className="finance-text-link" to={`/finance/journal-entries/${payment.journal_entry}`}>
                        {payment.entry_number || payment.journal_entry}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="finance-empty-table-cell">
                  No supplier payments were returned for this payable.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsPayableDetail;
