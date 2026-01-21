import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Search, Filter, AlertTriangle, 
    ArrowLeft, Download, Plus, Loader2, X,
    History, Database, Layers, CheckCircle 
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import '/src/assets/css/inventory.css';

const InventoryPage = () => {
    const navigate = useNavigate();
    
    // 1. Tab Navigation State
    const [activeTab, setActiveTab] = useState('movements');

    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        batch: '',
        movement_type: 'IN',
        quantity: '',
        reference_number: '',
        notes: ''
    });

    // Temporary hardcoded ID - this will be replaced by the global warehouse selector later
    const CURRENT_WAREHOUSE_ID = "eb33011f-e9b1-4634-976e-ab72f7c02165";

    useEffect(() => {
        const loadData = async () => {
            // We only fetch movement data if the movements tab is active
            if (activeTab !== 'movements') return;

            try {
                setLoading(true);
                setError(null);
                const data = await inventoryService.getStockMovements(CURRENT_WAREHOUSE_ID);
                
                if (data && Array.isArray(data.results)) {
                    setMovements(data.results);
                } else if (Array.isArray(data)) {
                    setMovements(data);
                }
            } catch (err) {
                console.error("API Error:", err);
                setError('Failed to load data from server.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab]);

    const filteredMovements = Array.isArray(movements) ? movements.filter(m => {
        const refNumber = m?.reference_number?.toLowerCase() || '';
        const batch = m?.batch?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        return refNumber.includes(searchLower) || batch.includes(searchLower);
    }) : [];

    // Helper to handle form submission (same logic as before)
    const handleSubmitMovement = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await inventoryService.addStockMovement(CURRENT_WAREHOUSE_ID, formData);
            setShowModal(false);
            setFormData({ batch: '', movement_type: 'IN', quantity: '', reference_number: '', notes: '' });
            const data = await inventoryService.getStockMovements(CURRENT_WAREHOUSE_ID);
            if (data && Array.isArray(data.results)) setMovements(data.results);
        } catch (err) {
            setError('Failed to add movement.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && activeTab === 'movements') {
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
                <button className="back-link" onClick={() => navigate('/')}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            </nav>

            <header className="inventory-header">
                <div className="header-title">
                    <h1>Inventory Control Hub</h1>
                    <p>Warehouse: <strong>Main Factory</strong> ({CURRENT_WAREHOUSE_ID.substring(0, 8)})</p>
                </div>
                <div className="header-actions">
                    {/* Only Global actions like Export stay in the top header */}
                    <button className="btn btn-outline"><Download size={18} /> Export Ledger</button>
                </div>
            </header>

            {/* TAB NAVIGATION */}
            <div className="inventory-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'movements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('movements')}
                >
                    <History size={18} /> Movement Ledger
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'balances' ? 'active' : ''}`}
                    onClick={() => setActiveTab('balances')}
                >
                    <Database size={18} /> Stock Balances
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'batches' ? 'active' : ''}`}
                    onClick={() => setActiveTab('batches')}
                >
                    <Layers size={18} /> Batches Registry
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* --- TAB VIEW: MOVEMENTS --- */}
            {activeTab === 'movements' && (
                <>
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
                        <div className="toolbar-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline"><Filter size={18} /> Filters</button>
                            {/* THE LOG MOVEMENT BUTTON: Moved here for tab-specific context */}
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <Plus size={18} /> Log Movement
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Reference</th>
                                    <th>Batch</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMovements.map(m => (
                                    <tr key={m?.id || Math.random()}>
                                        <td>{new Date(m.created_at).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: '600' }}>{m.reference_number}</td>
                                        <td><code className="batch-tag">{m.batch}</code></td>
                                        <td>
                                            <span className={`badge ${m.movement_type?.toLowerCase()}`}>
                                                {m.movement_type}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: '700', color: m.quantity < 0 ? '#ef4444' : '#10b981' }}>
                                            {m.quantity}
                                        </td>
                                        <td className="text-muted">{m.notes || '---'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* --- TAB VIEW: BALANCES --- */}
            {activeTab === 'balances' && (
                <>
                    <div className="inventory-toolbar">
                        <div className="search-container">
                            <Search size={18} className="search-icon" />
                            <input type="text" className="search-input" placeholder="Search balances..." />
                        </div>
                        <div className="toolbar-actions">
                            <button className="btn btn-primary">
                                <AlertTriangle size={18} /> Stock Reconciliation
                            </button>
                        </div>
                    </div>
                    <div className="table-container" style={{padding: '60px', textAlign: 'center'}}>
                        <Database size={48} color="#cbd5e1" style={{ marginBottom: '15px' }} />
                        <h3>Current Stock Balances</h3>
                        <p className="text-muted">Loading real-time quantities for <strong>Main Factory</strong>...</p>
                    </div>
                </>
            )}

            {/* --- TAB VIEW: BATCHES --- */}
            {activeTab === 'batches' && (
                <>
                    <div className="inventory-toolbar">
                        <div className="search-container">
                            <Search size={18} className="search-icon" />
                            <input type="text" className="search-input" placeholder="Search batch ID..." />
                        </div>
                        <div className="toolbar-actions">
                            <button className="btn btn-primary">
                                <CheckCircle size={18} /> Quality Audit
                            </button>
                        </div>
                    </div>
                    <div className="table-container" style={{padding: '60px', textAlign: 'center'}}>
                        <Layers size={48} color="#cbd5e1" style={{ marginBottom: '15px' }} />
                        <h3>Batch Tracking & Traceability</h3>
                        <p className="text-muted">Monitor production dates and expiry status across all batches.</p>
                    </div>
                </>
            )}

            {/* MODAL remains at the bottom of the component */}
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
                             {/* Form fields here (omitted for brevity but kept in your project) */}
                             <div className="form-group">
                                <label>Batch ID</label>
                                <input type="text" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} placeholder="Batch GUID" required />
                            </div>
                            <div className="form-group">
                                <label>Movement Type</label>
                                <select value={formData.movement_type} onChange={(e) => setFormData({...formData, movement_type: e.target.value})}>
                                    <option value="IN">IN - Stock Added</option>
                                    <option value="OUT">OUT - Stock Removed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Reference Number</label>
                                <input type="text" value={formData.reference_number} onChange={(e) => setFormData({...formData, reference_number: e.target.value})} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
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