import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Breadcrumb from '@/shared/components/Breadcrumb';
import type { BreadcrumbItem } from '@/shared/components/Breadcrumb';
import { useProductionOrderDetailStore } from '../../../stores';
import ProductionOrderOverviewCard from '../../../components/order-detail/ProductionOrderOverviewCard';
import ProductionOrderSidePanelActions from '../../../components/order-detail/ProductionOrderSidePanelActions';
import '../../../styles/production.css';
import '@/features/inventory/styles/batch-detail.css';

const ProductionOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const order = useProductionOrderDetailStore((state) => state.order);
  const summary = useProductionOrderDetailStore((state) => state.summary);
  const finishExpectations = useProductionOrderDetailStore((state) => state.finishExpectations);
  const planResult = useProductionOrderDetailStore((state) => state.planResult);
  const lastStartResult = useProductionOrderDetailStore((state) => state.lastStartResult);
  const lastFinishResult = useProductionOrderDetailStore((state) => state.lastFinishResult);
  const isLoading = useProductionOrderDetailStore((state) => state.isLoading);
  const error = useProductionOrderDetailStore((state) => state.error);
  const isPlanning = useProductionOrderDetailStore((state) => state.isPlanning);
  const isLoadingExpectations = useProductionOrderDetailStore((state) => state.isLoadingExpectations);
  const isLoadingSummary = useProductionOrderDetailStore((state) => state.isLoadingSummary);
  const fetchOrder = useProductionOrderDetailStore((state) => state.fetchOrder);
  const planOrder = useProductionOrderDetailStore((state) => state.planOrder);
  const fetchFinishExpectations = useProductionOrderDetailStore((state) => state.fetchFinishExpectations);
  const fetchSummary = useProductionOrderDetailStore((state) => state.fetchSummary);
  const clearOrder = useProductionOrderDetailStore((state) => state.clearOrder);

  useEffect(() => {
    if (!orderId) {
      navigate('/production/orders');
      return;
    }

    fetchOrder(orderId);

    return () => {
      clearOrder();
    };
  }, [orderId, navigate, fetchOrder, clearOrder]);

  useEffect(() => {
    if (!orderId) return;

    Promise.allSettled([
      planOrder(orderId),
      fetchFinishExpectations(orderId),
    ]).catch(() => {
      // Individual store actions already capture their own errors.
    });
  }, [orderId, planOrder, fetchFinishExpectations]);

  useEffect(() => {
    if (!orderId || order?.status !== 'completed') return;

    fetchSummary(orderId).catch(() => {
      // Store action already captures the error.
    });
  }, [orderId, order?.status, fetchSummary]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Production', href: '/production' },
    { label: 'Orders', href: '/production/orders' },
    ...(order ? [{ label: order.product_name, isActive: true } as BreadcrumbItem] : []),
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

  if (error && !order) {
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

  if (!order) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Production Order Not Found</h2>
          <p>The production order you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-detail-page production-order-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="detail-container">
        <aside className="side-panel">
          <ProductionOrderSidePanelActions order={order} />
        </aside>

        <main className="main-content">
          <ProductionOrderOverviewCard
            order={order}
            planResult={planResult}
            finishExpectations={finishExpectations}
            finishResult={lastFinishResult}
            startResult={lastStartResult}
            summary={summary}
            isLoadingPlan={isPlanning}
            isLoadingExpectations={isLoadingExpectations}
            isLoadingSummary={isLoadingSummary}
          />
        </main>
      </div>
    </div>
  );
};

export default ProductionOrderDetailPage;
