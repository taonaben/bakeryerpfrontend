/**
 * Requisition Detail Page
 * Route: /procurement/requisitions/:requisitionId
 *
 * Layout: sidebar (actions + metadata) + main content (overview card)
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import useRequisitionDetailStore from '../../stores/requisitionDetailStore';
import Breadcrumb from '../../../../shared/components/Breadcrumb';
import type { BreadcrumbItem } from '../../../../shared/components/Breadcrumb';
import SidePanelActions from '../../components/requisition-detail/SidePanelActions';
import OverviewCard from '../../components/requisition-detail/OverviewCard';
import '../../styles/procurement.css';
import '../../../inventory/styles/batch-detail.css';

const RequisitionDetailPage: React.FC = () => {
  const { requisitionId } = useParams<{ requisitionId: string }>();
  const navigate = useNavigate();

  const requisition = useRequisitionDetailStore((s) => s.requisition);
  const isLoading = useRequisitionDetailStore((s) => s.isLoading);
  const error = useRequisitionDetailStore((s) => s.error);
  const fetchRequisition = useRequisitionDetailStore((s) => s.fetchRequisition);
  const clearRequisition = useRequisitionDetailStore((s) => s.clearRequisition);

  useEffect(() => {
    if (!requisitionId) {
      navigate('/procurement/requisitions');
      return;
    }
    fetchRequisition(requisitionId);
    return () => { clearRequisition(); };
  }, [requisitionId, fetchRequisition, navigate, clearRequisition]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Requisitions', href: '/procurement/requisitions' },
    ...(requisition
      ? [{ label: requisition.pr_number, isActive: true } as BreadcrumbItem]
      : []),
  ];

  // Loading
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

  // Error
  if (error && !requisition) {
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
          <button onClick={() => requisitionId && fetchRequisition(requisitionId)} className="btn btn-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not found
  if (!requisition) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Requisition Not Found</h2>
          <p>The requisition you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="detail-container">
        <aside className="side-panel">
          <SidePanelActions requisition={requisition} />
        </aside>

        <main className="main-content">
          <section className="detail-section">
            <h2 className="section-title">Requisition Details</h2>
            <OverviewCard requisition={requisition} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default RequisitionDetailPage;
