import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Factory, ChevronLeft, ChevronRight, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';
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
  onLogout: () => void;
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
 * - Warehouse selector (top)
 * - User info & logout (bottom)
 */
const Sidebar: React.FC<SidebarProps> = ({ user, activeWarehouse, warehouses, onWarehouseChange, onLogout, badges = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsed state - persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  // Company name state
  const [companyName, setCompanyName] = useState<string>('');

  // Warehouse dropdown state
  const [showWhDropdown, setShowWhDropdown] = useState(false);
  const whDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close warehouse dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (whDropdownRef.current && !whDropdownRef.current.contains(event.target as Node)) {
        setShowWhDropdown(false);
      }
    };
    if (showWhDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWhDropdown]);

  // User initials for avatar
  const initials = user
    ? `${user.first_name?.[0] || '?'}${user.last_name?.[0] || '?'}`.toUpperCase()
    : '??';

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

  const isModuleItemActive = (path: string, isActive?: (pathname: string) => boolean) => {
    if (isActive) {
      return isActive(location.pathname);
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
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

        {/* Warehouse Selector */}
        <div className="sidebar-warehouse" ref={whDropdownRef}>
          <div
            className="sidebar-warehouse-tag"
            onClick={() => setShowWhDropdown(!showWhDropdown)}
            data-tooltip={isCollapsed ? (activeWarehouse?.name || 'Select Warehouse') : undefined}
          >
            <Factory size={16} />
            {!isCollapsed && (
              <>
                <span>{activeWarehouse ? activeWarehouse.name : 'Select Warehouse'}</span>
                <ChevronDown size={14} className={`wh-chevron ${showWhDropdown ? 'open' : ''}`} />
              </>
            )}
          </div>
          {showWhDropdown && (
            <div className={`sidebar-warehouse-dropdown ${isCollapsed ? 'flyout' : ''}`}>
              {warehouses.length > 0 ? (
                warehouses.map((wh) => (
                  <div
                    key={wh.id}
                    className={`sidebar-wh-item ${activeWarehouse?.id === wh.id ? 'active' : ''}`}
                    onClick={() => { onWarehouseChange(wh); setShowWhDropdown(false); }}
                  >
                    <div className="sidebar-wh-item-title">{wh.name}</div>
                    <div className="sidebar-wh-item-subtitle">Code: {wh.id.substring(0, 8)}</div>
                  </div>
                ))
              ) : (
                <div className="sidebar-wh-item empty">No warehouses available</div>
              )}
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
              <div
                className="sidebar-section-header"
                data-tooltip={isCollapsed ? section.label : undefined}
              >
                {!isCollapsed && section.label}
              </div>
              {section.items.map((item) => {
                // If item has role restrictions, check them
                if (item.roles && user && !item.roles.includes(user.role)) {
                  return null;
                }

                const Icon = item.icon;
                const isActive = isModuleItemActive(item.path, item.isActive);
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

          {/* User Section (at very bottom) */}
          <div className="sidebar-user-section">
            <div className="sidebar-user-profile" data-tooltip={isCollapsed ? (user?.username || 'User') : undefined}>
              <div className="sidebar-avatar">{initials}</div>
              {!isCollapsed && (
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{user?.username || 'Unknown User'}</span>
                  <span className="sidebar-user-role">{user?.role || 'No Role'}</span>
                </div>
              )}
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={onLogout}
              data-tooltip={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
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

      {/* Warehouse Selector */}
      <div className="sidebar-warehouse" ref={whDropdownRef}>
        <div
          className="sidebar-warehouse-tag"
          onClick={() => setShowWhDropdown(!showWhDropdown)}
          data-tooltip={isCollapsed ? (activeWarehouse?.name || 'Select Warehouse') : undefined}
        >
          <Factory size={16} />
          {!isCollapsed && (
            <>
              <span>{activeWarehouse ? activeWarehouse.name : 'Select Warehouse'}</span>
              <ChevronDown size={14} className={`wh-chevron ${showWhDropdown ? 'open' : ''}`} />
            </>
          )}
        </div>
        {showWhDropdown && (
          <div className={`sidebar-warehouse-dropdown ${isCollapsed ? 'flyout' : ''}`}>
            {warehouses.length > 0 ? (
              warehouses.map((wh) => (
                <div
                  key={wh.id}
                  className={`sidebar-wh-item ${activeWarehouse?.id === wh.id ? 'active' : ''}`}
                  onClick={() => { onWarehouseChange(wh); setShowWhDropdown(false); }}
                >
                  <div className="sidebar-wh-item-title">{wh.name}</div>
                  <div className="sidebar-wh-item-subtitle">Code: {wh.id.substring(0, 8)}</div>
                </div>
              ))
            ) : (
              <div className="sidebar-wh-item empty">No warehouses available</div>
            )}
          </div>
        )}
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

        {/* User Section (at very bottom) */}
        <div className="sidebar-user-section">
          <div className="sidebar-user-profile" data-tooltip={isCollapsed ? (user?.username || 'User') : undefined}>
            <div className="sidebar-avatar">{initials}</div>
            {!isCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.username || 'Unknown User'}</span>
                <span className="sidebar-user-role">{user?.role || 'No Role'}</span>
              </div>
            )}
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={onLogout}
            data-tooltip={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
