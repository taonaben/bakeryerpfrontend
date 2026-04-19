import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import { useSupplierDetailStore } from '../../stores/supplierDetailStore';
import type { SupplierContact } from '../../types/models';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
  contact?: SupplierContact | null;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, supplierId, contact }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isContactLoading = useSupplierDetailStore((s) => s.isContactLoading);
  const createContact = useSupplierDetailStore((s) => s.createContact);
  const patchContact = useSupplierDetailStore((s) => s.patchContact);

  const isEdit = !!contact;

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setRole(contact.role ?? '');
      setEmail(contact.email);
      setPhone(contact.phone);
      setIsPrimary(contact.is_primary);
    } else {
      resetFields();
    }
  }, [contact, isOpen]);

  const resetFields = () => {
    setName('');
    setRole('');
    setEmail('');
    setPhone('');
    setIsPrimary(false);
    setErrors({});
    setSubmitError(null);
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!phone.trim()) errs.phone = 'Phone is required.';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      setSubmitError(null);
      if (isEdit && contact) {
        await patchContact(supplierId, contact.id, {
          name: name.trim(),
          role: role.trim() || undefined,
          email: email.trim(),
          phone: phone.trim(),
          is_primary: isPrimary,
        });
      } else {
        await createContact(supplierId, {
          supplier: supplierId,
          name: name.trim(),
          role: role.trim() || undefined,
          email: email.trim(),
          phone: phone.trim(),
          is_primary: isPrimary,
        });
      }
      handleClose();
    } catch {
      setSubmitError(`Failed to ${isEdit ? 'update' : 'add'} contact. Please try again.`);
    }
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: '#566d7e' }} />
            <h2 id="contact-modal-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              {isEdit ? 'Edit Contact' : 'Add Contact'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {submitError && <div className="modal-error">{submitError}</div>}

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="contact-name">
                Name <span className="required">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Smith"
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="contact-role">Role</label>
              <input
                id="contact-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Sales Manager"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="contact-email">
                Email <span className="required">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@supplier.com"
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="contact-phone">
                Phone <span className="required">*</span>
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +263 77 123 4567"
              />
              {errors.phone && <div className="field-error">{errors.phone}</div>}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 400,
              }}
            >
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                style={{ width: 'auto' }}
              />
              Set as primary contact
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose} disabled={isContactLoading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isContactLoading}>
            {isContactLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Contact'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
