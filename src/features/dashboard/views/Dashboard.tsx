import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Package,
  Truck,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Clock,
} from 'lucide-react';
import type { User, Warehouse } from '../../../shared/types/navigation';
import '../styles/dashboard.css';

interface DashboardProps {
  user: User | null;
  activeWarehouse: Warehouse | null;
}

/**
 * DASHBOARD CONTENT COMPONENT
 * 
 * Now purely focused on dashboard content.
 * Layout/sidebar handled by parent Layout component.
 */
const Dashboard: React.FC<DashboardProps> = ({ user, activeWarehouse }) => {
  const navigate = useNavigate();

  // Permission check
  const canAccess = (moduleName: string): boolean => {
    const permissions: Record<string, string[]> = {
      Admin: ['Procurement', 'Inventory', 'Production', 'Sales', 'Reporting'],
      Production: ['Inventory', 'Production'],
      Warehouse: ['Procurement', 'Inventory'],
      Sales: ['Sales', 'Reporting'],
    };
    return permissions[user?.role || '']?.includes(moduleName) || false;
  };

  return (
    <div className="dashboard-content">
      <h2 className="dashboard-title">Operational Overview</h2>

      {/* KPI STATS RIBBON (Admin Only) */}
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
              <span className="value alert">4 Low Stock</span>
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
        {/* Quick Actions Column */}
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
                <p>
                  Monitor raw materials in{' '}
                  <b>{activeWarehouse?.name || 'warehouse'}</b>.
                </p>
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

        {/* Alerts Column */}
        <div className="alerts-column">
          <h3 className="section-title">System Alerts</h3>
          <div className="alerts-panel">
            <div className="alert-item">
              <AlertCircle size={18} color="#e74c3c" />
              <div className="alert-text">
                <b>Context Active</b>
                <span>
                  Viewing: {activeWarehouse?.name || 'Please select warehouse'}
                </span>
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
  );
};

export default Dashboard;
