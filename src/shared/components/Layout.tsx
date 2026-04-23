import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Layout.css';
import { User } from '@/features/auth/types/models';
import { Warehouse } from '@/core/warehouses/types/models';

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
 * - Sidebar (always visible, collapsible, with warehouse selector & user menu)
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

  return (
    <div className="erp-layout">
      {/* Global Sidebar */}
      <Sidebar
        user={user}
        activeWarehouse={activeWarehouse}
        warehouses={warehouses}
        onWarehouseChange={onWarehouseChange}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className={`main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Page Content */}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
