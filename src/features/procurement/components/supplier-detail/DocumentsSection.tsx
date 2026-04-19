import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import type { SupplierDocument, DocumentType } from '../../types/models';
import { useSupplierDetailStore } from '../../stores/supplierDetailStore';
import DocumentModal from './DocumentModal';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CONTRACT: 'Contract',
  HEALTH_CERT: 'Health Certificate',
  TAX_CLEARANCE: 'Tax Clearance',
  CERTIFICATION: 'Certification',
  OTHER: 'Other',
};

interface DocumentsSectionProps {
  supplierId: string;
  documents: SupplierDocument[];
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ supplierId, documents }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDocument, setEditDocument] = useState<SupplierDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierDocument | null>(null);

  const isDocumentLoading = useSupplierDetailStore((s) => s.isDocumentLoading);
  const deleteDocument = useSupplierDetailStore((s) => s.deleteDocument);

  const handleEdit = (doc: SupplierDocument) => {
    setEditDocument(doc);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditDocument(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditDocument(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDocument(supplierId, deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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
          Documents{' '}
          <span className="line-items-count" style={{ marginLeft: '6px' }}>
            {documents.length}
          </span>
        </h2>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          Add Document
        </button>
      </div>

      {documents.length === 0 ? (
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
          No documents added yet.
        </div>
      ) : (
        <table className="line-items-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>File</th>
              <th>Issued</th>
              <th>Expiry</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const hasUrl = !!doc.file_url?.trim();
              const expired = isExpired(doc.expiry_date);
              return (
                <tr key={doc.id}>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                  </td>
                  <td className="product-cell">{doc.name}</td>
                  <td>
                    {hasUrl ? (
                      <span
                        style={{
                          fontSize: '0.82rem',
                          color: '#64748b',
                          maxWidth: '130px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                        title={doc.file_url}
                      >
                        {doc.file_name || 'File attached'}
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <AlertCircle size={11} /> Missing URL
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{formatDate(doc.issued_date)}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {doc.expiry_date ? (
                      <span
                        style={{
                          color: expired ? '#ef4444' : 'inherit',
                          fontWeight: expired ? 600 : 400,
                        }}
                        title={expired ? 'This document has expired' : undefined}
                      >
                        {formatDate(doc.expiry_date)}
                        {expired && ' ⚠'}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {doc.is_active ? (
                      <span
                        style={{
                          background: '#d1fae5',
                          color: '#065f46',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                        }}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#e2e8f0',
                          color: '#475569',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                        }}
                      >
                        Inactive
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      {hasUrl ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-btn"
                          title="View document"
                          aria-label={`View ${doc.name}`}
                        >
                          <ExternalLink size={15} />
                        </a>
                      ) : (
                        <button
                          className="icon-btn"
                          disabled
                          title="No file URL — add a URL to view this document"
                          aria-label="No file URL available"
                          style={{ opacity: 0.35, cursor: 'not-allowed' }}
                        >
                          <ExternalLink size={15} />
                        </button>
                      )}
                      <button
                        className="icon-btn"
                        onClick={() => handleEdit(doc)}
                        title="Edit document"
                        aria-label={`Edit ${doc.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => setDeleteTarget(doc)}
                        title="Delete document"
                        aria-label={`Delete ${doc.name}`}
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog__overlay" onClick={() => setDeleteTarget(null)} />
          <div className="confirmation-dialog__content">
            <h3>Delete Document?</h3>
            <p>
              Are you sure you want to remove <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="confirmation-dialog__actions">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn btn-secondary"
                disabled={isDocumentLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDocumentLoading}
                className="btn btn-danger"
              >
                {isDocumentLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DocumentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        supplierId={supplierId}
        document={editDocument}
      />
    </section>
  );
};

export default DocumentsSection;
