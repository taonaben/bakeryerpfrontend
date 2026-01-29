import React, { useState } from 'react';
import type { UserRole } from '@/features/auth/types/models';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import {
  RoleGuard,
  PermissionGuard,
  ActionGuard,
  RoleInfoBadge,
  RoleSelect,
} from '@/shared/components/RoleGuard';
import { getRoleConfig, getAllRoles, getRolesByDepartment } from '@/config/roles';
import {
  PRODUCTION_PERMISSIONS,
  INVENTORY_PERMISSIONS,
  TRANSACTION_PERMISSIONS,
} from '@/config/permissions';
import { hasPermission } from '@/config/roles';

/**
 * EXAMPLE PATTERNS FOR ROLE-BASED ACCESS CONTROL
 * 
 * This file demonstrates common usage patterns for the role system.
 * Use these as templates for implementing RBAC in your components.
 */

// ============================================
// PATTERN 1: Simple Permission Check
// ============================================

interface ApprovalButtonProps {
  userRole: UserRole | null;
  onApprove: () => void;
}

/**
 * Example: Show approval button only if user has permission
 */
export const ApprovalButton: React.FC<ApprovalButtonProps> = ({
  userRole,
  onApprove,
}) => {
  const roleAccess = useRoleAccess(userRole);

  // Simple approach: direct check
  if (!roleAccess.hasPermission(PRODUCTION_PERMISSIONS.APPROVE_ORDERS)) {
    return <button disabled>Cannot Approve</button>;
  }

  return <button onClick={onApprove}>Approve Order</button>;
};

// ============================================
// PATTERN 2: Using RoleGuard Component
// ============================================

interface AdminPanelProps {
  userRole: UserRole | null;
}

/**
 * Example: Show UI only for specific roles
 */
export const AdminPanel: React.FC<AdminPanelProps> = ({ userRole }) => {
  return (
    <RoleGuard
      userRole={userRole}
      allowedRoles={['manager', 'owner_director', 'system_admin']}
      fallback={<p>⛔ Admin Access Required</p>}
    >
      <div className="admin-panel">
        <h2>Admin Settings</h2>
        {/* Admin UI here */}
      </div>
    </RoleGuard>
  );
};

// ============================================
// PATTERN 3: Multiple Permission Checks
// ============================================

interface InventoryManagementProps {
  userRole: UserRole | null;
}

/**
 * Example: Check multiple permissions with AND/OR logic
 */
export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  userRole,
}) => {
  const roleAccess = useRoleAccess(userRole);

  return (
    <div>
      {/* Feature 1: Available if user has BOTH permissions */}
      {roleAccess.hasAllPermissions(
        INVENTORY_PERMISSIONS.CREATE_MOVEMENT,
        INVENTORY_PERMISSIONS.APPROVE_MOVEMENT
      ) && (
        <section>
          <h3>Inventory Adjustments</h3>
          {/* Adjustment UI */}
        </section>
      )}

      {/* Feature 2: Available if user has ANY permission */}
      {roleAccess.hasAnyPermission(
        INVENTORY_PERMISSIONS.VIEW_REPORTS,
        TRANSACTION_PERMISSIONS.EXPORT_DATA
      ) && (
        <button>📊 View Reports</button>
      )}

      {/* Feature 3: Using permission constant */}
      {roleAccess.hasPermission(INVENTORY_PERMISSIONS.UPDATE_STOCK_LEVELS) && (
        <button>⚙️ Update Stock</button>
      )}
    </div>
  );
};

// ============================================
// PATTERN 4: Conditional Features by Access Level
// ============================================

interface UserCardProps {
  user: {
    id: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Example: Show features based on user role's capabilities
 */
export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const roleConfig = getRoleConfig(user.role);
  const roleAccess = useRoleAccess(user.role);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <RoleInfoBadge userRole={user.role} showDepartment />

      {/* Show features based on role capabilities */}
      <div className="features">
        {roleConfig.canViewReports && (
          <span>📈 Reports</span>
        )}
        {roleConfig.canExportData && (
          <span>📥 Export</span>
        )}
        {roleConfig.canEditMasterData && (
          <span>✏️ Edit Master Data</span>
        )}
        {roleConfig.canApproveTransactions && (
          <span>✅ Approvals</span>
        )}
        {roleConfig.canManageUsers && (
          <span>👥 User Management</span>
        )}
      </div>

      {/* Info from role config */}
      <p>Department: {roleConfig.department}</p>
      <p>Access Level: {roleConfig.accessLevel}</p>
    </div>
  );
};

// ============================================
// PATTERN 5: ActionGuard for High-Level Actions
// ============================================

interface DataExportProps {
  userRole: UserRole | null;
}

/**
 * Example: Gate feature based on high-level action capability
 */
export const DataExportButton: React.FC<DataExportProps> = ({ userRole }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Export logic here
      console.log('Exporting data...');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ActionGuard
      userRole={userRole}
      action="export_data"
      fallback={
        <button disabled title="Your role cannot export data">
          📥 Export (No Permission)
        </button>
      }
    >
      <button
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? '⏳ Exporting...' : '📥 Export Data'}
      </button>
    </ActionGuard>
  );
};

// ============================================
// PATTERN 6: Admin User Management
// ============================================

interface UserManagementFormProps {
  onUserCreated?: (role: UserRole) => void;
}

/**
 * Example: Form to create/assign users to roles
 */
export const UserManagementForm: React.FC<UserManagementFormProps> = ({
  onUserCreated,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('warehouse_staff');
  const [selectedDept, setSelectedDept] = useState<string>('');

  const allRoles = getAllRoles();
  const filteredRoles = selectedDept
    ? getRolesByDepartment(selectedDept)
    : allRoles;

  const handleCreate = () => {
    console.log('Creating user with role:', selectedRole);
    if (onUserCreated) {
      onUserCreated(selectedRole);
    }
  };

  return (
    <form>
      <div>
        <label>Department</label>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Production">Production</option>
          <option value="Warehouse">Warehouse</option>
          <option value="Sales">Sales</option>
          <option value="Procurement">Procurement</option>
          <option value="Finance">Finance</option>
          <option value="Planning">Planning</option>
          <option value="Quality">Quality</option>
          <option value="Management">Management</option>
          <option value="Executive">Executive</option>
          <option value="IT">IT</option>
        </select>
      </div>

      <div>
        <label>Role</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
        >
          {filteredRoles.map((role) => (
            <option key={role.key} value={role.key}>
              {role.label} ({role.department})
            </option>
          ))}
        </select>
      </div>

      <button type="button" onClick={handleCreate}>
        Create User
      </button>
    </form>
  );
};

// ============================================
// PATTERN 7: Navigation with Role Filtering
// ============================================

import { getNavigationForRole, getNavigationForRole } from '@/shared/config/navigation';

interface NavigationMenuProps {
  userRole: UserRole | null;
}

/**
 * Example: Show navigation items based on role
 */
export const NavigationMenu: React.FC<NavigationMenuProps> = ({ userRole }) => {
  if (!userRole) {
    return <p>Loading navigation...</p>;
  }

  const navItems = getNavigationForRole(userRole);

  return (
    <nav className="navigation">
      {navItems.map((item) => (
        <a key={item.id} href={item.path} className="nav-item">
          <item.icon size={20} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
};

// ============================================
// PATTERN 8: Detailed Permission Audit
// ============================================

interface PermissionAuditProps {
  userRole: UserRole;
}

/**
 * Example: Show all permissions for a user (debugging)
 */
export const PermissionAudit: React.FC<PermissionAuditProps> = ({ userRole }) => {
  const roleConfig = getRoleConfig(userRole);

  return (
    <div className="permission-audit">
      <h2>{roleConfig.label} Permissions Audit</h2>

      <section>
        <h3>Role Information</h3>
        <dl>
          <dt>Role Code</dt>
          <dd>{roleConfig.key}</dd>
          <dt>Department</dt>
          <dd>{roleConfig.department}</dd>
          <dt>Access Level</dt>
          <dd>{roleConfig.accessLevel}</dd>
          <dt>Description</dt>
          <dd>{roleConfig.description}</dd>
        </dl>
      </section>

      <section>
        <h3>Capabilities</h3>
        <ul>
          {roleConfig.canViewReports && <li>✓ View Reports</li>}
          {roleConfig.canExportData && <li>✓ Export Data</li>}
          {roleConfig.canEditMasterData && <li>✓ Edit Master Data</li>}
          {roleConfig.canApproveTransactions && <li>✓ Approve Transactions</li>}
          {roleConfig.canManageUsers && <li>✓ Manage Users</li>}
        </ul>
      </section>

      <section>
        <h3>Permissions ({roleConfig.permissions.length})</h3>
        <ul>
          {roleConfig.permissions.map((perm) => (
            <li key={perm}>
              <code>{perm}</code>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Navigation Access</h3>
        <ul>
          {roleConfig.navigationAccess.map((nav) => (
            <li key={nav}>
              {nav}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

// ============================================
// PATTERN 9: Role Comparison
// ============================================

import { compareRoleHierarchy, isSeniorRole } from '@/config/roles';

interface RoleComparisonProps {
  role1: UserRole;
  role2: UserRole;
}

/**
 * Example: Compare role hierarchy
 */
export const RoleComparison: React.FC<RoleComparisonProps> = ({ role1, role2 }) => {
  const comparison = compareRoleHierarchy(role1, role2);
  const role1Config = getRoleConfig(role1);
  const role2Config = getRoleConfig(role2);

  return (
    <div className="role-comparison">
      <h3>Role Comparison</h3>
      <div className="comparison-item">
        <h4>{role1Config.label}</h4>
        <p>Access Level: {role1Config.accessLevel}</p>
      </div>
      <div className="comparison-operator">
        {comparison > 0 && <p>👑 Senior to</p>}
        {comparison < 0 && <p>👤 Junior to</p>}
        {comparison === 0 && <p>≡ Equal to</p>}
      </div>
      <div className="comparison-item">
        <h4>{role2Config.label}</h4>
        <p>Access Level: {role2Config.accessLevel}</p>
      </div>
    </div>
  );
};

// ============================================
// PATTERN 10: Protected Component Wrapper
// ============================================

interface ProtectedComponentProps {
  userRole: UserRole | null;
  requiredPermission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  level?: 'permission' | 'role' | 'action';
  allowedRoles?: UserRole[];
}

/**
 * Example: Reusable component for permission protection
 */
export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  userRole,
  requiredPermission,
  children,
  fallback = <p>⛔ Access Denied</p>,
  level = 'permission',
  allowedRoles,
}) => {
  if (!userRole) {
    return <>{fallback}</>;
  }

  let hasAccess = false;

  switch (level) {
    case 'permission':
      hasAccess = hasPermission(userRole, requiredPermission);
      break;
    case 'role':
      hasAccess = allowedRoles?.includes(userRole) ?? false;
      break;
    case 'action':
      const roleAccess = useRoleAccess(userRole);
      hasAccess = roleAccess.canPerformAction(
        requiredPermission as any
      );
      break;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// ============================================
// EXPORT EXAMPLES REGISTRY
// ============================================

/**
 * Use these components as templates for your own implementations
 */
export const EXAMPLE_PATTERNS = {
  SimplePermissionCheck: ApprovalButton,
  RoleGuardExample: AdminPanel,
  MultiplePermissions: InventoryManagement,
  ConditionalFeatures: UserCard,
  ActionGuard: DataExportButton,
  UserManagement: UserManagementForm,
  Navigation: NavigationMenu,
  PermissionAudit: PermissionAudit,
  RoleComparison: RoleComparison,
  ProtectedComponent: ProtectedComponent,
};
