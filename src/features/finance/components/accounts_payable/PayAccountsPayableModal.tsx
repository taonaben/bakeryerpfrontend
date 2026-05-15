import React, { useState } from 'react';
import { X } from 'lucide-react';
import type {
  AccountsPayable,
  PaymentMethod,
} from '../../types/accounts_payable_models';
import {
  formatMoney,
  formatPlainAmount,
  PAYMENT_METHODS,
  toNumber,
} from '../../utils/receivablesPayablesDisplay';

interface PayAccountsPayableModalProps {
  record: AccountsPayable;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (dto: {
    amount: number;
    payment_method: PaymentMethod;
    reference?: string;
    notes?: string;
  }) => Promise<void>;
}

const PayAccountsPayableModal: React.FC<PayAccountsPayableModalProps> = ({
  record,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const outstanding = toNumber(record.amount_outstanding);
  const [amount, setAmount] = useState(formatPlainAmount(outstanding));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const numericAmount = toNumber(amount);
  const newOutstanding = Math.max(0, outstanding - numericAmount);
  const isValid = numericAmount > 0 && numericAmount <= outstanding;

  return (
    <>
      <div className="finance-drawer-backdrop" onClick={onClose} />
      <div className="finance-modal ap-pay-modal" role="dialog" aria-modal="true" aria-labelledby="pay-ap-title">
        <div className="finance-drawer__header">
          <div>
            <h2 id="pay-ap-title">Record Supplier Payment</h2>
            <p>Capture the payment against this payable.</p>
          </div>
          <button className="finance-icon-button" type="button" onClick={onClose} aria-label="Close payment modal">
            <X size={18} />
          </button>
        </div>

        <form
          className="finance-drawer__body"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!isValid) return;
            await onSubmit({
              amount: numericAmount,
              payment_method: paymentMethod,
              reference: reference.trim() || undefined,
              notes: notes.trim() || undefined,
            });
          }}
        >
          <div className="ap-pay-modal__summary">
            <span>{record.supplier_name}</span>
            <strong>{record.invoice_number}</strong>
            <p>Outstanding balance</p>
            <b>{formatMoney(outstanding)}</b>
          </div>

          <label className="finance-form-field">
            <span>Amount <span className="required">*</span></span>
            <input
              className="finance-input--amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          <label className="finance-form-field">
            <span>Payment Method <span className="required">*</span></span>
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          <label className="finance-form-field">
            <span>Reference</span>
            <input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Cheque number, transfer reference..."
            />
          </label>

          <label className="finance-form-field">
            <span>Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Optional payment notes"
            />
          </label>

          <div className="ap-pay-modal__outstanding">
            <span>New Outstanding After Payment</span>
            <strong className={newOutstanding === 0 ? 'is-settled' : ''}>
              {formatMoney(newOutstanding)}
            </strong>
          </div>

          {!isValid && (
            <div className="finance-field-note">
              Payment amount must be greater than zero and cannot exceed the outstanding balance.
            </div>
          )}

          <div className="finance-drawer__footer">
            <button className="btn btn-outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PayAccountsPayableModal;
