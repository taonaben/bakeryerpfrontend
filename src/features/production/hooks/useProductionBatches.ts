import { useEffect } from 'react';
import { useProductionBatchListStore } from '../stores/productionBatchListStore';

export const useProductionBatches = (orderId: string) => {
  const batches = useProductionBatchListStore((s) => s.batches);
  const isLoading = useProductionBatchListStore((s) => s.isLoading);
  const error = useProductionBatchListStore((s) => s.error);
  const fetchBatches = useProductionBatchListStore((s) => s.fetchBatches);
  const clearBatches = useProductionBatchListStore((s) => s.clearBatches);

  useEffect(() => {
    if (orderId) {
      fetchBatches(orderId);
    }
    return () => {
      clearBatches();
    };
  }, [orderId]);

  return { batches, isLoading, error };
};
