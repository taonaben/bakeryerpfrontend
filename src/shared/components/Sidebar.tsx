import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Factory, ChevronLeft, ChevronRight } from 'lucide-react';
import { navigationItems, settingsItem, getNavigationForRole } from '../config/navigation';
import type { User } from '../types/navigation';
import './Sidebar.css';

interface SidebarProps {
  user: User | null;
}

/**
 * SIDEBAR COMPONENT
 * 
 * Global navigation sidebar that:
 * - Reads from navigation config (modular)
 * - Highlights active route automatically
 * - Filters items by user role
 * - Maintains context across page navigation
 * - Collapsible with hover tooltips
 */
const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsed state - persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
    // Dispatch event for Layout to adjust margins
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  // Filter navigation items by user role
  const visibleNavItems = user ? getNavigationForRole(user.role) : [];

  // Check if settings item should be visible
  const canSeeSettings = user && settingsItem.roles.includes(user.role);

  // Determine if a nav item is active
  const isActive = (item: typeof navigationItems[0]) => {
    if (item.isActive) {
      return item.isActive(location.pathname);
    }
    // Default: exact match or starts with path
    return location.pathname === item.path || 
           (item.path !== '/' && location.pathname.startsWith(item.path));
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/')}>
        <Factory size={24} />
        {!isCollapsed && <span>Bakery ERP</span>}
      </div>

      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="sidebar-nav">
        {/* Main Navigation Items */}
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

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
            className={`nav-item settings-item ${isActive(settingsItem) ? 'active' : ''}`}
            onClick={() => navigate(settingsItem.path)}
          >
            <settingsItem.icon size={20} />
            <span>{settingsItem.label}</span>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
