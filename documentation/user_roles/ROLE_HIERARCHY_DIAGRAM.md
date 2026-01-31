# Role Hierarchy & Access Level Diagram

## Access Level Hierarchy

```
Level 6: OWNER
┌─────────────────────────────────────────┐
│         Owner / Director                │
│    • Full system access                 │
│    • Strategic reporting                │
│    • All approvals                      │
└─────────────────────────────────────────┘
            ▲
            │
Level 5: ADMIN
┌─────────────────────────────────────────┐
│         System Admin                    │
│    • User management                    │
│    • System configuration               │
│    • Security management                │
└─────────────────────────────────────────┘
            ▲
            │
Level 4: MANAGER
┌─────────────────────────────────────────┐
│           Manager                       │
│    • Department operations              │
│    • Staff management                   │
│    • Transaction approvals              │
│    • Data export                        │
└─────────────────────────────────────────┘
            ▲
            │
Level 3: SUPERVISOR
┌─────────────────────────────────────────┐
│ Production Supervisor, Inventory        │
│ Controller, Planner, Purchasing Officer,│
│ Accountant, Quality Officer             │
│    • Approval authority                 │
│    • Report generation                  │
│    • Data export                        │
│    • Master data editing                │
└─────────────────────────────────────────┘
            ▲
            │
Level 2: OPERATOR
┌─────────────────────────────────────────┐
│ Warehouse Staff, Production Operator,   │
│ Sales Rep                               │
│    • Create operations                  │
│    • View reports (limited)             │
│    • No approval authority              │
└─────────────────────────────────────────┘
            ▲
            │
Level 1: VIEWER
(Reserved for future read-only roles)
```

## Department Organization

```
EXECUTIVE
└── Owner / Director (Level 6)
    • Complete oversight
    • All modules access

MANAGEMENT
└── Manager (Level 4)
    • Department oversight
    • Staff management
    • All business modules

PRODUCTION
├── Production Operator (Level 2)
│   • Execute orders
│   • Record batches
│
├── Production Supervisor (Level 3)
│   • Supervise operators
│   • Approve orders
│   • Quality oversight
│
└── Quality Officer (Level 3)
    • Quality assurance
    • Defect management

WAREHOUSE
├── Warehouse Staff (Level 2)
│   • Stock movements
│   • Bin management
│
└── Inventory Controller (Level 3)
    • Inventory management
    • Approvals
    • Adjustments

PLANNING
└── Planner (Level 3)
    • Production planning
    • Procurement planning
    • Forecasting

PROCUREMENT
└── Purchasing Officer (Level 3)
    • Create POs
    • Supplier management
    • Goods receipt

SALES
└── Sales Rep (Level 2)
    • Create orders
    • Customer management
    • Sales reporting

FINANCE
└── Accountant (Level 3)
    • Financial records
    • Invoicing
    • Reconciliation

IT
└── System Admin (Level 5)
    • User management
    • System configuration
    • Security
```

## Capability Matrix

### View Access

```
         Dashboard Procurement Inventory Production Sales Reports Settings
────────────────────────────────────────────────────────────────────────────
warehouse_staff        ✓          ✓           ✓          ✗       ✗    ✗      ✗
production_operator    ✓          ✗           ✓          ✓       ✗    ✗      ✗
prod_supervisor        ✓          ✗           ✓          ✓       ✗    ✓      ✗
inventory_controller   ✓          ✓           ✓          ✗       ✗    ✓      ✗
planner                ✓          ✓           ✓          ✓       ✗    ✓      ✗
sales_rep              ✓          ✗           ✓          ✗       ✓    ✓      ✗
purchasing_officer     ✓          ✓           ✓          ✗       ✗    ✓      ✗
accountant             ✓          ✗           ✗          ✗       ✗    ✓      ✗
quality_officer        ✓          ✗           ✗          ✓       ✗    ✓      ✗
manager                ✓          ✓           ✓          ✓       ✓    ✓      ✗
owner_director         ✓          ✓           ✓          ✓       ✓    ✓      ✓
system_admin           ✓          ✗           ✗          ✗       ✗    ✗      ✓
```

### Action Capabilities

```
                    View      Export    Edit Master  Approve   Manage
                   Reports     Data       Data      Transactions Users
──────────────────────────────────────────────────────────────────────
warehouse_staff      ✓         ✗         ✗           ✗         ✗
production_operator  ✓         ✗         ✗           ✗         ✗
prod_supervisor      ✓         ✓         ✗           ✓         ✗
inventory_controller ✓         ✓         ✓           ✓         ✗
planner              ✓         ✓         ✓           ✓         ✗
sales_rep            ✓         ✗         ✗           ✗         ✗
purchasing_officer   ✓         ✓         ✓           ✓         ✗
accountant           ✓         ✓         ✓           ✗         ✗
quality_officer      ✓         ✓         ✗           ✓         ✗
manager              ✓         ✓         ✓           ✓         ✓
owner_director       ✓         ✓         ✓           ✓         ✓
system_admin         ✗         ✗         ✗           ✗         ✓
```

## Permission Flow

```
User Request
    │
    ├─ Get UserRole (from auth)
    │   │
    │   └─ Check with getRoleConfig(role)
    │
    ├─ Check Permission with hasPermission(role, permission)
    │   │
    │   └─ Return boolean: allowed/denied
    │
    └─ Render UI
        │
        ├─ If allowed: Show full functionality
        └─ If denied: Show fallback UI or nothing
```

## Role Selection Decision Tree

```
Is user an Owner/Director?
├─ YES → owner_director (Full Access)
│
└─ NO → Does user manage staff/department?
   ├─ YES → Is it IT/System role?
   │   ├─ YES → system_admin (System Management)
   │   └─ NO → manager (Department Management)
   │
   └─ NO → What is user's department/function?
      ├─ PRODUCTION
      │   ├─ Supervises others? → production_supervisor
      │   └─ Only operates? → production_operator
      │
      ├─ WAREHOUSE/INVENTORY
      │   ├─ Controls inventory? → inventory_controller
      │   └─ Moves stock? → warehouse_staff
      │
      ├─ PLANNING → planner
      ├─ PROCUREMENT → purchasing_officer
      ├─ SALES → sales_rep
      ├─ FINANCE → accountant
      └─ QUALITY → quality_officer
```

## API Response Mapping Example

```javascript
// Backend Response
{
  "id": "usr_123",
  "username": "john_doe",
  "email": "john@bakery.com",
  "role": "production_supervisor"  // One of the 12 roles
}

// Frontend Processes
↓
// Gets role configuration
RoleConfig = ROLE_CONFIGS['production_supervisor']

// Can perform these checks:
✓ hasPermission('approve_production_orders') = true
✓ canAccessNavigation('production') = true
✓ canApproveTransactions = true
✓ canExportData = true
✗ canManageUsers = false

// Navigation is automatically filtered
visibleNavItems = ['dashboard', 'production', 'inventory', 'reports']

// User sees appropriate UI based on capabilities
```

## Transition Paths

```
Entry Level (Operators)
├── warehouse_staff ──→ inventory_controller → manager
├── production_operator ──→ production_supervisor → manager
└── sales_rep ──→ manager

Mid Level (Supervisors)
├── production_supervisor ──→ manager → owner_director
├── inventory_controller ──→ manager → owner_director
├── planner ──→ manager → owner_director
├── purchasing_officer ──→ manager → owner_director
├── accountant ──→ manager → owner_director
└── quality_officer ──→ manager → owner_director

Senior Level
├── manager ──→ owner_director
└── system_admin (specialized path)
```

## Color Coding (for UI implementations)

```
Level 1 (VIEWER):        #E8F5E9 (Light Green)
Level 2 (OPERATOR):      #E3F2FD (Light Blue)
Level 3 (SUPERVISOR):    #FFF3E0 (Light Orange)
Level 4 (MANAGER):       #F3E5F5 (Light Purple)
Level 5 (ADMIN):         #FCE4EC (Light Pink)
Level 6 (OWNER):         #FFEBEE (Light Red)

Departments:
Production:    #C8E6C9 (Green)
Warehouse:     #BBDEFB (Blue)
Sales:         #FFE0B2 (Orange)
Finance:       #D1C4E9 (Purple)
Planning:      #B2DFDB (Teal)
Procurement:   #F8BBD0 (Pink)
Quality:       #FFCCBC (Deep Orange)
IT:            #B3E5FC (Cyan)
Management:    #E1BEE7 (Deep Purple)
Executive:     #FFCDD2 (Red)
```

## Access Complexity Analysis

```
Roles by Permission Count (descending):
1. owner_director:     17 permissions (Full access)
2. manager:            16 permissions (Most operations)
3. system_admin:        7 permissions (IT only)
4. planner:             7 permissions (Planning focused)
5-9. prod_supervisor, inventory_controller,
     purchasing_officer, accountant,
     quality_officer:   6-9 permissions each
10-12. warehouse_staff, production_operator,
       sales_rep:       5-6 permissions each
```
