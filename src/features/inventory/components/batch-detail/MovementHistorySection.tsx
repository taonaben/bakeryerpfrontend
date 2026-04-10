/**
 * Movement History Section
 * Displays all movements (IN/OUT) involving this batch
 * Fetches from /inventory/batches/:id/movements endpoint
 */

import React from 'react';
import { BatchDetailResponse } from '../../types/batchDetail';
import { StockMovement } from '../../types/models';
import useBatchDetailStore from '../../stores/batchDetailStore';
import MovementLedgerTable from '../../views/stock_movements/MovementLedgerTable';

interface MovementHistorySectionProps {
  batch: BatchDetailResponse;
  movements: StockMovement[];
}

const MovementHistorySection: React.FC<MovementHistorySectionProps> = ({
  batch,
  movements,
}) => {
  // Get pagination state from store
  const { currentPage, totalPages } = useBatchDetailStore(
    (state) => state.movementsPagination
  );
  const isLoading = useBatchDetailStore((state) => state.isLoading);
  const fetchMovements = useBatchDetailStore((state) => state.fetchMovements);

  if (movements.length === 0) {
    return (
      <div className="empty-state-card">
        <p>No movements recorded for this batch yet.</p>
      </div>
    );
  }

  const handlePageChange = async (page: number) => {
    try {
      await fetchMovements(batch.id, page);
    } catch (error) {
      console.error('Failed to fetch movements for page:', page, error);
    }
  };

  return (
    <div className="movement-history-section">
      <MovementLedgerTable
        movements={movements}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={handlePageChange}
      />
      <div className="section-footer">
        <a href="/inventory/movements" className="link-secondary">
          View All Movements →
        </a>
      </div>
    </div>
  );
};

export default MovementHistorySection;
