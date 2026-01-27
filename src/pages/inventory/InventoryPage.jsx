import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Search, Filter, AlertTriangle, 
    ArrowLeft, Download, Plus, Loader2, X,
    History, Database, Layers, CheckCircle, Clock, Calendar 
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import '/src/assets/css/inventory.css';

/**
 * InventoryPage Component
 * Handles Movements, Balances, and Batch Registry views.
 */
const InventoryPage = ({ activeWarehouse }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('movements');
    
    // States for data
    const [movements, setMovements] = useState([]);
    const [balances, setBalances] = useState([]); 
    const [batches, setBatches] = useState([]); // New state for batches registry
    
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

    const warehouseId = activeWarehouse?.id;

    /**
     * DATE HELPER: Expiry Logic
     * Calculates if a batch is fresh, near expiry (7 days), or expired.
     */
    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return 'fresh';
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'expired';
        if (diffDays <= 7) return 'near';
        return 'fresh';
    };

    /**
     * DATA FETCHING logic
     * Handles the paginated "results" format shown in your Swagger for all tabs.
     */
    useEffect(() => {
        if (!warehouseId) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (activeTab === 'movements') {
                    const data = await inventoryService.getStockMovements(warehouseId);
                    setMovements(data.results || data);
                } else if (activeTab === 'balances') {
                    const data = await inventoryService.getStockBalances(warehouseId);
                    setBalances(data.results || data);
                } else if (activeTab === 'batches') {
                    // NEW: Fetching Batch Registry data
                    const data = await inventoryService.getStockBatches(warehouseId);
                    setBatches(data.results || data);
                }
            } catch (err) {
                console.error("Inventory API Error:", err);
                setError(`Failed to load ${activeTab} data.`);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab, warehouseId]);

    // Filter Logic for Movements
    const filteredMovements = Array.isArray(movements) ? movements.filter(m => 
        (m?.reference_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (m?.batch?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) : [];

    // Filter Logic for Balances
    const filteredBalances = Array.isArray(balances) ? balances.filter(b => 
        (b?.product?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) : [];

    // Filter Logic for Batches (Searching by Batch Number or Product ID)
    const filteredBatches = Array.isArray(batches) ? batches.filter(b => 
        (b?.batch_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (b?.product?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) : [];

    // Form submission helper
    const handleSubmitMovement = async (e) => {
        e.preventDefault();
        if (!warehouseId) return;
        setSubmitting(true);
        try {
            await inventoryService.addStockMovement(warehouseId, formData);
            setShowModal(false);
            setFormData({ batch: '', movement_type: 'IN', quantity: '', reference_number: '', notes: '' });
            const data = await inventoryService.getStockMovements(warehouseId);
            setMovements(data.results || data);
        } catch (err) {
            setError('Failed to add movement.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!activeWarehouse) {
        return (
            <div className="inventory-page" style={{ textAlign: 'center', padding: '100px' }}>
                <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '20px' }} />
                <h2>No Warehouse Selected</h2>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Dashboard</button>
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
                    <p>Current Warehouse: <strong>{activeWarehouse.name}</strong></p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline"><Download size={18} /> Export Ledger</button>
                </div>
            </header>

            {/* TAB NAVIGATION */}
            <div className="inventory-tabs">
                <button className={`tab-btn ${activeTab === 'movements' ? 'active' : ''}`} onClick={() => setActiveTab('movements')}>
                    <History size={18} /> Movement Ledger
                </button>
                <button className={`tab-btn ${activeTab === 'balances' ? 'active' : ''}`} onClick={() => setActiveTab('balances')}>
                    <Database size={18} /> Stock Balances
                </button>
                <button className={`tab-btn ${activeTab === 'batches' ? 'active' : ''}`} onClick={() => setActiveTab('batches')}>
                    <Layers size={18} /> Batches Registry
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="inventory-toolbar">
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder={`Search ${activeTab === 'batches' ? 'batch number' : activeTab === 'balances' ? 'product ID' : 'reference'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline"><Filter size={18} /> Filters</button>
                    {activeTab === 'movements' && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Log Movement
                        </button>
                    )}
                    {activeTab === 'batches' && (
                        <button className="btn btn-primary">
                            <CheckCircle size={18} /> Quality Audit
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><Loader2 className="spinner" size={40} /><p>Retrieving {activeTab}...</p></div>
            ) : (
                <div className="table-container">
                    {activeTab === 'movements' ? (
                        /* MOVEMENTS TABLE */
                        <table className="inventory-table">
                            <thead>
                                <tr><th>Date</th><th>Reference</th><th>Batch</th><th>Type</th><th>Quantity</th><th>Notes</th></tr>
                            </thead>
                            <tbody>
                                {filteredMovements.map(m => (
                                    <tr key={m?.id || Math.random()}>
                                        <td>{new Date(m.created_at).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: '600' }}>{m.reference_number}</td>
                                        <td><code className="batch-tag">{m.batch}</code></td>
                                        <td><span className={`badge ${m.movement_type?.toLowerCase()}`}>{m.movement_type}</span></td>
                                        <td style={{ fontWeight: '700', color: m.quantity < 0 ? '#ef4444' : '#10b981' }}>{m.quantity}</td>
                                        <td className="text-muted">{m.notes || '---'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : activeTab === 'balances' ? (
                        /* BALANCES TABLE */
                        <table className="inventory-table">
                            <thead>
                                <tr><th>Product ID</th><th>Quantity On Hand</th><th>Status</th><th>Last Updated</th></tr>
                            </thead>
                            <tbody>
                                {filteredBalances.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ fontWeight: '600', fontSize: '0.85rem', fontFamily: 'monospace' }}>{b.product}</td>
                                        <td style={{ fontWeight: '700', fontSize: '1.1rem' }}>{parseFloat(b.quantity_on_hand).toLocaleString()}</td>
                                        <td><span className={`badge ${b.status?.toLowerCase()}`}>{b.status}</span></td>
                                        <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                                            <Clock size={12} style={{marginRight: '5px', verticalAlign: 'middle'}} />
                                            {new Date(b.last_updated).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        /* BATCHES REGISTRY TABLE (Based on your Swagger) */
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Batch Number</th>
                                    <th>Product ID</th>
                                    <th>Quantity</th>
                                    <th>Manufactured</th>
                                    <th>Expiry Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBatches.length > 0 ? (
                                    filteredBatches.map(b => {
                                        const expiryStatus = getExpiryStatus(b.expiry_date);
                                        return (
                                            <tr key={b.id}>
                                                <td style={{ fontWeight: '700', color: 'var(--marble-blue)' }}>{b.batch_number}</td>
                                                <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{b.product.substring(0, 13)}...</td>
                                                <td style={{ fontWeight: '600' }}>{parseFloat(b.quantity).toLocaleString()}</td>
                                                <td>{new Date(b.manufacture_date).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge ${expiryStatus === 'expired' ? 'out' : expiryStatus === 'near' ? 'low' : 'in'}`}>
                                                        {new Date(b.expiry_date).toLocaleDateString()}
                                                        {expiryStatus === 'expired' && " (EXPIRED)"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="5" style={{textAlign:'center', padding:'40px'}}>No batch records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* MODAL remains the same */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Log Stock Movement</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmitMovement}>
                             <div className="form-group">
                                <label>Batch ID</label>
                                <input type="text" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} placeholder="Batch UUID" required />
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