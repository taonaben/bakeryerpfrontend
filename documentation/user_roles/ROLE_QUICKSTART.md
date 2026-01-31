# Role System - Quick Start Guide

## TL;DR - Get Started in 5 Minutes

### Step 1: Check User's Role Permission

```tsx
import { useRoleAccess } from '@/hooks/useRoleAccess';

const MyComponent = ({ user }) => {
  const roleAccess = useRoleAccess(user?.role);

  if (roleAccess.hasPermission('approve_production_orders')) {
    return <ApprovalButton />;
  }
  return <p>No permission</p>;
};
```

### Step 2: Use Guard Components

```tsx
import { RoleGuard, PermissionGuard } from '@/shared/components/RoleGuard';

// Option A: By role
<RoleGuard 
  userRole={user?.role} 
  allowedRoles={['manager', 'owner_director']}
>
  <ManagerPanel />
</RoleGuard>

// Option B: By permission
<PermissionGuard 
  userRole={user?.role} 
  permission="export_data"
>
  <ExportButton />
</PermissionGuard>
```

### Step 3: Use Permission Constants

```tsx
import { PRODUCTION_PERMISSIONS } from '@/config/permissions';
import { hasPermission } from '@/config/roles';

const canApprove = hasPermission(user.role, PRODUCTION_PERMISSIONS.APPROVE_ORDERS);
```

---

## Common Scenarios

### Allow Only Supervisors and Above

```tsx
import { compareRoleHierarchy } from '@/config/roles';

const isSupervisor = compareRoleHierarchy(user.role, 'production_supervisor') >= 0;

// OR use RoleGuard
<RoleGuard
  userRole={user?.role}
  allowedRoles={[
    'production_supervisor',
    'inventory_controller',
    'planner',
    'purchasing_officer',
    'manager',
    'owner_director',
  ]}
>
  <SupervisorUI />
</RoleGuard>
```

### Show Different UI for Different Roles

```tsx
import { RoleInfoBadge } from '@/shared/components/RoleGuard';

export const UserProfile = ({ user }) => (
  <div>
    <h2>{user.first_name} {user.last_name}</h2>
    <RoleInfoBadge userRole={user.role} showDepartment />
    
    {/* Role-specific content */}
    {user.role === 'production_operator' && <OperatorDashboard />}
    {user.role === 'manager' && <ManagerDashboard />}
    {user.role === 'system_admin' && <AdminPanel />}
  </div>
);
```

### Check Multiple Permissions

```tsx
const roleAccess = useRoleAccess(user?.role);

// All must be true
if (roleAccess.hasAllPermissions(
  'approve_production_orders',
  'manage_production_staff'
)) {
  return <ProductionControl />;
}

// Any one must be true
if (roleAccess.hasAnyPermission(
  'approve_production_orders',
  'approve_purchase_order'
)) {
  return <ApprovalPanel />;
}
```

### Filter Navigation by Role

```tsx
import { getNavigationForRole } from '@/shared/config/navigation';

const navItems = getNavigationForRole(user.role);
// Returns only items the user can see
```

### Get Role Details

```tsx
import { getRoleConfig, getRoleDisplayName } from '@/config/roles';

const roleConfig = getRoleConfig(user.role);
console.log(roleConfig.label); // e.g., "Production Supervisor"
console.log(roleConfig.department); // e.g., "Production"
console.log(roleConfig.canApproveTransactions); // true/false

// Or get display name with department
const displayName = getRoleDisplayName(user.role);
// "Production Supervisor (Production)"
```

---

## Role Quick Reference

| Role | Can Approve? | Can Export? | Can Manage Users? | Can View Reports? |
|------|:----:|:----:|:-----:|:-----:|
| warehouse_staff | ✗ | ✗ | ✗ | ✓ |
| production_operator | ✗ | ✗ | ✗ | ✓ |
| production_supervisor | ✓ | ✓ | ✗ | ✓ |
| inventory_controller | ✓ | ✓ | ✗ | ✓ |
| planner | ✓ | ✓ | ✗ | ✓ |
| sales_rep | ✗ | ✗ | ✗ | ✓ |
| purchasing_officer | ✓ | ✓ | ✗ | ✓ |
| accountant | ✗ | ✓ | ✗ | ✓ |
| quality_officer | ✓ | ✓ | ✗ | ✓ |
| manager | ✓ | ✓ | ✓ | ✓ |
| owner_director | ✓ | ✓ | ✓ | ✓ |
| system_admin | ✗ | ✗ | ✓ | ✗ |

---

## Common Issues & Solutions

### Issue: Role not showing in UI

**Problem**: User role is not being passed to components

**Solution**:
```tsx
// Make sure user comes from context/state
import { useAuth } from '@/features/auth/contexts/AuthContext'; // or wherever

const user = useAuth()?.user; // or get from props
if (!user?.role) return <p>Loading...</p>;
```

### Issue: Permission checks not working

**Problem**: Using hardcoded role names instead of permissions

**Solution**:
```tsx
// ❌ Wrong
if (user.role === 'manager') { }

// ✅ Right
if (useRoleAccess(user.role).hasPermission('approve_transactions')) { }
```

### Issue: Type errors with UserRole

**Problem**: Using string instead of UserRole type

**Solution**:
```tsx
import type { UserRole } from '@/features/auth/types/models';

const role: UserRole = user.role; // Type-checked
const validRole = getRoleConfig(role); // Type-safe
```

### Issue: Navigation items showing for wrong roles

**Problem**: Navigation config not updated with new roles

**Solution**: Check `src/shared/config/navigation.ts` - it's already updated!

---

## Import Cheat Sheet

```tsx
// Types
import type { UserRole } from '@/features/auth/types/models';

// Hooks
import { useRoleAccess } from '@/hooks/useRoleAccess';

// Components
import {
  RoleGuard,
  PermissionGuard,
  ActionGuard,
  RoleInfoBadge,
  RoleSelect,
} from '@/shared/components/RoleGuard';

// Configuration & Utilities
import {
  getRoleConfig,
  getRoleLabel,
  getRoleDisplayName,
  hasPermission,
  canAccessNavigation,
  isSeniorRole,
  compareRoleHierarchy,
  getAllRoles,
  getRolesByDepartment,
  getAllDepartments,
} from '@/config/roles';

// Permission Constants
import {
  INVENTORY_PERMISSIONS,
  PRODUCTION_PERMISSIONS,
  PROCUREMENT_PERMISSIONS,
  SALES_PERMISSIONS,
  QUALITY_PERMISSIONS,
  FINANCIAL_PERMISSIONS,
  SYSTEM_PERMISSIONS,
  REPORTING_PERMISSIONS,
  MASTER_DATA_PERMISSIONS,
  TRANSACTION_PERMISSIONS,
  PERMISSION_GROUPS,
} from '@/config/permissions';

// Navigation
import {
  navigationItems,
  settingsItem,
  getNavigationForRole,
} from '@/shared/config/navigation';
```

---

## Next: Full Documentation

See **ROLE_MANAGEMENT_GUIDE.md** for comprehensive documentation including:
- Detailed role descriptions
- All permissions per role
- API documentation
- Backend integration notes
- Best practices
- Testing guidelines

