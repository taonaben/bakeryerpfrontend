import React from 'react';
// 1. Import useNavigate to handle URL-based navigation
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ClipboardList, 
    ShoppingCart, BarChart3, Truck, Settings, 
    LogOut, Factory, TrendingUp, AlertCircle, Clock
} from 'lucide-react';
import '../../assets/css/dashboard.css';

/**
 * Dashboard Component
 * Now uses React Router 'navigate' to ensure the URL stays in the browser bar on refresh.
 */
const Dashboard = ({ user, onLogout }) => {
    // 2. Initialize the navigation hook
    const navigate = useNavigate();
    
    const canAccess = (moduleName) => {
        const permissions = {
            'Admin': ['Procurement', 'Inventory', 'Production', 'Sales', 'Reporting'],
            'Production': ['Inventory', 'Production'],
            'Warehouse': ['Procurement', 'Inventory'],
            'Sales': ['Sales', 'Reporting']
        };
        return permissions[user?.role]?.includes(moduleName);
    };

    // Extract initials for the profile avatar with safe fallback
    const initials = user?.name ? 
        user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 
        '??';

    return (
        <div className="erp-layout">
            {/* 1. SIDEBAR (YOUR EXACT STRUCTURE) */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Factory size={24} style={{ marginRight: '10px' }} />
                    Bakery ERP
                </div>
                <nav className="sidebar-nav">
                    {/* navigate('/') takes the user to the base URL (Dashboard) */}
                    <div className="nav-item active" onClick={() => navigate('/')}>
                        <LayoutDashboard size={20}/> Dashboard
                    </div>

                    {canAccess('Procurement') && <div className="nav-item"><Truck size={20}/> Procurement</div>}
                    
                    {canAccess('Inventory') && (
                        /* navigate('/inventory') updates the browser URL to /inventory */
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
                {/* UPGRADED TOP BAR */}
                <header className="top-bar">
                    <div className="warehouse-tag">Main Factory Warehouse #01</div>
                    
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
                        {/* LEFT: Quick Action Modules */}
                        <div className="actions-column">
                            <h3 className="section-title">Quick Actions</h3>
                            <div className="module-grid">
                                {canAccess('Production') && (
                                    <div className="action-card">
                                        <ClipboardList size={28} color="#566d7e" />
                                        <h3>Production Plan</h3>
                                        <p>Create batches & BOMs.</p>
                                    </div>
                                )}
                                {canAccess('Inventory') && (
                                    /* Quick Action Card now also uses navigate('/inventory') */
                                    <div className="action-card" onClick={() => navigate('/inventory')}>
                                        <Package size={28} color="#566d7e" />
                                        <h3>Stock Control</h3>
                                        <p>Monitor raw materials.</p>
                                    </div>
                                )}
                                {canAccess('Procurement') && (
                                    <div className="action-card">
                                        <Truck size={28} color="#566d7e" />
                                        <h3>Purchasing</h3>
                                        <p>Log incoming orders.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Notifications Panel */}
                        <div className="alerts-column">
                            <h3 className="section-title">System Alerts</h3>
                            <div className="alerts-panel">
                                <div className="alert-item">
                                    <AlertCircle size={18} color="#e74c3c" />
                                    <div className="alert-text">
                                        <b>Critical Low Stock</b>
                                        <span>Diced Beef (Dry Store) is below 5kg.</span>
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