# Role System Implementation - Checklist & Integration Guide

## ✅ What's Been Implemented

### Core System Files
- [x] `src/config/roles.ts` - Role configurations with 12 roles
- [x] `src/config/permissions.ts` - Permission constants (67 permissions across 10 categories)
- [x] `src/hooks/useRoleAccess.ts` - Custom hook for RBAC
- [x] `src/shared/components/RoleGuard.tsx` - 5 reusable guard components
- [x] `src/features/auth/types/models.ts` - Updated User model with UserRole type

### Configuration Updates
- [x] `src/shared/types/navigation.ts` - Updated with new UserRole type
- [x] `src/shared/config/navigation.ts` - Updated all items with correct roles

### Documentation
- [x] `ROLE_MANAGEMENT_GUIDE.md` - Comprehensive 300+ line guide
- [x] `ROLE_IMPLEMENTATION_SUMMARY.md` - Executive summary
- [x] `ROLE_QUICKSTART.md` - Quick reference and common scenarios
- [x] `ROLE_HIERARCHY_DIAGRAM.md` - Visual diagrams and matrices
- [x] `src/examples/RoleSystemExamples.tsx` - 10 usage pattern examples

---

## 📋 Integration Checklist

### Phase 1: Backend Integration (Your API)

- [ ] **Update Django Serializer**
  - [ ] Add role field to UserSerializer
  - [ ] Use new role naming: warehouse_staff, production_operator, etc.
  - [ ] Example mapping:
    ```python
    ROLE_MAPPING = {
        'ADMIN': 'system_admin',
        'MANAGER': 'manager',
        'USER': 'warehouse_staff',
    }
    ```

- [ ] **Create Role Model Choices**
  - [ ] Define role choices in Django models
  - [ ] Use exact role names from the system

- [ ] **Server-Side Permission Checks**
  - [ ] Validate permissions on every API call
  - [ ] Return 403 Forbidden if user lacks permission
  - [ ] Log unauthorized access attempts

### Phase 2: Frontend Component Updates

- [ ] **Update Login Component**
  ```tsx
  // BEFORE
  role: 'Admin' // Hardcoded
  
  // AFTER
  role: response.user.role // From backend
  ```

- [ ] **Update Dashboard**
  - [ ] Replace `user?.role === 'Admin'` checks
  - [ ] Use `roleAccess.hasPermission(...)` instead
  - [ ] Update permission object:
    ```tsx
    // Replace hardcoded role mapping
    const permissions: Record<string, string[]> = {
      'system_admin': ['all'],
      'manager': ['all_business'],
      'production_supervisor': ['production', 'inventory'],
      // ... etc
    };
    ```

- [ ] **Update Sidebar Navigation**
  - [ ] Should already work - uses `getNavigationForRole()`
  - [ ] Test with different user roles
  - [ ] Verify navigation items match expected roles

- [ ] **Update Layout Components**
  - [ ] Replace role display hardcoding
  - [ ] Use `getRoleDisplayName()` for display

### Phase 3: Feature Implementation

- [ ] **Production Module**
  - [ ] Add approval UI for supervisors only
  - [ ] Use `<PermissionGuard permission="approve_production_orders" />`
  - [ ] Show QA metrics only for relevant roles

- [ ] **Inventory Module**
  - [ ] Add stock adjustment UI for controllers
  - [ ] Implement approval workflow
  - [ ] Export functionality only for allowed roles

- [ ] **Sales Module**
  - [ ] Limit to sales_rep and manager roles
  - [ ] Add reporting for supervisors

- [ ] **Procurement Module**
  - [ ] Implement PO approval for purchasing_officer
  - [ ] Add supplier management

- [ ] **Reports Section**
  - [ ] Add export button (with canExportData check)
  - [ ] Filter reports by user role
  - [ ] Use `<ActionGuard action="export_data" />`

- [ ] **Settings/Admin**
  - [ ] Restrict to system_admin and owner_director
  - [ ] User management UI for system_admin
  - [ ] System configuration for owner_director

### Phase 4: Testing

- [ ] **Create Test Users**
  ```tsx
  const testUsers = {
    warehouse_staff: { role: 'warehouse_staff', ... },
    production_op: { role: 'production_operator', ... },
    prod_supervisor: { role: 'production_supervisor', ... },
    inventory_ctrl: { role: 'inventory_controller', ... },
    planner: { role: 'planner', ... },
    sales_rep: { role: 'sales_rep', ... },
    purchasing: { role: 'purchasing_officer', ... },
    accountant: { role: 'accountant', ... },
    quality: { role: 'quality_officer', ... },
    manager: { role: 'manager', ... },
    owner: { role: 'owner_director', ... },
    sysadmin: { role: 'system_admin', ... },
  };
  ```

- [ ] **Role Navigation Tests**
  - [ ] warehouse_staff sees: Dashboard, Inventory, Procurement
  - [ ] production_operator sees: Dashboard, Production, Inventory
  - [ ] manager sees: Dashboard, Inventory, Production, Procurement, Sales, Reports
  - [ ] system_admin sees: Dashboard, Settings

- [ ] **Permission Tests**
  - [ ] Test each role's unique permissions
  - [ ] Verify approval buttons appear/disappear
  - [ ] Check export buttons are visible/hidden correctly
  - [ ] Verify edit capabilities per role

- [ ] **Hierarchy Tests**
  - [ ] manager can see everything a production_supervisor can
  - [ ] owner_director can do everything except system config
  - [ ] Use `compareRoleHierarchy()` utility

- [ ] **API Integration Tests**
  - [ ] Verify backend returns correct role
  - [ ] Test that frontend receives and processes role
  - [ ] Verify navigation updates on role change

### Phase 5: Security Hardening

- [ ] **Audit Logging**
  - [ ] Log sensitive operations
  - [ ] Track who approved what
  - [ ] Record data exports
  - [ ] Monitor permission violations

- [ ] **API Security**
  - [ ] Verify backend validates every request
  - [ ] Never trust frontend role checks alone
  - [ ] Use role/permission headers validation
  - [ ] Implement rate limiting for sensitive endpoints

- [ ] **Data Isolation**
  - [ ] Ensure accountants can't see production data
  - [ ] Implement department-based filtering
  - [ ] Verify warehouse staff can't access sales data

- [ ] **Session Management**
  - [ ] Clear permissions on logout
  - [ ] Re-fetch user on page refresh
  - [ ] Invalidate session if role changes

### Phase 6: Performance Optimization

- [ ] **Caching**
  - [ ] Cache role configurations
  - [ ] Cache permission checks
  - [ ] Invalidate on role changes

- [ ] **Lazy Loading**
  - [ ] Load only necessary navigation items
  - [ ] Don't render hidden UI elements

- [ ] **Memoization**
  - [ ] Memoize permission checks
  - [ ] Use React.memo for guard components

---

## 🎯 Common Implementation Patterns

### Pattern 1: Protect Button
```tsx
import { PermissionGuard } from '@/shared/components/RoleGuard';
import { PRODUCTION_PERMISSIONS } from '@/config/permissions';

<PermissionGuard
  userRole={user?.role}
  permission={PRODUCTION_PERMISSIONS.APPROVE_ORDERS}
  fallback={<button disabled>Can't Approve</button>}
>
  <button onClick={handleApprove}>Approve</button>
</PermissionGuard>
```

### Pattern 2: Protect Section
```tsx
import { RoleGuard } from '@/shared/components/RoleGuard';

<RoleGuard
  userRole={user?.role}
  allowedRoles={['production_supervisor', 'manager', 'owner_director']}
  fallback={<p>No access</p>}
>
  <SupervisorSection />
</RoleGuard>
```

### Pattern 3: Protect Feature
```tsx
const roleAccess = useRoleAccess(user?.role);

if (roleAccess.hasPermission(INVENTORY_PERMISSIONS.APPROVE_MOVEMENT)) {
  // Show approval workflow
}
```

### Pattern 4: Role Selection
```tsx
import { RoleSelect } from '@/shared/components/RoleGuard';

<RoleSelect
  value={selectedRole}
  onChange={setSelectedRole}
  filterByDepartment="Production"
/>
```

---

## 🔧 Debugging Tips

### Check User Role
```tsx
import { getRoleConfig } from '@/config/roles';

const config = getRoleConfig(user.role);
console.log('Role:', config.label);
console.log('Department:', config.department);
console.log('Permissions:', config.permissions);
console.log('Nav Access:', config.navigationAccess);
```

### Check Permission
```tsx
import { hasPermission } from '@/config/roles';

const canApprove = hasPermission(user.role, 'approve_production_orders');
console.log('Can approve:', canApprove);
```

### Check Navigation
```tsx
import { getNavigationForRole } from '@/shared/config/navigation';

const navItems = getNavigationForRole(user.role);
console.log('Visible nav items:', navItems.map(i => i.label));
```

### Permission Audit
```tsx
import { PermissionAudit } from '@/examples/RoleSystemExamples';

<PermissionAudit userRole={user.role} />
// Shows all permissions and capabilities
```

---

## 📊 Database Schema Reference

### Expected User Model
```python
class User(models.Model):
    ROLE_CHOICES = [
        ('warehouse_staff', 'Warehouse Staff'),
        ('production_operator', 'Production Operator'),
        ('production_supervisor', 'Production Supervisor'),
        ('inventory_controller', 'Inventory Controller'),
        ('planner', 'Planner'),
        ('sales_rep', 'Sales Rep'),
        ('purchasing_officer', 'Purchasing Officer'),
        ('accountant', 'Accountant'),
        ('quality_officer', 'Quality Officer'),
        ('manager', 'Manager'),
        ('owner_director', 'Owner / Director'),
        ('system_admin', 'System Admin'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField()
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    # ... other fields
```

---

## 🚀 Deployment Checklist

- [ ] All role constants imported correctly
- [ ] No hardcoded role checks remaining
- [ ] Backend returns correct role names
- [ ] Permission checks are case-sensitive
- [ ] Navigation filtering works for all roles
- [ ] No console errors in browser
- [ ] Test with 3+ different user roles
- [ ] Verify API calls include role validation
- [ ] Audit logging is functional
- [ ] Performance acceptable (< 100ms navigation)

---

## 📞 Support & Questions

### Common Questions

**Q: Can I change role names?**
A: Yes, but update everywhere: types, configs, navigation, backend.

**Q: Can I add new roles?**
A: Yes, add to UserRole type, create RoleConfig entry, update navigation.

**Q: Can users have multiple roles?**
A: Current system: No. Add array type if needed: `role: UserRole[]`

**Q: How do I restrict data by department?**
A: Use `getRoleConfig(role).department` to filter queries.

**Q: How do I implement custom permissions?**
A: Add to role's `permissions` array in `ROLE_CONFIGS`

---

## 📝 Notes

- All role names use snake_case: `production_supervisor` not `ProductionSupervisor`
- Permissions use snake_case: `approve_production_orders`
- Navigation items use camelCase: `dashboard`, `production`
- Use TypeScript types to prevent string errors
- Always validate permissions on backend
- Document any custom permissions your team adds

---

Last Updated: January 29, 2026
Version: 1.0 - Complete Implementation
