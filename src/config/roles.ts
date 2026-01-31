import type { UserRole } from '../features/auth/types/models';

/**
 * ROLE ACCESS LEVELS
 * Determines hierarchy and permissions
 */
export enum AccessLevel {
  NONE = 0,
  VIEWER = 1,
  OPERATOR = 2,
  SUPERVISOR = 3,
  MANAGER = 4,
  ADMIN = 5,
  OWNER = 6,
}

/**
 * ROLE CONFIGURATION
 * Central source of truth for all role definitions
 */
export interface RoleConfig {
  key: UserRole;
  label: string;
  description: string;
  accessLevel: AccessLevel;
  department: string;
  permissions: string[];
  navigationAccess: string[];
  canViewReports: boolean;
  canExportData: boolean;
  canEditMasterData: boolean;
  canApproveTransactions: boolean;
  canManageUsers: boolean;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  warehouse_staff: {
    key: 'warehouse_staff',
    label: 'Warehouse Staff',
    description: 'Handles stock movements, storage, and warehouse operations',
    accessLevel: AccessLevel.OPERATOR,
    department: 'Warehouse',
    permissions: [
      'view_inventory',
      'create_stock_movement',
      'scan_barcodes',
      'update_bin_location',
      'view_warehouse_reports',
    ],
    navigationAccess: ['dashboard', 'inventory', 'procurement'],
    canViewReports: true,
    canExportData: false,
    canEditMasterData: false,
    canApproveTransactions: false,
    canManageUsers: false,
  },
  production_operator: {
    key: 'production_operator',
    label: 'Production Operator',
    description: 'Executes production orders and manages production workflows',
    accessLevel: AccessLevel.OPERATOR,
    department: 'Production',
    permissions: [
      'view_production_orders',
      'update_production_status',
      'record_batch_details',
      'view_inventory',
      'log_defects',
    ],
    navigationAccess: ['dashboard', 'production', 'inventory'],
    canViewReports: true,
    canExportData: false,
    canEditMasterData: false,
    canApproveTransactions: false,
    canManageUsers: false,
  },
  production_supervisor: {
    key: 'production_supervisor',
    label: 'Production Supervisor',
    description: 'Oversees production operations and quality control',
    accessLevel: AccessLevel.SUPERVISOR,
    department: 'Production',
    permissions: [
      'view_production_orders',
      'update_production_status',
      'approve_production_orders',
      'manage_production_staff',
      'view_quality_metrics',
      'escalate_issues',
      'view_inventory',
      'log_defects',
      'view_production_reports',
    ],
    navigationAccess: ['dashboard', 'production', 'inventory', 'reports'],
    canViewReports: true,
    canExportData: true,
    canEditMasterData: false,
    canApproveTransactions: true,
    canManageUsers: false,
  },
  inventory_controller: {
    key: 'inventory_controller',
    label: 'Inventory Controller',
    description: 'Manages inventory records, adjustments, and stock levels',
    accessLevel: AccessLevel.SUPERVISOR,
    department: 'Warehouse',
    permissions: [
      'view_inventory',
      'create_stock_movement',
      'approve_stock_movement',
      'create_inventory_adjustment',
      'approve_inventory_adjustment',
      'view_warehouse_reports',
      'export_inventory_data',
      'update_stock_levels',
    ],
    navigationAccess: ['dashboard', 'inventory', 'procurement', 'reports'],
    canViewReports: true,
    canExportData: true,
    canEditMasterData: true,
    canApproveTransactions: true,
    canManageUsers: false,
  },
  planner: {
    key: 'planner',
    label: 'Planner',
    description: 'Plans production schedules and procurement requirements',
    accessLevel: AccessLevel.SUPERVISOR,
    department: 'Planning',
    permissions: [
      'view_inventory',
      'view_sales_forecasts',
      'create_production_plan',
      'approve_production_plan',
      'create_purchase_requisition',
      'view_supplier_data',
      'view_planning_reports',
    ],
    navigationAccess: ['dashboard', 'production', 'inventory', 'procurement', 'reports'],
    canViewReports: true,
    canExportData: true,
    canEditMasterData: true,
    canApproveTransactions: true,
    canManageUsers: false,
  },
  sales_rep: {
    key: 'sales_rep',
    label: 'Sales Rep',
    description: 'Manages customer orders and sales transactions',
    accessLevel: AccessLevel.OPERATOR,
    department: 'Sales',
    permissions: [
      'view_inventory',
      'create_sales_order',
      'update_sales_order',
      'view_customer_data',
      'view_sales_reports',
      'manage_customer_contact',
    ],
    navigationAccess: ['dashboard', 'sales', 'inventory', 'reports'],
    canViewReports: true,
    canExportData: false,
    canEditMasterData: false,
    canApproveTransactions: false,
    canManageUsers: false,
  },
  purchasing_officer: {
    key: 'purchasing_officer',
    label: 'Purchasing Officer',
    description: 'Handles procurement and supplier management',
    accessLevel: AccessLevel.SUPERVISOR,
    department: 'Procurement',
    permissions: [
      'view_inventory',
      'create_purchase_order',
      'approve_purchase_order',
      'manage_suppliers',
      'view_supplier_performance',
      'receive_goods',
      'view_procurement_reports',
    ],
    navigationAccess: ['dashboard', 'procurement', 'inventory', 'reports'],
    canViewReports: true,
    canExportData: true,
    canEditMasterData: true,
    canApproveTransactions: true,
    canManageUsers: false,
  },
  accountant: {
    key: 'accountant',
    label: 'Accountant',
    description: 'Manages financial records and accounting operations',
    accessLevel: AccessLevel.SUPERVISOR,
    department: 'Finance',
    permissions: [
      'view_financial_data',
      'create_invoice',
      'view_accounts_payable',
      'view_accounts_receivable',
      'view_financial_reports',
      'export_financial_data',
      'reconcile_accounts',
    ],
    navigationAccess: ['dashboard', 'reports'],
    canViewReports: true,
    canExportData: true,
    canEditMasterData: true,
    canApproveTransactions: false,
    canManageUsers: false,
  },
  quality_officer: {
    key: 'quality_officer',
    label: 'Quality Officer',
    description: 'Ensures product quality and manages quality assurance',
    accessLevel: AccessLevel.SUPERVISOR,
    department: 'Quality',
    permissions: [
      'view_production_orders',
      'log_quality_checks',
      'approve_quality_checks',
      'view_quality_metrics',
      'create_quality_report',
      'manage_defects',
      'view_quality_reports',
    ],
    navigationAccess: ['dashboard', 'production', 'reports'],
    canViewReports: true,
    canExportData: true,
    canEditMasterData: false,
    canApproveTransactions: true,
    canManageUsers: false,
  },
  manager: {
    key: 'manager',
    label: 'Manager',
    description: 'Manages department operations and staff',
    accessLevel: AccessLevel.MANAGER,
    department: 'Management',
    permissions: [
      'view_all_data',
      'manage_department_staff',
      'approve_transactions',
      'view_all_reports',
      'export_data',
      'create_performance_report',
      'manage_department_operations',
    ],
    navigationAccess: ['dashboard', 'inventory', 'production', 'procurement', 'sales', 'reports'],
    canViewReports: true,
    canExportData: true,
    canEditMasterData: true,
    canApproveTransactions: true,
    canManageUsers: true,
  },
  owner_director: {
    key: 'owner_director',
    label: 'Owner / Director',
    description: 'Executive level access to all operations',
    accessLevel: AccessLevel.OWNER,
    department: 'Executive',
    permissions: [
      'view_all_data',
      'approve_all_transactions',
      'manage_all_staff',
      'view_strategic_reports',
      'export_all_data',
      'manage_system_settings',
      'access_audit_logs',
    ],
    navigationAccess: ['dashboard', 'inventory', 'production', 'procurement', 'sales', 'reports', 'settings'],
    canViewReports: true,
    canExportData: true,
    canEditMasterData: true,
    canApproveTransactions: true,
    canManageUsers: true,
  },
  system_admin: {
    key: 'system_admin',
    label: 'System Admin',
    description: 'System administration and technical management',
    accessLevel: AccessLevel.ADMIN,
    department: 'IT',
    permissions: [
      'manage_users',
      'manage_roles',
      'manage_system_settings',
      'view_audit_logs',
      'manage_backups',
      'configure_integrations',
      'manage_system_security',
    ],
    navigationAccess: ['dashboard', 'settings'],
    canViewReports: false,
    canExportData: false,
    canEditMasterData: false,
    canApproveTransactions: false,
    canManageUsers: true,
  },
};

/**
 * UTILITY FUNCTIONS
 */

/**
 * Get role configuration by role key
 */
export const getRoleConfig = (role: UserRole): RoleConfig => {
  return ROLE_CONFIGS[role];
};

/**
 * Get role label
 */
export const getRoleLabel = (role: UserRole): string => {
  return getRoleConfig(role).label;
};

/**
 * Get role display name with department
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const config = getRoleConfig(role);
  return `${config.label} (${config.department})`;
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (role: UserRole, permission: string): boolean => {
  const config = getRoleConfig(role);
  return config.permissions.includes(permission);
};

/**
 * Check if user has access to a navigation item
 */
export const canAccessNavigation = (role: UserRole, navigationItem: string): boolean => {
  const config = getRoleConfig(role);
  return config.navigationAccess.includes(navigationItem);
};

/**
 * Get all navigation items accessible to a role
 */
export const getAccessibleNavigation = (role: UserRole): string[] => {
  return getRoleConfig(role).navigationAccess;
};

/**
 * Compare role hierarchy
 * Returns: positive if role1 > role2, negative if role1 < role2, 0 if equal
 */
export const compareRoleHierarchy = (role1: UserRole, role2: UserRole): number => {
  const level1 = getRoleConfig(role1).accessLevel;
  const level2 = getRoleConfig(role2).accessLevel;
  return level1 - level2;
};

/**
 * Check if a role is senior to another
 */
export const isSeniorRole = (role: UserRole, comparedTo: UserRole): boolean => {
  return compareRoleHierarchy(role, comparedTo) > 0;
};

/**
 * Get all roles (useful for dropdowns)
 */
export const getAllRoles = (): RoleConfig[] => {
  return Object.values(ROLE_CONFIGS);
};

/**
 * Get roles filtered by department
 */
export const getRolesByDepartment = (department: string): RoleConfig[] => {
  return Object.values(ROLE_CONFIGS).filter(role => role.department === department);
};

/**
 * Get unique departments
 */
export const getAllDepartments = (): string[] => {
  const departments = new Set(Object.values(ROLE_CONFIGS).map(role => role.department));
  return Array.from(departments).sort();
};
