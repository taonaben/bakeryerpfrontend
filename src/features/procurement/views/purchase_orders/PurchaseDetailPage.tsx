import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Breadcrumb from '../../../../shared/components/Breadcrumb';
import type { BreadcrumbItem } from '../../../../shared/components/Breadcrumb';
import usePurchaseOrderDetailStore from '../../stores/purchaseOrderDetailStore';
import PurchaseOrderOverviewCard from '../../components/purchase-order-detail/OverviewCard';
import PurchaseOrderSidePanelActions from '../../components/purchase-order-detail/SidePanelActions';
import '../../styles/procurement.css';
import '../../../inventory/styles/batch-detail.css';

const PurchaseDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const purchaseOrder = usePurchaseOrderDetailStore((s) => s.purchaseOrder);
  const isLoading = usePurchaseOrderDetailStore((s) => s.isLoading);
  const error = usePurchaseOrderDetailStore((s) => s.error);
  const fetchOrder = usePurchaseOrderDetailStore((s) => s.fetchOrder);
  const clearOrder = usePurchaseOrderDetailStore((s) => s.clearOrder);

  useEffect(() => {
    if (!orderId) {
      navigate('/procurement/purchase-orders');
      return;
    }

    fetchOrder(orderId);
    return () => {
      clearOrder();
    };
  }, [orderId, fetchOrder, clearOrder, navigate]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
    ...(purchaseOrder
      ? [{ label: purchaseOrder.po_number, isActive: true } as BreadcrumbItem]
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

  if (error && !purchaseOrder) {
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
          <button onClick={() => orderId && fetchOrder(orderId)} className="btn btn-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Purchase Order Not Found</h2>
          <p>The purchase order you're looking for doesn't exist or has been deleted.</p>
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
          <PurchaseOrderSidePanelActions purchaseOrder={purchaseOrder} />
        </aside>

        <main className="main-content">
          <section className="detail-section">
            <h2 className="section-title">Purchase Order Details</h2>
            <PurchaseOrderOverviewCard purchaseOrder={purchaseOrder} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default PurchaseDetailPage;
