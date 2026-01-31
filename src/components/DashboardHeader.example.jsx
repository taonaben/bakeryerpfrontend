/**
 * Example: Dashboard Header with Theme Toggle
 * This shows how to integrate the ThemeToggle into your Dashboard
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LogOut } from 'lucide-react';

export const DashboardHeader = ({ user, onLogout, warehouse }) => {
  const { colors } = useTheme();

  const headerStyle = {
    backgroundColor: colors.backgroundSecondary,
    borderBottom: `2px solid ${colors.border}`,
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: `0 2px 8px ${colors.shadow}`,
  };

  const userSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const userInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '150px',
  };

  const nameStyle = {
    color: colors.text,
    fontWeight: '600',
    fontSize: '14px',
    margin: '0',
  };

  const warehouseStyle = {
    color: colors.textSecondary,
    fontSize: '12px',
    margin: '4px 0 0 0',
  };

  const logoutButtonStyle = {
    backgroundColor: colors.error,
    color: colors.background,
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  };

  const themeToggleStyle = {
    color: colors.text,
    backgroundColor: colors.backgroundTertiary,
    padding: '8px',
    borderRadius: '6px',
    border: `1px solid ${colors.border}`,
  };

  return (
    <div style={headerStyle}>
      <div>
        <h2 style={{ margin: 0, color: colors.primary }}>
          Bakery ERP Dashboard
        </h2>
        {warehouse && (
          <p style={{ margin: '8px 0 0 0', color: colors.textSecondary, fontSize: '14px' }}>
            Active Warehouse: <strong>{warehouse.name}</strong>
          </p>
        )}
      </div>

      <div style={userSectionStyle}>
        {/* Theme Toggle */}
        <div style={themeToggleStyle}>
          <ThemeToggle size={20} />
        </div>

        {/* User Info */}
        <div style={userInfoStyle}>
          <p style={nameStyle}>{user?.name || 'User'}</p>
          <p style={warehouseStyle}>
            {user?.emp_code ? `ID: ${user.emp_code}` : 'Employee'}
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          style={logoutButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colors.danger;
            e.target.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = colors.error;
            e.target.style.opacity = '1';
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
