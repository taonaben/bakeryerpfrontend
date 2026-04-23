import React, { useState } from 'react';
import { Plus, Pencil, Trash2, UserCheck } from 'lucide-react';
import type { SupplierContact } from '../../types/models';
import { useSupplierDetailStore } from '../../stores/supplierDetailStore';
import ContactModal from './ContactModal';

interface ContactsSectionProps {
  supplierId: string;
  contacts: SupplierContact[];
}

const ContactsSection: React.FC<ContactsSectionProps> = ({ supplierId, contacts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editContact, setEditContact] = useState<SupplierContact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierContact | null>(null);

  const isContactLoading = useSupplierDetailStore((s) => s.isContactLoading);
  const deleteContact = useSupplierDetailStore((s) => s.deleteContact);

  const handleEdit = (contact: SupplierContact) => {
    setEditContact(contact);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditContact(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditContact(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContact(supplierId, deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <section className="detail-section">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Contacts{' '}
          <span className="line-items-count" style={{ marginLeft: '6px' }}>
            {contacts.length}
          </span>
        </h2>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '32px',
            color: '#64748b',
            border: '1px dashed #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.88rem',
          }}
        >
          No contacts added yet.
        </div>
      ) : (
        <table className="line-items-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Primary</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="product-cell">{contact.name}</td>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{contact.role || '—'}</td>
                <td>{contact.email}</td>
                <td>{contact.phone || '—'}</td>
                <td>
                  {contact.is_primary ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#d1fae5',
                        color: '#065f46',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                      }}
                    >
                      <UserCheck size={11} /> Primary
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      className="icon-btn"
                      onClick={() => handleEdit(contact)}
                      title="Edit contact"
                      aria-label={`Edit ${contact.name}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => setDeleteTarget(contact)}
                      title="Delete contact"
                      aria-label={`Delete ${contact.name}`}
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog__overlay" onClick={() => setDeleteTarget(null)} />
          <div className="confirmation-dialog__content">
            <h3>Delete Contact?</h3>
            <p>
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> from this
              supplier's contacts?
            </p>
            <div className="confirmation-dialog__actions">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn btn-secondary"
                disabled={isContactLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isContactLoading}
                className="btn btn-danger"
              >
                {isContactLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        supplierId={supplierId}
        contact={editContact}
      />
    </section>
  );
};

export default ContactsSection;
