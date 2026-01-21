import React, { useState, useEffect } from 'react';
import { 
    Package, Search, Filter, AlertTriangle, 
    ArrowLeft, Download, Plus, Loader2, X 
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import '/src/assets/css/inventory.css';

const InventoryPage = ({ onBack }) => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        batch: '',
        movement_type: 'IN',
        quantity: '',
        reference_number: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // The Warehouse ID from your Render URL
    const CURRENT_WAREHOUSE_ID = "eb33011f-e9b1-4634-976e-ab72f7c02165";

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Loading inventory data for warehouse:', CURRENT_WAREHOUSE_ID);
                
                const data = await inventoryService.getStockMovements(CURRENT_WAREHOUSE_ID);
                console.log('API Response:', data);
                
                // Handle paginated response - extract results array
                if (data && Array.isArray(data.results)) {
                    setMovements(data.results);
                } else if (Array.isArray(data)) {
                    setMovements(data);
                } else {
                    console.warn('API returned unexpected data format:', data);
                    setMovements([]);
                    setError('Invalid data format received from server');
                }
            } catch (err) {
                console.error("API Error:", err);
                
                // More detailed error handling
                if (err.response) {
                    const status = err.response.status;
                    const message = err.response.data?.detail || err.response.data?.message || 'Server error';
                    
                    if (status === 401) {
                        setError('Authentication failed. Please login again.');
                    } else if (status === 403) {
                        setError('Access denied. You do not have permission to view this data.');
                    } else if (status === 404) {
                        setError('Warehouse not found or no data available.');
                    } else {
                        setError(`Server error (${status}): ${message}`);
                    }
                } else if (err.request) {
                    setError('Cannot connect to server. Please check your internet connection.');
                } else {
                    setError('An unexpected error occurred: ' + err.message);
                }
                
                setMovements([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSubmitMovement = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            await inventoryService.addStockMovement(CURRENT_WAREHOUSE_ID, formData);
            setShowModal(false);
            setFormData({ batch: '', movement_type: 'IN', quantity: '', reference_number: '', notes: '' });
            // Reload data
            const data = await inventoryService.getStockMovements(CURRENT_WAREHOUSE_ID);
            if (data && Array.isArray(data.results)) {
                setMovements(data.results);
            }
        } catch (err) {
            console.error('Error adding movement:', err);
            setError('Failed to add movement: ' + (err.response?.data?.detail || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    // Filter logic for search bar (searching by reference number or batch)
    const filteredMovements = Array.isArray(movements) ? movements.filter(m => {
        // Safely handle potential null/undefined values
        const refNumber = m?.reference_number?.toLowerCase() || '';
        const batch = m?.batch?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return refNumber.includes(searchLower) || batch.includes(searchLower);
    }) : [];

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
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Log Movement
                    </button>
                </div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            <div className="inventory-toolbar">
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder="Search by reference or batch..." 
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
                            filteredMovements.map(m => {
                                // Safe data extraction with fallbacks
                                const date = m?.created_at ? new Date(m.created_at).toLocaleDateString() : 'N/A';
                                const refNumber = m?.reference_number || 'N/A';
                                const batch = m?.batch || 'N/A';
                                const movementType = m?.movement_type || 'UNKNOWN';
                                const quantity = m?.quantity !== undefined ? m.quantity : 0;
                                const notes = m?.notes || '---';
                                
                                return (
                                    <tr key={m?.id || Math.random()}>
                                        <td>{date}</td>
                                        <td style={{ fontWeight: '600' }}>{refNumber}</td>
                                        <td><code className="batch-tag">{batch}</code></td>
                                        <td>
                                            <span className={`badge ${movementType.toLowerCase()}`}>
                                                {movementType}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: '700', color: quantity < 0 ? '#ef4444' : '#10b981' }}>
                                            {quantity}
                                        </td>
                                        <td className="text-muted">{notes}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    {error ? 'Error loading data. Please try again.' : 'No movements found for this warehouse.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for adding new movement */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Log Stock Movement</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitMovement}>
                            <div className="form-group">
                                <label>Batch ID</label>
                                <input 
                                    type="text" 
                                    value={formData.batch}
                                    onChange={(e) => setFormData({...formData, batch: e.target.value})}
                                    placeholder="e.g., 48866bc2-2d5d-451e-80d3-aa603eed39cf"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Movement Type</label>
                                <select 
                                    value={formData.movement_type}
                                    onChange={(e) => setFormData({...formData, movement_type: e.target.value})}
                                >
                                    <option value="IN">IN - Stock Added</option>
                                    <option value="OUT">OUT - Stock Removed</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Quantity</label>
                                <input 
                                    type="number" 
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                    placeholder="e.g., 21"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Reference Number</label>
                                <input 
                                    type="text" 
                                    value={formData.reference_number}
                                    onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                                    placeholder="e.g., ref-002"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Notes (Optional)</label>
                                <textarea 
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Additional notes..."
                                    rows="3"
                                />
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Adding...' : 'Add Movement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;