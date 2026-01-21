import apiClient from './api.js';

export const inventoryService = {
    // Fetches the ledger of movements (what you provided in Postman)
    getStockMovements: async (warehouseId) => {
        const response = await apiClient.get(`/inventory/stock_movements`, {
            params: { warehouse_id: warehouseId }
            
        });
        return response.data;
    },

    // Optional: If you have an endpoint for current stock balances
    getStockBalances: async (warehouseId) => {
        const response = await apiClient.get(`/inventory/stocks`, {
            params: { warehouse_id: warehouseId }
        });
        return response.data;
    }
};