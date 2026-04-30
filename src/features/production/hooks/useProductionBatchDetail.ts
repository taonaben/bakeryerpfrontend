import { useEffect } from 'react';
import { useProductionBatchDetailStore } from '../stores/productionBatchDetailStore';

export const useProductionBatchDetail = (orderId: string, batchId: string) => {
  const batch = useProductionBatchDetailStore((s) => s.batch);
  const isLoading = useProductionBatchDetailStore((s) => s.isLoading);
  const error = useProductionBatchDetailStore((s) => s.error);
  const fetchBatch = useProductionBatchDetailStore((s) => s.fetchBatch);
  const clearBatch = useProductionBatchDetailStore((s) => s.clearBatch);

  useEffect(() => {
    if (orderId && batchId) {
      fetchBatch(orderId, batchId);
    }
    return () => {
      clearBatch();
    };
  }, [orderId, batchId]);

  return { batch, isLoading, error };
};
