import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Factory, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import {
  navigationItems,
  settingsItem,
  getNavigationForRole,
  getActiveModuleFromPath,
  getModuleSidebarConfig,
} from '../config/navigation';

import './Sidebar.css';
import { User } from '@/features/auth/types/models';
import { Warehouse } from '@/core/warehouses/types/models';
import { companyService } from '@/core/companies/services/companyService';

interface SidebarProps {
  user: User | null;
  activeWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  onWarehouseChange: (warehouse: Warehouse) => void;
  badges?: Record<string, number>;
}

/**
 * SIDEBAR COMPONENT
 * 
 * Context-aware navigation sidebar with two modes:
 * 
 * 1. MODULE LIST MODE (default / dashboard):
 *    Shows top-level modules filtered by user role
 * 
 * 2. MODULE SIDEBAR MODE (inside a module):
 *    Shows section-grouped sub-navigation for the active module
 *    with a back button to return to the module list
 * 
 * Features:
 * - Collapsible with hover tooltips / flyout menus
 * - Badge support for notification counts
 * - Role-based filtering
 * - Route-derived module context (auto-detects from URL)
 */
const Sidebar: React.FC<SidebarProps> = ({ user, badges = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsed state - persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  // Company name state
  const [companyName, setCompanyName] = useState<string>('');

  // Derive active module from current path
  const activeModuleId = getActiveModuleFromPath(location.pathname);
  const moduleConfig = activeModuleId ? getModuleSidebarConfig(activeModuleId) : null;

  // Find the module's nav item for label/icon
  const activeModuleNav = activeModuleId
    ? navigationItems.find((item) => item.id === activeModuleId)
    : null;

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  // Fetch company name when user changes
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        if (user?.company) {
          const company = await companyService.getCompany(user.company);
          setCompanyName(company.name);
        }
      } catch (error) {
        console.error('Failed to load company name:', error);
        setCompanyName('');
      }
    };

    fetchCompanyName();
  }, [user?.company]);

  // Filter navigation items by user role
  const visibleNavItems = user ? getNavigationForRole(user.role) : [];

  // Check if settings item should be visible
  const canSeeSettings = user && settingsItem.roles.includes(user.role);

  // Determine if a nav item is active
  const isNavActive = (item: typeof navigationItems[0]) => {
    if (item.isActive) {
      return item.isActive(location.pathname);
    }
    return location.pathname === item.path ||
           (item.path !== '/' && location.pathname.startsWith(item.path));
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle back button — return to dashboard
  const handleBack = () => {
    navigate('/');
  };

  // ─── MODULE SIDEBAR MODE ───
  if (moduleConfig && activeModuleNav) {
    return (
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Module Header */}
        <div className="sidebar-logo">
          <Factory size={24} />
          {!isCollapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-company-name">{companyName}</span>
              <span className="sidebar-module-name">{activeModuleNav.label}</span>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button className="sidebar-toggle" onClick={toggleSidebar} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Back Button */}
        <div
          className="sidebar-back-btn"
          onClick={handleBack}
          data-tooltip={isCollapsed ? 'Back to modules' : undefined}
        >
          <ArrowLeft size={18} />
          {!isCollapsed && <span>Back to modules</span>}
        </div>

        <nav className="sidebar-nav">
          {moduleConfig.sections.map((section) => (
            <div key={section.id} className="sidebar-section">
              {!isCollapsed && (
                <div className="sidebar-section-header">{section.label}</div>
              )}
              {section.items.map((item) => {
                // If item has role restrictions, check them
                if (item.roles && user && !item.roles.includes(user.role)) {
                  return null;
                }

                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : undefined;

                return (
                  <div
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    data-tooltip={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={20} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {badgeCount != null && badgeCount > 0 && (
                      <span className="nav-badge">{badgeCount}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Settings Item (at bottom) */}
          {canSeeSettings && (
            <div
              className={`nav-item settings-item ${isNavActive(settingsItem) ? 'active' : ''}`}
              onClick={() => navigate(settingsItem.path)}
              data-tooltip={isCollapsed ? settingsItem.label : undefined}
            >
              <settingsItem.icon size={20} />
              {!isCollapsed && <span>{settingsItem.label}</span>}
            </div>
          )}
        </nav>
      </aside>
    );
  }

  // ─── MODULE LIST MODE (Dashboard / default) ───
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/')}>
        <Factory size={24} />
        {!isCollapsed && <span>{companyName} ERP</span>}
      </div>

      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="sidebar-nav">
        {/* Main Navigation Items */}
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item);

          return (
            <div
              key={item.id}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              data-tooltip={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          );
        })}

        {/* Settings Item (at bottom) */}
        {canSeeSettings && (
          <div
            className={`nav-item settings-item ${isNavActive(settingsItem) ? 'active' : ''}`}
            onClick={() => navigate(settingsItem.path)}
            data-tooltip={isCollapsed ? settingsItem.label : undefined}
          >
            <settingsItem.icon size={20} />
            {!isCollapsed && <span>{settingsItem.label}</span>}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
