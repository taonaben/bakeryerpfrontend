/**
 * PERMISSIONS CONSTANTS
 * Centralized definitions of all permissions used in the application
 * Use these constants instead of magic strings to avoid typos
 */

// === INVENTORY PERMISSIONS ===
export const INVENTORY_PERMISSIONS = {
  VIEW: 'view_inventory',
  CREATE_MOVEMENT: 'create_stock_movement',
  APPROVE_MOVEMENT: 'approve_stock_movement',
  CREATE_ADJUSTMENT: 'create_inventory_adjustment',
  APPROVE_ADJUSTMENT: 'approve_inventory_adjustment',
  UPDATE_STOCK_LEVELS: 'update_stock_levels',
  VIEW_REPORTS: 'view_warehouse_reports',
  EXPORT_DATA: 'export_inventory_data',
} as const;

// === PRODUCTION PERMISSIONS ===
export const PRODUCTION_PERMISSIONS = {
  VIEW_ORDERS: 'view_production_orders',
  UPDATE_STATUS: 'update_production_status',
  APPROVE_ORDERS: 'approve_production_orders',
  RECORD_BATCH: 'record_batch_details',
  MANAGE_STAFF: 'manage_production_staff',
  VIEW_QUALITY: 'view_quality_metrics',
  ESCALATE_ISSUES: 'escalate_issues',
  LOG_DEFECTS: 'log_defects',
  VIEW_REPORTS: 'view_production_reports',
} as const;

// === PROCUREMENT PERMISSIONS ===
export const PROCUREMENT_PERMISSIONS = {
  CREATE_ORDER: 'create_purchase_order',
  APPROVE_ORDER: 'approve_purchase_order',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  VIEW_SUPPLIER_PERFORMANCE: 'view_supplier_performance',
  RECEIVE_GOODS: 'receive_goods',
  CREATE_REQUISITION: 'create_purchase_requisition',
  VIEW_REPORTS: 'view_procurement_reports',
} as const;

// === SALES PERMISSIONS ===
export const SALES_PERMISSIONS = {
  CREATE_ORDER: 'create_sales_order',
  UPDATE_ORDER: 'update_sales_order',
  VIEW_CUSTOMER_DATA: 'view_customer_data',
  MANAGE_CUSTOMER_CONTACT: 'manage_customer_contact',
  VIEW_FORECASTS: 'view_sales_forecasts',
  VIEW_REPORTS: 'view_sales_reports',
} as const;

// === QUALITY PERMISSIONS ===
export const QUALITY_PERMISSIONS = {
  LOG_CHECKS: 'log_quality_checks',
  APPROVE_CHECKS: 'approve_quality_checks',
  VIEW_METRICS: 'view_quality_metrics',
  CREATE_REPORT: 'create_quality_report',
  MANAGE_DEFECTS: 'manage_defects',
  VIEW_REPORTS: 'view_quality_reports',
} as const;

// === FINANCIAL PERMISSIONS ===
export const FINANCIAL_PERMISSIONS = {
  VIEW_DATA: 'view_financial_data',
  CREATE_INVOICE: 'create_invoice',
  VIEW_PAYABLE: 'view_accounts_payable',
  VIEW_RECEIVABLE: 'view_accounts_receivable',
  RECONCILE: 'reconcile_accounts',
  VIEW_REPORTS: 'view_financial_reports',
  EXPORT_DATA: 'export_financial_data',
} as const;

// === SYSTEM PERMISSIONS ===
export const SYSTEM_PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_SETTINGS: 'manage_system_settings',
  VIEW_AUDIT_LOGS: 'access_audit_logs',
  MANAGE_BACKUPS: 'manage_backups',
  CONFIGURE_INTEGRATIONS: 'configure_integrations',
  MANAGE_SECURITY: 'manage_system_security',
} as const;

// === REPORTING PERMISSIONS ===
export const REPORTING_PERMISSIONS = {
  VIEW_ALL_REPORTS: 'view_all_reports',
  CREATE_REPORT: 'create_performance_report',
  EXPORT_DATA: 'export_data',
  EXPORT_ALL_DATA: 'export_all_data',
  VIEW_STRATEGIC_REPORTS: 'view_strategic_reports',
} as const;

// === MASTER DATA PERMISSIONS ===
export const MASTER_DATA_PERMISSIONS = {
  EDIT: 'edit_master_data',
  UPDATE_BIN_LOCATION: 'update_bin_location',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  MANAGE_CUSTOMERS: 'manage_customer_contact',
} as const;

// === TRANSACTION PERMISSIONS ===
export const TRANSACTION_PERMISSIONS = {
  APPROVE: 'approve_transactions',
  APPROVE_ALL: 'approve_all_transactions',
  APPROVE_PRODUCTION: 'approve_production_orders',
  APPROVE_PROCUREMENT: 'approve_purchase_order',
  APPROVE_QUALITY: 'approve_quality_checks',
} as const;

/**
 * PERMISSION GROUPS
 * Group related permissions for easier checking
 */
export const PERMISSION_GROUPS = {
  INVENTORY: Object.values(INVENTORY_PERMISSIONS),
  PRODUCTION: Object.values(PRODUCTION_PERMISSIONS),
  PROCUREMENT: Object.values(PROCUREMENT_PERMISSIONS),
  SALES: Object.values(SALES_PERMISSIONS),
  QUALITY: Object.values(QUALITY_PERMISSIONS),
  FINANCIAL: Object.values(FINANCIAL_PERMISSIONS),
  SYSTEM: Object.values(SYSTEM_PERMISSIONS),
  REPORTING: Object.values(REPORTING_PERMISSIONS),
  MASTER_DATA: Object.values(MASTER_DATA_PERMISSIONS),
  TRANSACTIONS: Object.values(TRANSACTION_PERMISSIONS),
} as const;

/**
 * ACTION TYPES
 * High-level actions that span multiple modules
 */
export const ACTION_TYPES = {
  // Viewing/Reading
  VIEW : 'view',
  VIEW_ALL : 'view_all',

  // Creating
  CREATE : 'create',    
  // Updating
  UPDATE : 'update',
  EDIT : 'edit',

  // Deleting
  DELETE : 'delete',
  // Approving
  APPROVE : 'approve',

  // Exporting
  EXPORT : 'export',

  // Managing (Users, Settings)
  MANAGE : 'manage',

  // Configuring
  CONFIGURE : 'configure',
} as const;

/**
 * UTILITY: Get all permissions
 */
export const getAllPermissions = (): string[] => {
  return [
    ...Object.values(INVENTORY_PERMISSIONS),
    ...Object.values(PRODUCTION_PERMISSIONS),
    ...Object.values(PROCUREMENT_PERMISSIONS),
    ...Object.values(SALES_PERMISSIONS),
    ...Object.values(QUALITY_PERMISSIONS),
    ...Object.values(FINANCIAL_PERMISSIONS),
    ...Object.values(SYSTEM_PERMISSIONS),
    ...Object.values(REPORTING_PERMISSIONS),
    ...Object.values(MASTER_DATA_PERMISSIONS),
    ...Object.values(TRANSACTION_PERMISSIONS),
  ];
};

/**
 * UTILITY: Get permission group by module
 */
export const getPermissionsByModule = (module: keyof typeof PERMISSION_GROUPS): string[] => {
  return PERMISSION_GROUPS[module];
};

/**
 * UTILITY: Check if permission exists
 */
export const isValidPermission = (permission: string): boolean => {
  return getAllPermissions().includes(permission);
};
