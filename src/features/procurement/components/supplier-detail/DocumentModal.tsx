import React, { useState, useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import { useSupplierDetailStore } from '../../stores/supplierDetailStore';
import type { SupplierDocument, DocumentType } from '../../types/models';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CONTRACT: 'Contract',
  HEALTH_CERT: 'Health Certificate',
  TAX_CLEARANCE: 'Tax Clearance Certificate',
  CERTIFICATION: 'Certification',
  OTHER: 'Other',
};

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
  document?: SupplierDocument | null;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  supplierId,
  document,
}) => {
  const [docType, setDocType] = useState<DocumentType>('OTHER');
  const [name, setName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isDocumentLoading = useSupplierDetailStore((s) => s.isDocumentLoading);
  const createDocument = useSupplierDetailStore((s) => s.createDocument);
  const patchDocument = useSupplierDetailStore((s) => s.patchDocument);

  const isEdit = !!document;

  useEffect(() => {
    if (document) {
      setDocType(document.document_type);
      setName(document.name);
      setFileUrl(document.file_url ?? '');
      setFileName(document.file_name ?? '');
      setIssuedDate(document.issued_date ?? '');
      setExpiryDate(document.expiry_date ?? '');
      setNotes(document.notes ?? '');
      setIsActive(document.is_active);
    } else {
      resetFields();
    }
  }, [document, isOpen]);

  const resetFields = () => {
    setDocType('OTHER');
    setName('');
    setFileUrl('');
    setFileName('');
    setIssuedDate('');
    setExpiryDate('');
    setNotes('');
    setIsActive(true);
    setErrors({});
    setSubmitError(null);
  };

  if (!isOpen) return null;

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Document name is required.';
    if (fileUrl.trim() && !isValidUrl(fileUrl.trim())) {
      errs.fileUrl = 'Enter a valid URL (must start with http:// or https://).';
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      supplier: supplierId,
      document_type: docType,
      name: name.trim(),
      file_url: fileUrl.trim() || undefined,
      file_name: fileName.trim() || undefined,
      issued_date: issuedDate || undefined,
      expiry_date: expiryDate || undefined,
      notes: notes.trim() || undefined,
      is_active: isActive,
    };

    try {
      setSubmitError(null);
      if (isEdit && document) {
        await patchDocument(supplierId, document.id, payload);
      } else {
        await createDocument(supplierId, payload);
      }
      handleClose();
    } catch {
      setSubmitError(`Failed to ${isEdit ? 'update' : 'add'} document. Please try again.`);
    }
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="document-modal-title">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: '#566d7e' }} />
            <h2 id="document-modal-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              {isEdit ? 'Edit Document' : 'Add Document'}
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
              <label htmlFor="doc-type">
                Document Type <span className="required">*</span>
              </label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
              >
                {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((key) => (
                  <option key={key} value={key}>
                    {DOCUMENT_TYPE_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="doc-name">
                Document Name <span className="required">*</span>
              </label>
              <input
                id="doc-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tax Clearance 2026"
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="file-url">File URL</label>
            <input
              id="file-url"
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/document.pdf"
            />
            {errors.fileUrl && <div className="field-error">{errors.fileUrl}</div>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="file-name">File Name</label>
            <input
              id="file-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. tax_clearance_2026.pdf"
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="issued-date">Issued Date</label>
              <input
                id="issued-date"
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="expiry-date">Expiry Date</label>
              <input
                id="expiry-date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="doc-notes">Notes</label>
            <textarea
              id="doc-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this document…"
              style={{ resize: 'vertical' }}
            />
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
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: 'auto' }}
              />
              Document is active
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose} disabled={isDocumentLoading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isDocumentLoading}>
            {isDocumentLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
