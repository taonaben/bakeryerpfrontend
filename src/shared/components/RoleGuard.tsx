import React from 'react';
import type { UserRole } from '@/features/auth/types/models';
import { getRoleConfig } from '@/config/roles';

/**
 * RBAC (Role-Based Access Control) Components
 * Use these to conditionally render UI elements based on user roles
 */

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  userRole: UserRole | null | undefined;
}

/**
 * RoleGuard Component
 * Renders children only if user has one of the allowed roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
  userRole,
}) => {
  if (!userRole) return <>{fallback}</>;
  if (!allowedRoles.includes(userRole)) return <>{fallback}</>;
  return <>{children}</>;
};

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
  userRole: UserRole | null | undefined;
}

/**
 * PermissionGuard Component
 * Renders children only if user has the specified permission
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback = null,
  userRole,
}) => {
  if (!userRole) return <>{fallback}</>;

  const config = getRoleConfig(userRole);
  const hasPermission = config.permissions.includes(permission);

  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
};

interface ActionGuardProps {
  children: React.ReactNode;
  action: 'view_reports' | 'export_data' | 'edit_master_data' | 'approve_transactions' | 'manage_users';
  fallback?: React.ReactNode;
  userRole: UserRole | null | undefined;
}

/**
 * ActionGuard Component
 * Renders children based on user capability for specific actions
 */
export const ActionGuard: React.FC<ActionGuardProps> = ({
  children,
  action,
  fallback = null,
  userRole,
}) => {
  if (!userRole) return <>{fallback}</>;

  const config = getRoleConfig(userRole);
  let canPerform = false;

  switch (action) {
    case 'view_reports':
      canPerform = config.canViewReports;
      break;
    case 'export_data':
      canPerform = config.canExportData;
      break;
    case 'edit_master_data':
      canPerform = config.canEditMasterData;
      break;
    case 'approve_transactions':
      canPerform = config.canApproveTransactions;
      break;
    case 'manage_users':
      canPerform = config.canManageUsers;
      break;
  }

  if (!canPerform) return <>{fallback}</>;
  return <>{children}</>;
};

interface RoleInfoBadgeProps {
  userRole: UserRole | null | undefined;
  showDepartment?: boolean;
}

/**
 * RoleInfoBadge Component
 * Displays user's role information as a badge
 */
export const RoleInfoBadge: React.FC<RoleInfoBadgeProps> = ({
  userRole,
  showDepartment = true,
}) => {
  if (!userRole) return null;

  const config = getRoleConfig(userRole);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 12px',
        borderRadius: '6px',
        backgroundColor: '#f0f0f0',
        fontSize: '12px',
        fontWeight: '500',
      }}
      title={config.description}
    >
      <span>{config.label}</span>
      {showDepartment && (
        <span style={{ opacity: 0.6 }}>({config.department})</span>
      )}
    </div>
  );
};

interface RoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  filterByDepartment?: string;
}

/**
 * RoleSelect Component
 * Dropdown for selecting user roles
 */
export const RoleSelect: React.FC<RoleSelectProps> = ({
  value,
  onChange,
  disabled = false,
  filterByDepartment,
}) => {
  const { getAllRoles, getRolesByDepartment } = require('../config/roles');

  const roles = filterByDepartment
    ? getRolesByDepartment(filterByDepartment)
    : getAllRoles();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as UserRole)}
      disabled={disabled}
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <option value="">Select a role...</option>
      {roles.map((role: any) => (
        <option key={role.key} value={role.key}>
          {role.label} ({role.department})
        </option>
      ))}
    </select>
  );
};
