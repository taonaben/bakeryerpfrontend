import React from 'react';
import { 
    LayoutDashboard, Package, ClipboardList, 
    ShoppingCart, BarChart3, Truck, Settings, LogOut, Factory 
} from 'lucide-react';
import '../../assets/css/dashboard.css';

const Dashboard = ({ user, onLogout }) => {
    
    // Role-Based Permissions Logic
    const canAccess = (moduleName) => {
        const permissions = {
            'Admin': ['Procurement', 'Inventory', 'Production', 'Sales', 'Reporting'],
            'Production': ['Inventory', 'Production'],
            'Warehouse': ['Procurement', 'Inventory'],
            'Sales': ['Sales', 'Reporting']
        };
        return permissions[user.role]?.includes(moduleName);
    };

    return (
        <div className="erp-layout">
            {/* 1. Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Factory size={24} style={{ marginRight: '10px' }} />
                    Bakery ERP
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item active"><LayoutDashboard size={20}/> Dashboard</div>
                    
                    {canAccess('Procurement') && <div className="nav-item"><Truck size={20}/> Procurement</div>}
                    {canAccess('Inventory') && <div className="nav-item"><Package size={20}/> Inventory</div>}
                    {canAccess('Production') && <div className="nav-item"><ClipboardList size={20}/> Production</div>}
                    {canAccess('Sales') && <div className="nav-item"><ShoppingCart size={20}/> Sales & Dist.</div>}
                    {canAccess('Reporting') && <div className="nav-item"><BarChart3 size={20}/> Reports</div>}
                    
                    <div className="nav-item" style={{ marginTop: 'auto' }}><Settings size={20}/> Settings</div>
                </nav>
            </aside>

            {/* 2. Main Content Area */}
            <main className="main-area">
                <header className="top-bar">
                    <div className="warehouse-tag">Main Factory Warehouse #01</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '0.9rem' }}>
                            <strong>{user.name}</strong> ({user.role})
                        </span>
                        <button className="logout-btn" onClick={onLogout}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    <h2 style={{ padding: '0 30px', color: '#566d7e' }}>Operational Overview</h2>
                    
                    {/* KPI Widgets - Visible to Manager/Admin */}
                    {user.role === 'Admin' && (
                        <div className="dashboard-grid">
                            <div className="kpi-card">
                                <h4>Today's Production</h4>
                                <div className="kpi-value">1,250 Pies</div>
                                <span style={{ color: 'green', fontSize: '0.8rem' }}>↑ 12% vs Yesterday</span>
                            </div>
                            <div className="kpi-card">
                                <h4>Inventory Alerts</h4>
                                <div className="kpi-value" style={{ color: '#d9534f' }}>4 Low Stock</div>
                                <span style={{ fontSize: '0.8rem' }}>Beef, Shortening, Labels</span>
                            </div>
                            <div className="kpi-card">
                                <h4>Daily Revenue</h4>
                                <div className="kpi-value">$4,320.00</div>
                                <span style={{ fontSize: '0.8rem' }}>14 Pending Invoices</span>
                            </div>
                        </div>
                    )}

                    {/* Quick Access Module Cards */}
                    <div className="dashboard-grid">
                        {canAccess('Production') && (
                            <div className="module-link-card">
                                <ClipboardList size={40} color="#566d7e" />
                                <h3>Production Planning</h3>
                                <p>Schedule batches & BOMs</p>
                            </div>
                        )}
                        {canAccess('Inventory') && (
                            <div className="module-link-card">
                                <Package size={40} color="#566d7e" />
                                <h3>Warehouse Mgmt</h3>
                                <p>Track stock & movements</p>
                            </div>
                        )}
                        {canAccess('Procurement') && (
                            <div className="module-link-card">
                                <Truck size={40} color="#566d7e" />
                                <h3>Purchase Orders</h3>
                                <p>Inbound raw materials</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;