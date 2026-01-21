import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, Search, Filter, AlertTriangle, 
    ArrowLeft, Download, Plus, Loader2, X,
    History, Database, Layers 
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import '/src/assets/css/inventory.css';

const InventoryPage = () => {
    const navigate = useNavigate();
    
    // 1. New State for Tab Navigation
    // Options: 'movements', 'balances', 'batches'
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

    const CURRENT_WAREHOUSE_ID = "eb33011f-e9b1-4634-976e-ab72f7c02165";

    useEffect(() => {
        const loadData = async () => {
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

        // We only load movement data if that tab is active (or load all at once)
        loadData();
    }, [activeTab]); // Refetch when switching tabs if needed

    const filteredMovements = Array.isArray(movements) ? movements.filter(m => {
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
                    <button className="btn btn-outline"><Download size={18} /> Export</button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Log Movement
                    </button>
                </div>
            </header>

            {/* 2. SUB-LEDGER NAVIGATION TABS */}
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

            {/* 3. CONDITIONAL RENDERING BASED ON ACTIVE TAB */}
            
            {/* VIEW A: STOCK MOVEMENTS (Your existing logic) */}
            {activeTab === 'movements' && (
                <>
                    <div className="inventory-toolbar">
                        <div className="search-container">
                            <Search size={18} className="search-icon" />
                            <input 
                                type="text" 
                                className="search-input"
                                placeholder="Search movements..." 
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

            {/* VIEW B: STOCK BALANCES (Placeholder for your next API) */}
            {activeTab === 'balances' && (
                <div className="table-container" style={{padding: '40px', textAlign: 'center'}}>
                    <Database size={48} color="#cbd5e1" />
                    <h3>Stock Balance Ledger</h3>
                    <p>This view will show the current total quantity of each product in this warehouse.</p>
                    <button className="btn btn-outline" style={{margin: '0 auto'}}>Fetch Current Balances</button>
                </div>
            )}

            {/* VIEW C: BATCH REGISTRY (Placeholder for your next API) */}
            {activeTab === 'batches' && (
                <div className="table-container" style={{padding: '40px', textAlign: 'center'}}>
                    <Layers size={48} color="#cbd5e1" />
                    <h3>Batch Tracking Registry</h3>
                    <p>This view will show specific batch details, production dates, and expiry status.</p>
                    <button className="btn btn-outline" style={{margin: '0 auto'}}>View Batch Lifecycles</button>
                </div>
            )}

            {/* MODAL logic remains exactly as you had it */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    {/* ... your existing modal content ... */}
                </div>
            )}
        </div>
    );
};

export default InventoryPage;