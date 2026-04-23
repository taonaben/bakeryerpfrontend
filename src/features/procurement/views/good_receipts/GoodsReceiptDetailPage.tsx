import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Breadcrumb from '../../../../shared/components/Breadcrumb';
import type { BreadcrumbItem } from '../../../../shared/components/Breadcrumb';
import useGoodsReceiptDetailStore from '../../stores/grnDetailStore';
import GRNOverviewCard from '../../components/grn_detail/OverviewCard';
import GRNSidePanelActions from '../../components/grn_detail/SidePanelActions';
import '../../styles/procurement.css';
import '../../../inventory/styles/batch-detail.css';

const GoodsReceiptDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const goodsReceipt = useGoodsReceiptDetailStore((s) => s.goodsReceipt);
  const isLoading = useGoodsReceiptDetailStore((s) => s.isLoading);
  const error = useGoodsReceiptDetailStore((s) => s.error);
  const fetchReceipt = useGoodsReceiptDetailStore((s) => s.fetchReceipt);
  const clearReceipt = useGoodsReceiptDetailStore((s) => s.clearReceipt);

  useEffect(() => {
    if (!id) {
      navigate('/procurement/goods-receipts');
      return;
    }

    fetchReceipt(id);
    return () => {
      clearReceipt();
    };
  }, [id, fetchReceipt, clearReceipt, navigate]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Goods Receipts', href: '/procurement/goods-receipts' },
    ...(goodsReceipt
      ? [{ label: goodsReceipt.gr_number, isActive: true } as BreadcrumbItem]
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

  if (error && !goodsReceipt) {
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
          <button onClick={() => id && fetchReceipt(id)} className="btn btn-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!goodsReceipt) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Goods Receipt Not Found</h2>
          <p>The goods receipt you're looking for doesn't exist or has been deleted.</p>
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
          <GRNSidePanelActions goodsReceipt={goodsReceipt} />
        </aside>

        <main className="main-content">
          <section className="detail-section">
            <h2 className="section-title">Goods Receipt Details</h2>
            <GRNOverviewCard goodsReceipt={goodsReceipt} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default GoodsReceiptDetailPage;
