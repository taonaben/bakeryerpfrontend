/**
 * Shared Print Preview Modal
 *
 * A generic modal shell that handles:
 *  - Modal overlay + header + close button
 *  - Scrollable A4 paper preview area
 *  - Print and Save-as-PDF action buttons (via react-to-print)
 *  - Injecting SHARED_PRINT_STYLES so the output is never blank
 *
 * Usage — pass any document template as children:
 *
 *   <PrintPreviewModal
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     title="Preview — PR-2026-0003"
 *     documentTitle="PR-2026-0003"
 *   >
 *     <RequisitionDocument requisition={requisition} />
 *   </PrintPreviewModal>
 *
 * To extend print styles for a specific document, concatenate:
 *   extraPrintStyles="  .my-class { color: red; }"
 */

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Printer, Download } from 'lucide-react';
import { SHARED_PRINT_STYLES } from './printStyles';

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Text shown in the modal header */
  title: string;
  /** Filename used when saving as PDF (no extension needed) */
  documentTitle: string;
  /** The A4 document content to preview and print */
  children: React.ReactNode;
  /** Optional extra CSS appended to the shared print stylesheet */
  extraPrintStyles?: string;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  documentTitle,
  children,
  extraPrintStyles = '',
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const pageStyle = SHARED_PRINT_STYLES + extraPrintStyles;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle,
  });

  const handleDownload = useReactToPrint({
    contentRef: printRef,
    documentTitle,
    pageStyle,
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div
        className="modal-content print-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable A4 paper preview */}
        <div className="print-preview-body">
          <div className="print-preview-paper">
            <div ref={printRef}>
              {children}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="modal-footer print-preview-footer">
          <button onClick={onClose} className="btn btn-secondary" type="button">
            Close
          </button>
          <div className="print-preview-actions">
            <button onClick={handleDownload} className="btn btn-secondary" type="button">
              <Download size={16} />
              Save as PDF
            </button>
            <button onClick={handlePrint} className="btn btn-primary" type="button">
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintPreviewModal;
