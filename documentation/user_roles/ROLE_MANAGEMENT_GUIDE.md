# Role Management System - Implementation Guide

## Overview

This document describes the comprehensive role-based access control (RBAC) system implemented in the Bakery ERP Frontend. The system supports 12 distinct roles with granular permissions, department assignments, and hierarchical access levels.

## Roles

### 1. **Warehouse Staff**
- **Code**: `warehouse_staff`
- **Department**: Warehouse
- **Access Level**: 2 (Operator)
- **Key Responsibilities**:
  - Manage stock movements
  - Update bin locations
  - Scan barcodes
  - View warehouse reports
- **Navigation Access**: Dashboard, Inventory, Procurement
- **Permissions**: view_inventory, create_stock_movement, scan_barcodes, update_bin_location, view_warehouse_reports

### 2. **Production Operator**
- **Code**: `production_operator`
- **Department**: Production
- **Access Level**: 2 (Operator)
- **Key Responsibilities**:
  - Execute production orders
  - Record batch details
  - Update production status
  - Log defects
- **Navigation Access**: Dashboard, Production, Inventory
- **Permissions**: view_production_orders, update_production_status, record_batch_details, view_inventory, log_defects

### 3. **Production Supervisor**
- **Code**: `production_supervisor`
- **Department**: Production
- **Access Level**: 3 (Supervisor)
- **Key Responsibilities**:
  - Oversee production operations
  - Approve production orders
  - Manage production staff
  - Monitor quality metrics
  - Escalate issues
- **Navigation Access**: Dashboard, Production, Inventory, Reports
- **Special Flags**: canViewReports, canExportData, canApproveTransactions

### 4. **Inventory Controller**
- **Code**: `inventory_controller`
- **Department**: Warehouse
- **Access Level**: 3 (Supervisor)
- **Key Responsibilities**:
  - Manage inventory records
  - Create and approve adjustments
  - Approve stock movements
  - Update stock levels
- **Navigation Access**: Dashboard, Inventory, Procurement, Reports
- **Special Flags**: canViewReports, canExportData, canEditMasterData, canApproveTransactions

### 5. **Planner**
- **Code**: `planner`
- **Department**: Planning
- **Access Level**: 3 (Supervisor)
- **Key Responsibilities**:
  - Plan production schedules
  - Create production plans
  - View sales forecasts
  - Manage purchase requisitions
  - Access supplier data
- **Navigation Access**: Dashboard, Production, Inventory, Procurement, Reports
- **Special Flags**: canViewReports, canExportData, canEditMasterData, canApproveTransactions

### 6. **Sales Rep**
- **Code**: `sales_rep`
- **Department**: Sales
- **Access Level**: 2 (Operator)
- **Key Responsibilities**:
  - Create and manage sales orders
  - View customer data
  - Manage customer contact
  - View sales reports
- **Navigation Access**: Dashboard, Sales, Inventory, Reports
- **Permissions**: view_inventory, create_sales_order, update_sales_order, view_customer_data, view_sales_reports

### 7. **Purchasing Officer**
- **Code**: `purchasing_officer`
- **Department**: Procurement
- **Access Level**: 3 (Supervisor)
- **Key Responsibilities**:
  - Create and approve purchase orders
  - Manage suppliers
  - Monitor supplier performance
  - Receive goods
  - Generate procurement reports
- **Navigation Access**: Dashboard, Procurement, Inventory, Reports
- **Special Flags**: canViewReports, canExportData, canEditMasterData, canApproveTransactions

### 8. **Accountant**
- **Code**: `accountant`
- **Department**: Finance
- **Access Level**: 3 (Supervisor)
- **Key Responsibilities**:
  - Manage financial records
  - Create invoices
  - View accounts payable/receivable
  - Reconcile accounts
  - Generate financial reports
- **Navigation Access**: Dashboard, Reports
- **Special Flags**: canViewReports, canExportData, canEditMasterData
- **Restricted Access**: Limited to financial data only

### 9. **Quality Officer**
- **Code**: `quality_officer`
- **Department**: Quality
- **Access Level**: 3 (Supervisor)
- **Key Responsibilities**:
  - Log quality checks
  - Approve quality checks
  - Monitor quality metrics
  - Create quality reports
  - Manage defects
- **Navigation Access**: Dashboard, Production, Reports
- **Special Flags**: canViewReports, canExportData, canApproveTransactions

### 10. **Manager**
- **Code**: `manager`
- **Department**: Management
- **Access Level**: 4 (Manager)
- **Key Responsibilities**:
  - Manage department operations
  - Manage department staff
  - Approve transactions
  - Generate performance reports
  - Access all departmental data
- **Navigation Access**: Dashboard, Inventory, Production, Procurement, Sales, Reports
- **Special Flags**: canViewReports, canExportData, canEditMasterData, canApproveTransactions, canManageUsers

### 11. **Owner / Director**
- **Code**: `owner_director`
- **Department**: Executive
- **Access Level**: 6 (Owner)
- **Key Responsibilities**:
  - Executive-level oversight
  - Access all operations
  - Strategic reporting
  - System settings management
  - Audit log access
- **Navigation Access**: Dashboard, Inventory, Production, Procurement, Sales, Reports, Settings
- **Special Flags**: ALL permissions enabled
- **Highest Level**: Full system access except IT administration

### 12. **System Admin**
- **Code**: `system_admin`
- **Department**: IT
- **Access Level**: 5 (Admin)
- **Key Responsibilities**:
  - Manage users and roles
  - System configuration
  - Security management
  - Backup management
  - Integration configuration
  - Audit log management
- **Navigation Access**: Dashboard, Settings
- **Special Flags**: canManageUsers
- **Scope**: System administration only (not business operations)

## Access Levels (Hierarchy)

```
Level 0: NONE (0)
Level 1: VIEWER (1)           - Read-only access
Level 2: OPERATOR (2)         - Can create/update own operations
Level 3: SUPERVISOR (3)       - Can approve and supervise
Level 4: MANAGER (4)          - Can manage staff and departments
Level 5: ADMIN (5)            - System administration
Level 6: OWNER (6)            - Executive level (highest)
```

## Usage in Components

### Using RoleGuard Component

```tsx
import { RoleGuard } from '@/shared/components/RoleGuard';

<RoleGuard
  userRole={user?.role}
  allowedRoles={['production_supervisor', 'quality_officer', 'manager']}
  fallback={<p>No access</p>}
>
  <QualityMetricsPanel />
</RoleGuard>
```

### Using PermissionGuard Component

```tsx
import { PermissionGuard } from '@/shared/components/RoleGuard';

<PermissionGuard
  userRole={user?.role}
  permission="approve_production_orders"
  fallback={<p>Cannot approve</p>}
>
  <ApprovalButton />
</PermissionGuard>
```

### Using ActionGuard Component

```tsx
import { ActionGuard } from '@/shared/components/RoleGuard';

<ActionGuard
  userRole={user?.role}
  action="export_data"
  fallback={<button disabled>Export</button>}
>
  <button>Export Data</button>
</ActionGuard>
```

### Using useRoleAccess Hook

```tsx
import { useRoleAccess } from '@/hooks/useRoleAccess';

const MyComponent = ({ user }) => {
  const roleAccess = useRoleAccess(user?.role);

  // Check single permission
  if (roleAccess.hasPermission('view_all_reports')) {
    // render
  }

  // Check multiple permissions
  if (roleAccess.hasAllPermissions('view_inventory', 'create_stock_movement')) {
    // render
  }

  // Check action capability
  if (roleAccess.canPerformAction('export_data')) {
    // render
  }

  // Get role info
  const roleInfo = roleAccess.getRoleInfo();
  return <div>{roleInfo.label} - {roleInfo.department}</div>;
};
```

### Using RoleSelect Component

```tsx
import { RoleSelect } from '@/shared/components/RoleGuard';

const UserForm = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('warehouse_staff');

  return (
    <RoleSelect
      value={selectedRole}
      onChange={setSelectedRole}
      filterByDepartment="Production"
    />
  );
};
```

## API Configuration

The `roles.ts` configuration file exports utility functions for role management:

```tsx
import {
  getRoleConfig,
  getRoleLabel,
  getRoleDisplayName,
  hasPermission,
  canAccessNavigation,
  getAccessibleNavigation,
  compareRoleHierarchy,
  isSeniorRole,
  getAllRoles,
  getRolesByDepartment,
  getAllDepartments,
} from '@/config/roles';

// Get role label
const label = getRoleLabel('production_supervisor'); // "Production Supervisor"

// Get display name with department
const displayName = getRoleDisplayName('production_supervisor'); 
// "Production Supervisor (Production)"

// Check permission
const canApprove = hasPermission('production_supervisor', 'approve_production_orders');

// Check navigation access
const canAccessInventory = canAccessNavigation('warehouse_staff', 'inventory');

// Get accessible nav items
const navItems = getAccessibleNavigation('manager');

// Compare role hierarchy
const diff = compareRoleHierarchy('manager', 'production_operator'); // positive
const isSenior = isSeniorRole('manager', 'production_operator'); // true

// Get all roles
const allRoles = getAllRoles();

// Filter by department
const productionRoles = getRolesByDepartment('Production');

// Get unique departments
const departments = getAllDepartments();
```

## Database Integration Notes

When integrating with your backend:

1. **User Model**: Ensure the backend returns `role` field with one of the above values
2. **Role Serializer**: Update your Django serializer to include the role field
3. **Permissions**: The backend should validate permissions server-side before processing requests
4. **Audit Logging**: Track which roles access sensitive data

### Example Backend Role Mapping

If your Django backend uses different role names, create a mapping:

```python
# In your DRF serializer
ROLE_MAPPING = {
    'ADMIN': 'manager',
    'USER': 'warehouse_staff',
    'MANAGER': 'owner_director',
    # ... add more mappings
}

def to_representation(self, instance):
    data = super().to_representation(instance)
    data['role'] = ROLE_MAPPING.get(instance.role, 'warehouse_staff')
    return data
```

## Navigation Mapping

| Role | Dashboard | Procurement | Inventory | Production | Sales | Reports | Settings |
|------|:---------:|:-----------:|:---------:|:----------:|:-----:|:-------:|:--------:|
| warehouse_staff | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| production_operator | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| production_supervisor | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ |
| inventory_controller | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| planner | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| sales_rep | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ |
| purchasing_officer | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| accountant | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| quality_officer | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ |
| manager | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| owner_director | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| system_admin | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

## Best Practices

1. **Always Check on Backend**: Never rely solely on frontend role checks. Always validate permissions server-side.

2. **Use TypeScript**: Leverage the `UserRole` type for type safety:
   ```tsx
   const role: UserRole = user.role; // Type-safe
   ```

3. **Centralize Role Logic**: Use the provided utilities instead of hardcoding role checks:
   ```tsx
   // ✗ Bad
   if (user.role === 'manager' || user.role === 'owner_director') { }

   // ✓ Good
   if (roleAccess.hasPermission('manage_department_staff')) { }
   ```

4. **Use Semantic Guards**: Choose the most specific guard type:
   ```tsx
   // For role-based rendering
   <RoleGuard allowedRoles={['manager', 'owner_director']} />

   // For permission-based rendering
   <PermissionGuard permission="approve_transactions" />

   // For capability-based rendering
   <ActionGuard action="export_data" />
   ```

5. **Department-Aware Filtering**: When building role selectors, consider filtering by department:
   ```tsx
   <RoleSelect filterByDepartment="Production" />
   ```

## Testing

Create test data with different roles:

```tsx
const testUsers = {
  warehouseStaff: { role: 'warehouse_staff' },
  productionOp: { role: 'production_operator' },
  prodSupervisor: { role: 'production_supervisor' },
  manager: { role: 'manager' },
  sysAdmin: { role: 'system_admin' },
  owner: { role: 'owner_director' },
};
```

## Future Enhancements

1. **Role Permissions Editor**: Create admin UI to modify role permissions
2. **Custom Roles**: Support for creating custom roles combining permissions
3. **Time-based Access**: Add role activation/expiration dates
4. **Department Isolation**: Restrict managers to their department data
5. **Permission Audit Trail**: Log permission usage
6. **Multi-role Support**: Allow users to have multiple roles simultaneously
