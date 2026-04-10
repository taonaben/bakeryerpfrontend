/**
 * Stock Movement Detail Page
 * Route: /inventory/stock_movements/:movementId
 * 
 * Layout: sidebar (actions + metadata) + main content (overview, batches)
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import useStockMovementDetailStore from '../stores/stockMovementDetailStore';
import Breadcrumb from '../../../shared/components/Breadcrumb';
import type { BreadcrumbDropdownItem, BreadcrumbItem } from '../../../shared/components/Breadcrumb';
import MovementSidePanelActions from '../components/stock-movement-detail/MovementSidePanelActions';
import OverviewCard from '../components/stock-movement-detail/OverviewCard';
import BatchesDetailTable from '../components/stock-movement-detail/BatchesDetailTable';
import '../styles/stock-movement-detail.css';

const StockMovementDetailPage: React.FC = () => {
  const { movementId } = useParams<{ movementId: string }>();
  const navigate = useNavigate();

  // Store hooks - movement detail
  const movement = useStockMovementDetailStore((state) => state.movement);
  const isLoading = useStockMovementDetailStore((state) => state.isLoading);
  const error = useStockMovementDetailStore((state) => state.error);
  const fetchMovement = useStockMovementDetailStore((state) => state.fetchMovement);
  const clearMovement = useStockMovementDetailStore((state) => state.clearMovement);
  const movementsList = useStockMovementDetailStore((state) => state.movementsList);
  const fetchMovementsList = useStockMovementDetailStore((state) => state.fetchMovementsList);

  // Fetch movement on mount
  useEffect(() => {
    if (!movementId) {
      navigate('/inventory');
      return;
    }
    fetchMovement(movementId);

    // Cleanup on unmount
    return () => {
      clearMovement();
    };
  }, [movementId, fetchMovement, navigate, clearMovement]);

  // Fetch all movements for breadcrumb dropdown
  useEffect(() => {
    fetchMovementsList();
  }, [fetchMovementsList]);

  // Build breadcrumb items with movement dropdown
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Inventory',
        href: '/inventory',
      },
      {
        label: 'Stock Movements',
        href: '/inventory?tab=movements',
        dropdownItems: movementsList.map((m) => ({
          label: `${m.reference_number} (${m.movement_type})`,
          value: m.id,
          href: `/inventory/stock_movements/${m.id}`,
        })) as BreadcrumbDropdownItem[],
        onDropdownSelect: (item: BreadcrumbDropdownItem) => {
          navigate(`/inventory/stock_movements/${item.value}`);
        },
      },
    ];

    if (movement) {
      items.push({
        label: movement.reference_number,
        isActive: true,
      } as BreadcrumbItem);
    }

    return items;
  }, [movement, movementsList, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="movement-detail-page">
        <div className="detail-header">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>
        <div className="loading-skeleton">
          <div className="skeleton-sidebar" />
          <div className="skeleton-content" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !movement) {
    return (
      <div className="movement-detail-page">
        <div className="detail-header">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button
            onClick={() => movementId && fetchMovement(movementId)}
            className="btn btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!isLoading && !movement) {
    return (
      <div className="movement-detail-page">
        <div className="detail-header">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Not Found</strong>
            <p>Stock movement not found.</p>
          </div>
          <button onClick={() => navigate('/inventory')} className="btn btn-secondary">
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="movement-detail-page">
      {/* Header with breadcrumb and back button */}
      <div className="detail-header">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
          aria-label="Go back to previous page"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main layout: sidebar + content */}
      <div className="detail-container">
        {/* Left Sidebar: Actions and metadata */}
        {movement && (
          <aside className="side-panel">
            <MovementSidePanelActions movement={movement} />
          </aside>
        )}

        {/* Main Content */}
        <main className="main-content">
          {/* Overview Section */}
          {movement && (
            <>
              <section className="detail-section">
                <h2 className="section-title">Overview</h2>
                <OverviewCard movement={movement} />
              </section>

              {/* Batches Section */}
              <section className="detail-section">
                <BatchesDetailTable movement={movement} />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default StockMovementDetailPage;
