import React, { useState, useEffect } from 'react';
// 1. Import useNavigate for URL-based navigation
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ClipboardList, 
    ShoppingCart, BarChart3, Truck, Settings, 
    LogOut, Factory, TrendingUp, AlertCircle, Clock, ChevronDown
} from 'lucide-react';
import apiClient from '../../../services/api'; 
import '../styles/dashboard.css';

/**
 * Dashboard Component
 * Receives activeWarehouse and onWarehouseChange from App.jsx to maintain 
 * a global context across all ERP modules.
 */
const Dashboard = ({ user, onLogout, activeWarehouse, onWarehouseChange }) => {
    const navigate = useNavigate(); 
    
    // Internal state for the list of available warehouses
    const [warehouses, setWarehouses] = useState([]);
    // State to toggle the visibility of the dropdown menu
    const [showWhDropdown, setShowWhDropdown] = useState(false);

    /**
     * WAREHOUSE FETCHING
     * Automatically runs on load to fetch available locations from the backend.
     */
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                // Ensure this URL matches your backend exactly (e.g., 'inventory/warehouses/')
                const response = await apiClient.get('/warehouses');
                const data = response.data.results || response.data;
                setWarehouses(data);

                /**
                 * AUTO-SELECT DEFAULT:
                 * If there's no warehouse in localStorage yet, we pick the first one
                 * from the database automatically.
                 */
                if (!activeWarehouse && data.length > 0) {
                    // Line 37 FIX: Added safety check to ensure function exists before calling
                    if (typeof onWarehouseChange === 'function') {
                        onWarehouseChange(data[0]);
                    }
                }
            } catch (err) {
                console.error("Dashboard: Error loading warehouses:", err);
            }
        };
        fetchWarehouses();
    }, [activeWarehouse, onWarehouseChange]);

    /**
     * PERMISSIONS logic for UI filtering
     */
    const canAccess = (moduleName) => {
        const permissions = {
            'Admin': ['Procurement', 'Inventory', 'Production', 'Sales', 'Reporting'],
            'Production': ['Inventory', 'Production'],
            'Warehouse': ['Procurement', 'Inventory'],
            'Sales': ['Sales', 'Reporting']
        };
        return permissions[user?.role]?.includes(moduleName);
    };

    // UI Helper: Get first letters for Avatar
    const initials = user?.name ? 
        user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 
        '??';

    return (
        <div className="erp-layout">
            {/* 1. SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Factory size={24} style={{ marginRight: '10px' }} />
                    Bakery ERP
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item active" onClick={() => navigate('/')}>
                        <LayoutDashboard size={20}/> Dashboard
                    </div>
                    
                    {canAccess('Procurement') && <div className="nav-item"><Truck size={20}/> Procurement</div>}
                    
                    {canAccess('Inventory') && (
                        <div className="nav-item" onClick={() => navigate('/inventory')}>
                            <Package size={20}/> Inventory
                        </div>
                    )}

                    {canAccess('Production') && <div className="nav-item"><ClipboardList size={20}/> Production</div>}
                    {canAccess('Sales') && <div className="nav-item"><ShoppingCart size={20}/> Sales & Dist.</div>}
                    {canAccess('Reporting') && <div className="nav-item"><BarChart3 size={20}/> Reports</div>}
                    
                    <div className="nav-item" style={{ marginTop: 'auto' }}><Settings size={20}/> Settings</div>
                </nav>
            </aside>

            {/* 2. MAIN AREA */}
            <main className="main-area">
                <header className="top-bar">
                    {/* --- DYNAMIC WAREHOUSE SELECTOR CONTAINER --- */}
                    <div style={{ position: 'relative' }}>
                        <div 
                            className="warehouse-tag" 
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => setShowWhDropdown(!showWhDropdown)}
                        >
                            <Factory size={14} />
                            <span>{activeWarehouse ? activeWarehouse.name : "Select Warehouse"}</span>
                            <ChevronDown size={14} />
                        </div>

                        {/* DROPDOWN MENU */}
                        {showWhDropdown && (
                            <div className="warehouse-dropdown">
                                {warehouses.length > 0 ? (
                                    warehouses.map(wh => (
                                        <div 
                                            key={wh.id} 
                                            className={`dropdown-item ${activeWarehouse?.id === wh.id ? 'active' : ''}`}
                                            onClick={() => {
                                                // Line 118 FIX: Check if function is valid before executing
                                                if (typeof onWarehouseChange === 'function') {
                                                    onWarehouseChange(wh);
                                                }
                                                setShowWhDropdown(false);
                                            }}
                                        >
                                            <div style={{ fontWeight: '600' }}>{wh.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                Code: {wh.id.substring(0, 8)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="dropdown-item" style={{ color: '#999', fontStyle: 'italic' }}>
                                        No warehouses available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="user-nav">
                        <div className="user-profile">
                            <div className="avatar">{initials}</div>
                            <div className="user-info">
                                <span className="user-name">{user?.name || 'Unknown User'}</span>
                                <span className="user-role">{user?.role || 'No Role'}</span>
                            </div>
                        </div>
                        <button className="logout-link" onClick={onLogout}>
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    <h2 style={{ color: '#566d7e', marginBottom: '25px', fontWeight: '700' }}>Operational Overview</h2>
                    
                    {/* KPI STATS RIBBON */}
                    {user?.role === 'Admin' && (
                        <section className="kpi-ribbon">
                            <div className="kpi-stat-card">
                                <div className="kpi-data">
                                    <h4>Today's Production</h4>
                                    <span className="value">1,250 Pies</span>
                                </div>
                                <TrendingUp size={24} color="#10b981" />
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-data">
                                    <h4>Inventory Alerts</h4>
                                    <span className="value" style={{ color: '#e74c3c' }}>4 Low Stock</span>
                                </div>
                                <AlertCircle size={24} color="#e74c3c" />
                            </div>
                            <div className="kpi-stat-card">
                                <div className="kpi-data">
                                    <h4>Daily Revenue</h4>
                                    <span className="value">$4,320.00</span>
                                </div>
                                <BarChart3 size={24} color="#566d7e" />
                            </div>
                        </section>
                    )}

                    {/* OPERATIONAL SPLIT GRID */}
                    <div className="ops-grid">
                        <div className="actions-column">
                            <h3 className="section-title">Quick Actions</h3>
                            <div className="module-grid">
                                {canAccess('Production') && (
                                    <div className="action-card" onClick={() => navigate('/production')}>
                                        <ClipboardList size={28} color="#566d7e" />
                                        <h3>Production Plan</h3>
                                        <p>Create batches & BOMs.</p>
                                    </div>
                                )}
                                {canAccess('Inventory') && (
                                    <div className="action-card" onClick={() => navigate('/inventory')}>
                                        <Package size={28} color="#566d7e" />
                                        <h3>Stock Control</h3>
                                        <p>Monitor raw materials in <b>{activeWarehouse?.name || 'warehouse'}</b>.</p>
                                    </div>
                                )}
                                {canAccess('Procurement') && (
                                    <div className="action-card" onClick={() => navigate('/procurement')}>
                                        <Truck size={28} color="#566d7e" />
                                        <h3>Purchasing</h3>
                                        <p>Log incoming orders.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="alerts-column">
                            <h3 className="section-title">System Alerts</h3>
                            <div className="alerts-panel">
                                <div className="alert-item">
                                    <AlertCircle size={18} color="#e74c3c" />
                                    <div className="alert-text">
                                        <b>Context Active</b>
                                        <span>Viewing: {activeWarehouse?.name || 'Please select warehouse'}</span>
                                    </div>
                                </div>
                                <div className="alert-item">
                                    <Clock size={18} color="#f39c12" />
                                    <div className="alert-text">
                                        <b>Pending Batch</b>
                                        <span>Standard Steak Pie batch #44 is late.</span>
                                    </div>
                                </div>
                                <div className="alert-item">
                                    <Package size={18} color="#27ae60" />
                                    <div className="alert-text">
                                        <b>Material Inbound</b>
                                        <span>50kg Flour added to Dry Store.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;