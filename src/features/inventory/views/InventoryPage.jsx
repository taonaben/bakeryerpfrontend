import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import '../styles/inventory.css';
import InventoryTabs from '../components/InventoryTabs';
import InventoryToolbar from '../components/InventoryToolbar';
import MovementLedgerTable from '../components/MovementLedgerTable';
import StockBalancesTable from '../components/StockBalancesTable';
import BatchesRegistryTable from '../components/BatchesRegistryTable';
import MovementModal from '../components/MovementModal';
import NoWarehouseSelected from '../components/NoWarehouseSelected';
import Button from '../../../components/ui/Button';

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
        return <NoWarehouseSelected onBack={() => navigate('/')} />;
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
                    <Button variant="outline"><Download size={18} /> Export Ledger</Button>
                </div>
            </header>

            {/* TAB NAVIGATION */}
            <InventoryTabs activeTab={activeTab} onChange={setActiveTab} />

            {error && <div className="error-banner">{error}</div>}

            <InventoryToolbar
                activeTab={activeTab}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onOpenMovementModal={() => setShowModal(true)}
            />

            {loading ? (
                <div className="loading-container"><Loader2 className="spinner" size={40} /><p>Retrieving {activeTab}...</p></div>
            ) : (
                <div className="table-container">
                    {activeTab === 'movements' ? (
                        <MovementLedgerTable movements={filteredMovements} />
                    ) : activeTab === 'balances' ? (
                        <StockBalancesTable balances={filteredBalances} />
                    ) : (
                        <BatchesRegistryTable batches={filteredBatches} />
                    )}
                </div>
            )}

            <MovementModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmitMovement}
                submitting={submitting}
            />
        </div>
    );
};

export default InventoryPage;