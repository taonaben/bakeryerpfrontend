import React, { useState } from 'react';
import { 
    Package, Search, Filter, AlertTriangle, 
    ArrowLeft, Download, Plus, FileText 
} from 'lucide-react';
import '../../assets/css/inventory.css';

const InventoryPage = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState("");
    
    const inventoryData = [
        { id: 1, name: "Premium Diced Beef", category: "Raw Material", stock: 45.5, unit: "kg", min_stock: 20, status: "In Stock" },
        { id: 2, name: "Pastry Flour", category: "Raw Material", stock: 120, unit: "kg", min_stock: 50, status: "In Stock" },
        { id: 3, name: "Salted Butter", category: "Raw Material", stock: 8.2, unit: "kg", min_stock: 15, status: "Low Stock" },
        { id: 4, name: "Single Pie Boxes", category: "Packaging", stock: 1500, unit: "units", min_stock: 500, status: "In Stock" },
        { id: 5, name: "Pork Mince", category: "Raw Material", stock: 0, unit: "kg", min_stock: 10, status: "Out of Stock" },
    ];

    const filteredItems = inventoryData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="inventory-page">
            {/* 1. Breadcrumb Navigation */}
            <nav className="top-nav">
                <button className="back-link" onClick={onBack}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            </nav>

            {/* 2. Header Section */}
            <header className="inventory-header">
                <div className="header-title">
                    <h1>Inventory Ledger</h1>
                    <p>Real-time stock monitoring and material tracking</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline"><Download size={18} /> Export CSV</button>
                    <button className="btn btn-primary"><Plus size={18} /> Add New Material</button>
                </div>
            </header>

            {/* 3. KPI Cards Section */}
            <div className="inventory-stats">
                <div className="stat-card">
                    <span className="stat-label">Total SKUs</span>
                    <span className="stat-value">{inventoryData.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Active Categories</span>
                    <span className="stat-value">2</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <span className="stat-label">Low Stock Alerts</span>
                    <span className="stat-value">1</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <span className="stat-label">Critical Shortage</span>
                    <span className="stat-value">1</span>
                </div>
            </div>

            {/* 4. Filter & Search Toolbar */}
            <div className="inventory-toolbar">
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder="Search by material name or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-actions">
                    <button className="btn btn-outline"><Filter size={18} /> Filters</button>
                </div>
            </div>

            {/* 5. Main Inventory Table */}
            <div className="table-container">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Material Name</th>
                            <th>Category</th>
                            <th>Current Stock</th>
                            <th>Threshold</th>
                            <th>Inventory Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id}>
                                <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>#{item.id}</td>
                                <td style={{ fontWeight: '600' }}>{item.name}</td>
                                <td>{item.category}</td>
                                <td style={{ fontWeight: '600' }}>{item.stock} {item.unit}</td>
                                <td>{item.min_stock} {item.unit}</td>
                                <td>
                                    <span className={`badge ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryPage;