/**
 * Batch Detail Page
 * Route: /inventory/batch/:batchId
 * 
 * Layout: sidebar (actions + metadata) + main content (overview, movements, future sections)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import useBatchDetailStore from '../../stores/batchDetailStore';
import { inventoryService } from '../../services/inventoryService';
import Breadcrumb from '../../../../shared/components/Breadcrumb';
import type { BreadcrumbDropdownItem, BreadcrumbItem } from '../../../../shared/components/Breadcrumb';
import type { BatchRegistry } from '../../types/models';
import SidePanelActions from '../../components/batch-detail/SidePanelActions';
import OverviewCard from '../../components/batch-detail/OverviewCard';
import ReworkStatusSection from '../../components/batch-detail/ReworkStatusSection';
import MovementHistorySection from '../../components/batch-detail/MovementHistorySection';
import QualityCheckPlaceholder from '../../components/batch-detail/QualityCheckPlaceholder';
import LotTrackingPlaceholder from '../../components/batch-detail/LotTrackingPlaceholder';
import ShelfLifePlaceholder from '../../components/batch-detail/ShelfLifePlaceholder';
import '../styles/batch-detail.css';

const BatchDetailPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  // Store hooks - batch detail
  const batch = useBatchDetailStore((state) => state.batch);
  const movements = useBatchDetailStore((state) => state.movements);
  const isLoading = useBatchDetailStore((state) => state.isLoading);
  const error = useBatchDetailStore((state) => state.error);
  const fetchBatch = useBatchDetailStore((state) => state.fetchBatch);
  const clearBatch = useBatchDetailStore((state) => state.clearBatch);

  // Local state for batch dropdown list
  const [batchesList, setBatchesList] = useState<BatchRegistry[]>([]);

  // Fetch batch on mount
  useEffect(() => {
    if (!batchId) {
      navigate('/inventory');
      return;
    }
    fetchBatch(batchId);

    // Cleanup on unmount
    return () => {
      clearBatch();
    };
  }, [batchId, fetchBatch, navigate, clearBatch]);

  // Fetch all batches for breadcrumb dropdown
  // In a real app, you'd get the warehouse ID from context or props
  useEffect(() => {
    const loadBatches = async () => {
      try {
        // TODO: Get the actual warehouse ID from context or props
        // For now, we'll try to infer it from the batch if available
        const warehouseId = batch?.warehouse;
        if (warehouseId) {
          const result = await inventoryService.fetchBatches(warehouseId);
          setBatchesList(result.data);
        }
      } catch (err) {
        console.warn('Failed to load batches for breadcrumb dropdown:', err);
      }
    };

    if (batch) {
      loadBatches();
    }
  }, [batch]);

  // Build breadcrumb items with batch dropdown
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Inventory',
        href: '/inventory',
      },
      {
        label: 'Batches',
        href: '/inventory?tab=batches',
        dropdownItems: batchesList.map((b) => ({
          label: `${b.batch_number}`,
          value: b.id,
          href: `/inventory/batch/${b.id}`,
        })) as BreadcrumbDropdownItem[],
        onDropdownSelect: (item: BreadcrumbDropdownItem) => {
          navigate(`/inventory/batch/${item.value}`);
        },
      },
    ];

    if (batch) {
      items.push({
        label: batch.batch_number,
        isActive: true,
      } as BreadcrumbItem);
    }

    return items;
  }, [batch, batchesList, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="batch-detail-page">
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
  if (error && !batch) {
    return (
      <div className="batch-detail-page">
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
            onClick={() => batchId && fetchBatch(batchId)}
            className="btn btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!batch) {
    return (
      <div className="batch-detail-page">
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
        <div className="empty-state">
          <h2>Batch Not Found</h2>
          <p>The batch you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-detail-page">
      {/* Breadcrumb Navigation */}
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

      {/* Main Layout: Sidebar + Content */}
      <div className="detail-container">
        {/* Sidebar Panel */}
        <aside className="side-panel">
          <SidePanelActions batch={batch} />
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Overview Section */}
          <section className="detail-section">
            <h2 className="section-title">Batch Details</h2>
            <OverviewCard batch={batch} />
          </section>

          {/* Rework Status Section */}
          {batch.rework_consumed && (
            <section className="detail-section">
              <ReworkStatusSection batch={batch} />
            </section>
          )}

          {/* Movement History Section */}
          <section className="detail-section">
            <h2 className="section-title">Movement History</h2>
            <MovementHistorySection batch={batch} movements={movements} />
          </section>

          {/* Future-Feature Placeholders */}
          <section className="detail-section placeholder-section">
            <h2 className="section-title">Quality & Compliance</h2>
            <QualityCheckPlaceholder />
          </section>

          <section className="detail-section placeholder-section">
            <h2 className="section-title">Lot & Traceability</h2>
            <LotTrackingPlaceholder />
          </section>

          <section className="detail-section placeholder-section">
            <h2 className="section-title">Shelf-Life Management</h2>
            <ShelfLifePlaceholder />
          </section>
        </main>
      </div>
    </div>
  );
};

export default BatchDetailPage;
