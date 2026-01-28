import apiClient from '../../../services/api.js';

export const inventoryService = {
    // Fetches the ledger of movements (what you provided in Postman)
    getStockMovements: async (warehouseId) => {
        const response = await apiClient.get(`/inventory/stock_movements`, {
            params: { warehouse_id: warehouseId }
            
        });
        return response.data;
    },

    // Add new stock movement
    addStockMovement: async (warehouseId, movementData) => {
        const response = await apiClient.post(`/inventory/stock_movements`, {
            ...movementData,
            warehouse: warehouseId
        });
        return response.data;
    },

   /**
     * FETCH STOCK BALANCES
     * Returns a list of products and their total quantities in the specific warehouse.
     */
    getStockBalances: async (warehouseId) => {
        const response = await apiClient.get('/inventory/stocks', {
            params: { warehouse_id: warehouseId }
        });
        return response.data;
    },
    /**
     * FETCH BATCH REGISTRY
     * Returns specific batch details including manufacture and expiry dates.
     */
    getStockBatches: async (warehouseId) => {
        const response = await apiClient.get('/inventory/batches', {
            params: { warehouse_id: warehouseId }
        });
        return response.data;
    }
};