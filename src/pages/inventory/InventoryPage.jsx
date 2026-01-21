import React, { useState, useEffect } from 'react';
import { 
    Package, Search, Filter, AlertTriangle, 
    ArrowLeft, Download, Plus, Loader2 
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import '/src/assets/css/inventory.css';

const InventoryPage = ({ onBack }) => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // The Warehouse ID from your Render URL
    const CURRENT_WAREHOUSE_ID = "eb33011f-e9b1-4634-976e-ab72f7c02165";

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await inventoryService.getStockMovements(CURRENT_WAREHOUSE_ID);
                setMovements(data);
                setError(null);
            } catch (err) {
                console.error("API Error:", err);
                setError("Failed to fetch stock movements from server.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter logic for search bar (searching by product name or batch)
    const filteredMovements = movements.filter(m =>
        m.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="spinner" size={40} />
                <p>Connecting to Bakery Vault...</p>
            </div>
        );
    }

    return (
        <div className="inventory-page">
            <nav className="top-nav">
                <button className="back-link" onClick={onBack}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            </nav>

            <header className="inventory-header">
                <div className="header-title">
                    <h1>Stock Movement Ledger</h1>
                    <p>Warehouse ID: {CURRENT_WAREHOUSE_ID.substring(0, 8)}...</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline"><Download size={18} /> Export CSV</button>
                    <button className="btn btn-primary"><Plus size={18} /> Log Movement</button>
                </div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            <div className="inventory-toolbar">
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder="Search by product or batch..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline"><Filter size={18} /> Filters</button>
            </div>

            <div className="table-container">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Batch</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMovements.length > 0 ? (
                            filteredMovements.map(m => (
                                <tr key={m.id}>
                                    <td>{new Date(m.created_at).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: '600' }}>{m.product_name}</td>
                                    <td><code className="batch-tag">{m.batch_number}</code></td>
                                    <td>
                                        <span className={`badge ${m.movement_type.toLowerCase()}`}>
                                            {m.movement_type}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '700', color: m.quantity < 0 ? '#ef4444' : '#10b981' }}>
                                        {m.quantity} {m.unit}
                                    </td>
                                    <td className="text-muted">{m.remarks || '---'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    No movements found for this warehouse.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryPage;