import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Breadcrumb from '../../../../shared/components/Breadcrumb';
import type { BreadcrumbItem } from '../../../../shared/components/Breadcrumb';
import useSupplierInvoicesDetailStore from '../../stores/supplierInvoicesDetailStore';
import SupplierInvoiceOverviewCard from '../../components/supplier-invoice-detail/OverviewCard';
import SupplierInvoiceSidePanelActions from '../../components/supplier-invoice-detail/SidePanelActions';
import MatchSection from '../../components/supplier-invoice-detail/MatchSection';
import '../../styles/procurement.css';
import '../../../inventory/styles/batch-detail.css';

const SupplierInvoiceDetailPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const supplierInvoice = useSupplierInvoicesDetailStore((s) => s.supplierInvoice);
  const matchResult = useSupplierInvoicesDetailStore((s) => s.matchResult);
  const isLoading = useSupplierInvoicesDetailStore((s) => s.isLoading);
  const isMatching = useSupplierInvoicesDetailStore((s) => s.isMatching);
  const error = useSupplierInvoicesDetailStore((s) => s.error);
  const matchError = useSupplierInvoicesDetailStore((s) => s.matchError);
  const fetchInvoice = useSupplierInvoicesDetailStore((s) => s.fetchInvoice);
  const fetchMatch = useSupplierInvoicesDetailStore((s) => s.fetchMatch);
  const clearInvoice = useSupplierInvoicesDetailStore((s) => s.clearInvoice);

  useEffect(() => {
    if (!invoiceId) {
      navigate('/procurement/invoices');
      return;
    }

    fetchInvoice(invoiceId);
    return () => {
      clearInvoice();
    };
  }, [invoiceId, fetchInvoice, clearInvoice, navigate]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Supplier Invoices', href: '/procurement/invoices' },
    ...(supplierInvoice
      ? [{ label: supplierInvoice.invoice_number, isActive: true } as BreadcrumbItem]
      : []),
  ];

  if (isLoading) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="loading-skeleton">
          <div className="skeleton-sidebar" />
          <div className="skeleton-content" />
        </div>
      </div>
    );
  }

  if (error && !supplierInvoice) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button onClick={() => invoiceId && fetchInvoice(invoiceId)} className="btn btn-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!supplierInvoice) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Supplier Invoice Not Found</h2>
          <p>The supplier invoice you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="detail-container">
        <aside className="side-panel">
          <SupplierInvoiceSidePanelActions supplierInvoice={supplierInvoice} />
        </aside>

        <main className="main-content">
          <section className="detail-section">
            <h2 className="section-title">Supplier Invoice Details</h2>
            <SupplierInvoiceOverviewCard supplierInvoice={supplierInvoice} />
          </section>

          <section className="detail-section">
            <h2 className="section-title">3-Way Match</h2>
            <MatchSection
              matchResult={matchResult}
              isLoading={isMatching}
              error={matchError}
              onRunMatch={() => fetchMatch(supplierInvoice.id, true)}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default SupplierInvoiceDetailPage;
