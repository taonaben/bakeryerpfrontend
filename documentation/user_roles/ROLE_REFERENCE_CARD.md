# Role System - Visual Quick Reference Card

## 🎯 At a Glance

### The 12 Roles
```
┌─────────────────────────────────────────────────────────────┐
│  EXECUTIVE                 MANAGEMENT                        │
│  owner_director ●          manager ●                         │
│  (Level 6)                 (Level 4)                         │
├─────────────────────────────────────────────────────────────┤
│  SUPERVISORS                         OPERATORS               │
│                                                              │
│  ● production_supervisor             ● production_operator  │
│  ● inventory_controller              ● warehouse_staff     │
│  ● planner                           ● sales_rep           │
│  ● purchasing_officer                                       │
│  ● accountant                                               │
│  ● quality_officer                                          │
│  (Level 3)                           (Level 2)              │
├─────────────────────────────────────────────────────────────┤
│  SPECIALIST                                                  │
│  ● system_admin (Level 5)                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Permission Matrix (Simplified)

```
Role                    Approve  Export  Edit MD  View Rpt  Manage
─────────────────────────────────────────────────────────────────
warehouse_staff           ✗       ✗       ✗       ✓        ✗
production_operator       ✗       ✗       ✗       ✓        ✗
production_supervisor     ✓       ✓       ✗       ✓        ✗
inventory_controller      ✓       ✓       ✓       ✓        ✗
planner                   ✓       ✓       ✓       ✓        ✗
sales_rep                 ✗       ✗       ✗       ✓        ✗
purchasing_officer        ✓       ✓       ✓       ✓        ✗
accountant                ✗       ✓       ✓       ✓        ✗
quality_officer           ✓       ✓       ✗       ✓        ✗
manager                   ✓       ✓       ✓       ✓        ✓
owner_director            ✓       ✓       ✓       ✓        ✓
system_admin              ✗       ✗       ✗       ✗        ✓
```

## 📚 Code Snippets

### Check Permission
```tsx
import { useRoleAccess } from '@/hooks/useRoleAccess';

const roleAccess = useRoleAccess(user?.role);
if (roleAccess.hasPermission('approve_orders')) { }
```

### Guard Component
```tsx
import { RoleGuard } from '@/shared/components/RoleGuard';
<RoleGuard userRole={user?.role} allowedRoles={['manager']} >
  <UI />
</RoleGuard>
```

### Get Role Info
```tsx
import { getRoleConfig } from '@/config/roles';
const config = getRoleConfig(user.role);
// config.label, config.permissions, config.canApproveTransactions
```

## 🚀 Common Use Cases

| Need | Solution | Example |
|------|----------|---------|
| Show button if permission | `useRoleAccess().hasPermission()` | Approve button |
| Hide section from role | `<RoleGuard allowedRoles={[...]}>` | Admin panel |
| Check multiple perms | `hasAllPermissions(...)` | Full access |
| Get role details | `getRoleConfig(role)` | Display name |
| Filter by department | `getRolesByDepartment()` | User form |
| Compare roles | `compareRoleHierarchy()` | Hierarchy check |

## 🔑 Key Imports

```tsx
// Types
import type { UserRole } from '@/features/auth/types/models';

// Hooks
import { useRoleAccess } from '@/hooks/useRoleAccess';

// Components
import { RoleGuard, PermissionGuard } from '@/shared/components/RoleGuard';

// Utils
import { getRoleConfig, hasPermission } from '@/config/roles';

// Constants
import { PRODUCTION_PERMISSIONS } from '@/config/permissions';
```

## 📊 Access Levels

```
6: OWNER       │ owner_director
5: ADMIN       │ system_admin
4: MANAGER     │ manager
3: SUPERVISOR  │ production_supervisor, inventory_controller, etc.
2: OPERATOR    │ warehouse_staff, production_operator, sales_rep
1: VIEWER      │ (reserved)
0: NONE        │ (no access)
```

## 🎨 Role Colors (for UI)

```
Level 2: 🔵 Blue       (Operators)
Level 3: 🟠 Orange     (Supervisors)
Level 4: 🟣 Purple     (Managers)
Level 5: 🔴 Red        (Admin)
Level 6: 🔴 Dark Red   (Owner)
```

## ✅ Role Checklist by Function

### Need to Approve?
✓ production_supervisor, inventory_controller, planner,
  purchasing_officer, quality_officer, manager, owner_director

### Need to Export?
✓ production_supervisor, inventory_controller, planner,
  purchasing_officer, accountant, quality_officer, manager, owner_director

### Need to Edit Master Data?
✓ inventory_controller, planner, purchasing_officer,
  accountant, manager, owner_director

### Need to Manage Users?
✓ manager, owner_director, system_admin

### Need to See Reports?
✓ All except system_admin

## 🔍 Debugging

```tsx
// Check role config
const config = getRoleConfig(user.role);
console.log('Role:', config.label);
console.log('Department:', config.department);
console.log('Permissions:', config.permissions);

// Check permission
const hasIt = hasPermission(user.role, 'approve_orders');
console.log('Can approve:', hasIt);

// Check nav access
const canAccess = canAccessNavigation(user.role, 'reports');
console.log('Can access reports:', canAccess);
```

## 🚦 Decision Tree

```
Is user a system admin? → YES → system_admin
                    ↓ NO
Is user an owner? → YES → owner_director
              ↓ NO
Does user manage people? → YES → manager
                      ↓ NO
What's user's job?
├─ Production work? → Supervisor? → YES → production_supervisor
│                  └─ NO → production_operator
├─ Warehouse work? → Controller? → YES → inventory_controller
│                 └─ NO → warehouse_staff
├─ Sales? → sales_rep
├─ Planning? → planner
├─ Buying? → purchasing_officer
├─ Accounting? → accountant
└─ Quality? → quality_officer
```

## 📱 Module Access

```
Dashboard:     All 12 roles
Procurement:   warehouse_staff, planner, purchasing_officer, manager, owner_director
Inventory:     warehouse_staff, prod_operator, prod_supervisor, 
               inventory_controller, planner, sales_rep, purchasing_officer, manager, owner_director
Production:    prod_operator, prod_supervisor, planner, quality_officer, manager, owner_director
Sales:         sales_rep, manager, owner_director
Reports:       All except system_admin
Settings:      system_admin, owner_director
```

## 🎓 Learning Path

1. **5 min** → [ROLE_QUICKSTART.md](ROLE_QUICKSTART.md)
2. **10 min** → [src/examples/RoleSystemExamples.tsx](src/examples/RoleSystemExamples.tsx)
3. **20 min** → [ROLE_MANAGEMENT_GUIDE.md](ROLE_MANAGEMENT_GUIDE.md)
4. **Reference** → This card + [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

## 💡 Pro Tips

- Use **RoleGuard** for UI visibility
- Use **PermissionGuard** for functionality
- Use **useRoleAccess** in component logic
- Use permission **constants** to avoid typos
- Always **validate on backend**
- **Never hardcode role names** in checks
- Use **getRoleConfig()** for display names

## 🔗 Quick Links

| Resource | Purpose | Time |
|----------|---------|------|
| [ROLE_QUICKSTART.md](ROLE_QUICKSTART.md) | Get started | 5 min |
| [ROLE_MANAGEMENT_GUIDE.md](ROLE_MANAGEMENT_GUIDE.md) | Full details | 20 min |
| [src/examples/RoleSystemExamples.tsx](src/examples/RoleSystemExamples.tsx) | Code patterns | 10 min |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Navigation | 5 min |
| [src/config/roles.ts](src/config/roles.ts) | Implementation | Reference |

## ✨ Features at a Glance

✅ Type-safe with TypeScript
✅ No magic strings (use constants)
✅ Multiple access patterns (hooks, components, utilities)
✅ Production-ready (security, performance, scalability)
✅ Well-documented (6 docs + 10 examples)
✅ Easy to extend (add new permissions/roles)
✅ Flexible (roles, permissions, hierarchy)
✅ Tested patterns included

---

**Ready to implement?** → Start with [ROLE_QUICKSTART.md](ROLE_QUICKSTART.md)
