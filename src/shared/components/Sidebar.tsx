import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Factory, ChevronLeft, ChevronRight, ChevronDown, LogOut } from 'lucide-react';
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

const Sidebar: React.FC<SidebarProps> = ({ user, activeWarehouse, warehouses, onWarehouseChange, onLogout, badges = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  const [companyName, setCompanyName] = useState<string>('');
  const [showWhDropdown, setShowWhDropdown] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [flyoutModuleId, setFlyoutModuleId] = useState<string | null>(null);

  const whDropdownRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Auto-expand module matching current route
  useEffect(() => {
    const moduleId = getActiveModuleFromPath(location.pathname);
    if (moduleId) {
      setExpandedModules((prev) => new Set([...prev, moduleId]));
    }
  }, [location.pathname]);

  // Close warehouse dropdown on outside click
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

  // Close flyout on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        setFlyoutModuleId(null);
      }
    };
    if (flyoutModuleId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [flyoutModuleId]);

  // Persist collapsed state and notify layout
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  // Fetch company name
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

  const initials = user
    ? `${user.first_name?.[0] || '?'}${user.last_name?.[0] || '?'}`.toUpperCase()
    : '??';

  const visibleNavItems = user ? getNavigationForRole(user.role) : [];
  const canSeeSettings = user && settingsItem.roles.includes(user.role);

  const isNavActive = (item: typeof navigationItems[0]) => {
    if (item.isActive) return item.isActive(location.pathname);
    return location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path));
  };

  const isModuleItemActive = (path: string, isActive?: (pathname: string) => boolean) => {
    if (isActive) return isActive(location.pathname);
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getMostSpecificChildMatchId = (
    items: Array<{ id: string; path: string; isActive?: (pathname: string) => boolean }>
  ) => {
    let bestMatchId: string | null = null;
    let bestMatchLength = -1;

    for (const item of items) {
      const matches = item.isActive
        ? item.isActive(location.pathname)
        : isModuleItemActive(item.path);

      if (matches && item.path.length > bestMatchLength) {
        bestMatchId = item.id;
        bestMatchLength = item.path.length;
      }
    }

    return bestMatchId;
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
    setFlyoutModuleId(null);
  };

  const flyoutConfig = flyoutModuleId ? getModuleSidebarConfig(flyoutModuleId) : null;
  const flyoutNavItem = flyoutModuleId ? navigationItems.find((i) => i.id === flyoutModuleId) : null;
  const flyoutVisibleChildren = flyoutConfig
    ? flyoutConfig.sections.flatMap((section) =>
        section.items.filter((child) => !child.roles || (user && child.roles.includes(user.role)))
      )
    : [];
  const flyoutActiveChildId = getMostSpecificChildMatchId(flyoutVisibleChildren);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      {/* ─── HEADER ─── */}
      <div className="sidebar-logo">
        {!isCollapsed && (
          <>
            <Factory size={20} className="sidebar-logo-icon" />
            <span className="sidebar-app-name" onClick={() => navigate('/')}>
              {companyName} ERP
            </span>
          </>
        )}
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ─── WAREHOUSE SELECTOR ─── */}
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

      {/* ─── NAVIGATION ─── */}
      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => {
          const moduleConfig = getModuleSidebarConfig(item.id);
          const hasChildren = !!moduleConfig;
          const isExpanded = expandedModules.has(item.id);
          const isActive = isNavActive(item);
          const Icon = item.icon;
          const visibleChildren = moduleConfig
            ? moduleConfig.sections.flatMap((section) =>
                section.items.filter((child) => !child.roles || (user && child.roles.includes(user.role)))
              )
            : [];
          const activeChildId = getMostSpecificChildMatchId(visibleChildren);

          return (
            <div key={item.id} className="nav-group">
              {/* Parent row */}
              <div
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (isCollapsed && hasChildren) {
                    setFlyoutModuleId(flyoutModuleId === item.id ? null : item.id);
                  } else {
                    navigate(item.path);
                    if (hasChildren) toggleModule(item.id);
                  }
                }}
                data-tooltip={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && hasChildren && (
                  <ChevronDown
                    size={15}
                    className={`nav-chevron ${isExpanded ? 'open' : ''}`}
                  />
                )}
              </div>

              {/* Children (expanded sidebar only) */}
              {!isCollapsed && hasChildren && isExpanded && (
                <div className="nav-children">
                  {moduleConfig.sections.map((section) => (
                    <div key={section.id} className="nav-section">
                      <div className="nav-section-header">{section.label}</div>
                      {section.items.map((child) => {
                        if (child.roles && user && !child.roles.includes(user.role)) return null;
                        const isChildActive = child.isActive
                          ? child.isActive(location.pathname)
                          : activeChildId === child.id;
                        const badgeCount = child.badgeKey ? badges[child.badgeKey] : undefined;
                        return (
                          <div
                            key={child.id}
                            className={`nav-child ${isChildActive ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); navigate(child.path); }}
                          >
                            <span>{child.label}</span>
                            {badgeCount != null && badgeCount > 0 && (
                              <span className="nav-badge">{badgeCount}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Settings */}
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

        {/* User section */}
        <div className="sidebar-user-section">
          <div
            className="sidebar-user-profile"
            data-tooltip={isCollapsed ? (user?.username || 'User') : undefined}
          >
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

      {/* ─── FLYOUT PANEL (collapsed mode, modules with children) ─── */}
      {isCollapsed && flyoutConfig && flyoutNavItem && (
        <div className="sidebar-flyout" ref={flyoutRef}>
          <div className="sidebar-flyout-header">
            <flyoutNavItem.icon size={16} />
            <span>{flyoutNavItem.label}</span>
          </div>
          {flyoutConfig.sections.map((section) => (
            <div key={section.id} className="sidebar-flyout-section">
              <div className="sidebar-flyout-section-header">{section.label}</div>
              {section.items.map((child) => {
                if (child.roles && user && !child.roles.includes(user.role)) return null;
                const isChildActive = child.isActive
                  ? child.isActive(location.pathname)
                  : flyoutActiveChildId === child.id;
                const badgeCount = child.badgeKey ? badges[child.badgeKey] : undefined;
                const ChildIcon = child.icon;
                return (
                  <div
                    key={child.id}
                    className={`sidebar-flyout-item ${isChildActive ? 'active' : ''}`}
                    onClick={() => { navigate(child.path); setFlyoutModuleId(null); }}
                  >
                    <ChildIcon size={15} />
                    <span>{child.label}</span>
                    {badgeCount != null && badgeCount > 0 && (
                      <span className="nav-badge">{badgeCount}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
