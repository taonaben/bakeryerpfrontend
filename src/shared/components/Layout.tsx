import React, { useState, useEffect } from 'react';
import { LogOut, Factory, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import type { User, Warehouse } from '../types/navigation';
import './Layout.css';

interface LayoutProps {
  user: User | null;
  activeWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  onWarehouseChange: (warehouse: Warehouse) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

/**
 * LAYOUT COMPONENT
 * 
 * Global layout wrapper that includes:
 * - Sidebar (always visible, collapsible)
 * - Top bar with warehouse selector & user menu
 * - Main content area (children)
 * 
 * This component maintains the context across all pages.
 */
const Layout: React.FC<LayoutProps> = ({
  user,
  activeWarehouse,
  warehouses,
  onWarehouseChange,
  onLogout,
  children,
}) => {
  const [showWhDropdown, setShowWhDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent<{ isCollapsed: boolean }>) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, []);

  // Get user initials for avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '??';

  return (
    <div className="erp-layout">
      {/* Global Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className={`main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <header className="top-bar">
          {/* Warehouse Selector */}
          <div className="warehouse-selector-container">
            <div
              className="warehouse-tag"
              onClick={() => setShowWhDropdown(!showWhDropdown)}
            >
              <Factory size={14} />
              <span>{activeWarehouse ? activeWarehouse.name : 'Select Warehouse'}</span>
              <ChevronDown size={14} />
            </div>

            {/* Dropdown Menu */}
            {showWhDropdown && (
              <div className="warehouse-dropdown">
                {warehouses.length > 0 ? (
                  warehouses.map((wh) => (
                    <div
                      key={wh.id}
                      className={`dropdown-item ${
                        activeWarehouse?.id === wh.id ? 'active' : ''
                      }`}
                      onClick={() => {
                        onWarehouseChange(wh);
                        setShowWhDropdown(false);
                      }}
                    >
                      <div className="dropdown-item-title">{wh.name}</div>
                      <div className="dropdown-item-subtitle">
                        Code: {wh.id.substring(0, 8)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item empty">No warehouses available</div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="user-nav">
            <div className="user-profile">
              <div className="avatar">{initials}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Unknown User'}</span>
                <span className="user-role">{user?.role || 'No Role'}</span>
              </div>
            </div>
            <button className="logout-link" onClick={onLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
