/**
 * Supplier Detail Page
 * Route: /procurement/suppliers/:supplierId
 *
 * Layout: sidebar (metadata + actions) + main content (overview, contacts, documents)
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useSupplierDetailStore } from '../../stores/supplierDetailStore';
import Breadcrumb from '../../../../shared/components/Breadcrumb';
import type { BreadcrumbItem } from '../../../../shared/components/Breadcrumb';
import SupplierSidePanel from '../../components/supplier-detail/SupplierSidePanel';
import SupplierOverviewCard from '../../components/supplier-detail/SupplierOverviewCard';
import ContactsSection from '../../components/supplier-detail/ContactsSection';
import DocumentsSection from '../../components/supplier-detail/DocumentsSection';
import ProductsSection from '../../components/supplier-detail/ProductsSection';
import '../../styles/procurement.css';
import '../../../inventory/styles/batch-detail.css';

const SupplierDetailPage: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();

  const supplier = useSupplierDetailStore((s) => s.supplier);
  const isLoading = useSupplierDetailStore((s) => s.isLoading);
  const error = useSupplierDetailStore((s) => s.error);
  const fetchSupplier = useSupplierDetailStore((s) => s.fetchSupplier);
  const clearSupplier = useSupplierDetailStore((s) => s.clearSupplier);

  useEffect(() => {
    if (!supplierId) {
      navigate('/procurement/suppliers');
      return;
    }
    fetchSupplier(supplierId);
    return () => {
      clearSupplier();
    };
  }, [supplierId, fetchSupplier, navigate, clearSupplier]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Suppliers', href: '/procurement/suppliers' },
    ...(supplier ? [{ label: supplier.name, isActive: true } as BreadcrumbItem] : []),
  ];

  // ── Loading ──
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

  // ── Error ──
  if (error && !supplier) {
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
          <button
            onClick={() => supplierId && fetchSupplier(supplierId)}
            className="btn btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!supplier) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Supplier Not Found</h2>
          <p>The supplier you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-detail-page">
      {/* ── Header ── */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* ── Main Layout ── */}
      <div className="detail-container">
        <aside className="side-panel">
          <SupplierSidePanel supplier={supplier} />
        </aside>

        <main className="main-content">
          {/* Overview */}
          <section className="detail-section">
            <h2 className="section-title">Supplier Details</h2>
            <SupplierOverviewCard supplier={supplier} />
          </section>

          {/* Products */}
          <ProductsSection supplierId={supplier.id} products={supplier.products ?? []} />

          {/* Contacts */}
          <ContactsSection supplierId={supplier.id} contacts={supplier.contacts ?? []} />

          {/* Documents */}
          <DocumentsSection supplierId={supplier.id} documents={supplier.documents ?? []} />
        </main>
      </div>
    </div>
  );
};

export default SupplierDetailPage;
