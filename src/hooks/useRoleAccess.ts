import { useContext } from 'react';
import type { UserRole } from '../features/auth/types/models';
import {
  getRoleConfig,
  hasPermission,
  canAccessNavigation,
  isSeniorRole,
} from '../config/roles';

/**
 * Custom hook for role-based access control
 * Provides utilities for permission checking throughout the app
 */
export const useRoleAccess = (userRole: UserRole | null | undefined) => {
  if (!userRole) {
    return {
      hasPermission: () => false,
      canAccessNavigation: () => false,
      isSenior: () => false,
      getRoleInfo: () => null,
    };
  }

  return {
    /**
     * Check if user has a specific permission
     */
    hasPermission: (permission: string): boolean => {
      return hasPermission(userRole, permission);
    },

    /**
     * Check if user can access a navigation item
     */
    canAccessNavigation: (navigationItem: string): boolean => {
      return canAccessNavigation(userRole, navigationItem);
    },

    /**
     * Check if user's role is senior to another role
     */
    isSenior: (comparedTo: UserRole): boolean => {
      return isSeniorRole(userRole, comparedTo);
    },

    /**
     * Get complete role configuration
     */
    getRoleInfo: () => getRoleConfig(userRole),

    /**
     * Check multiple permissions (AND logic)
     */
    hasAllPermissions: (...permissions: string[]): boolean => {
      return permissions.every(permission => hasPermission(userRole, permission));
    },

    /**
     * Check multiple permissions (OR logic)
     */
    hasAnyPermission: (...permissions: string[]): boolean => {
      return permissions.some(permission => hasPermission(userRole, permission));
    },

    /**
     * Check if user can perform a specific action
     */
    canPerformAction: (action: string): boolean => {
      const config = getRoleConfig(userRole);
      const actionPermissionMap: Record<string, string> = {
        'view_reports': 'view_all_reports',
        'export_data': 'export_data',
        'edit_master_data': 'edit_master_data',
        'approve_transactions': 'approve_all_transactions',
        'manage_users': 'manage_users',
      };

      const requiredPermission = actionPermissionMap[action];
      if (!requiredPermission) return true; // Action not restricted

      return config.permissions.includes(requiredPermission);
    },
  };
};
