import {
  LayoutDashboard,
  Package,
  ClipboardList,
  CalendarDays,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Truck,
  FlaskConical,
  Settings,
  FileText,
  ShoppingBag,
  Receipt,
  Users,
  CheckSquare,
  Tag,
  Calculator,
  History,
  Database,
  Layers,
  ListOrdered,
  RefreshCcw,
  FileBarChart2,
  BookOpen,
  Percent,
  TrendingUp,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import type { NavigationItem, ModuleSidebarConfig } from '../types/navigation';

/**
 * NAVIGATION CONFIGURATION
 * 
 * This is the single source of truth for all navigation items.
 * To add/remove tabs, simply modify this array.
 * 
 * Each item defines:
 * - id: Unique identifier
 * - label: Display name
 * - path: Route path
 * - icon: Lucide icon component
 * - roles: Which user roles can see this item
 * - isActive: Optional function to determine if route is active (for nested routes)
 */
export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: [
      'warehouse_staff',
      'production_operator',
      'production_supervisor',
      'inventory_controller',
      'planner',
      'sales_rep',
      'purchasing_officer',
      'accountant',
      'quality_officer',
      'manager',
      'owner_director',
      'system_admin',
    ],
    isActive: (pathname) => pathname === '/',
  },
  {
    id: 'procurement',
    label: 'Procurement',
    path: '/procurement',
    icon: Truck,
    roles: [
      'warehouse_staff',
      'planner',
      'purchasing_officer',
      'manager',
      'owner_director',
    ],
    isActive: (pathname) => pathname.startsWith('/procurement'),
  },

  {
    id: 'inventory',
    label: 'Inventory',
    path: '/inventory',
    icon: Package,
    roles: [
      'warehouse_staff',
      'production_operator',
      'production_supervisor',
      'inventory_controller',
      'planner',
      'sales_rep',
      'purchasing_officer',
      'manager',
      'owner_director',
    ],
    isActive: (pathname) => pathname.startsWith('/inventory'),
  },
  {
    id: 'formulation',
    label: 'Formulation',
    path: '/formulation',
    icon: FlaskConical,
    roles: [
      'production_operator',
      'production_supervisor',
      'inventory_controller',
      'planner',
      'quality_officer',
      'manager',
      'owner_director',
    ],
    isActive: (pathname) => pathname.startsWith('/formulation'),
  },
  {
    id: 'production',
    label: 'Production',
    path: '/production',
    icon: ClipboardList,
    roles: [
      'production_operator',
      'production_supervisor',
      'planner',
      'quality_officer',
      'manager',
      'owner_director',
    ],
    isActive: (pathname) => pathname.startsWith('/production'),
  },
  {
    id: 'sales',
    label: 'Sales & Dist.',
    path: '/sales',
    icon: ShoppingCart,
    roles: [
      'sales_rep',
      'manager',
      'owner_director',
    ],
    isActive: (pathname) => pathname.startsWith('/sales'),
  },
  {
    id: 'finance',
    label: 'Finance',
    path: '/finance',
    icon: DollarSign,
    roles: [
      'purchasing_officer',
      'accountant',
      'planner',
      'manager',
      'owner_director',
    ],
    isActive: (pathname) => pathname.startsWith('/finance'),
  },
  {
    id: 'costing',
    label: 'Costing',
    path: '/costing',
    icon: Calculator,
    roles: [
      'accountant',
      'planner',
      'manager',
      'owner_director',
      'system_admin',
    ],
    isActive: (pathname) => pathname.startsWith('/costing'),
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: [
      'production_supervisor',
      'inventory_controller',
      'planner',
      'sales_rep',
      'purchasing_officer',
      'accountant',
      'quality_officer',
      'manager',
      'owner_director',
    ],
    isActive: (pathname) => pathname.startsWith('/reports'),
  },
];

/**
 * SETTINGS ITEM (Separate as it appears at bottom)
 */
export const settingsItem: NavigationItem = {
  id: 'settings',
  label: 'Settings',
  path: '/settings',
  icon: Settings,
  roles: ['system_admin', 'owner_director'],
  isActive: (pathname) => pathname.startsWith('/settings'),
};


/**
 * UTILITY: Filter navigation items by user role
 */
export const getNavigationForRole = (role: string): NavigationItem[] => {
  return navigationItems.filter((item) =>
    item.roles.includes(role as any)
  );
};

/**
 * MODULE SIDEBAR CONFIGURATIONS
 * 
 * Defines the section-grouped sub-navigation shown when a user
 * enters a specific module. Each module has its own set of sections
 * with labelled items, icons, and optional badge keys.
 */
export const moduleSidebarConfigs: Record<string, ModuleSidebarConfig> = {
  procurement: {
    moduleId: 'procurement',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          { id: 'procurement-dashboard', label: 'Overview', path: '/procurement', icon: LayoutDashboard },
        ],
      },
      {
        id: 'procurement',
        label: 'Procurement',
        items: [
          { id: 'requisitions', label: 'Requisitions', path: '/procurement/requisitions', icon: FileText, badgeKey: 'requisitions' },
          { id: 'purchase-orders', label: 'Purchase Orders', path: '/procurement/purchase-orders', icon: ShoppingBag, badgeKey: 'purchaseOrders' },
          { id: 'goods-receipts', label: 'Goods Receipts', path: '/procurement/goods-receipts', icon: CheckSquare },
        ],
      },
      {
        id: 'finance',
        label: 'Finance',
        items: [
          { id: 'supplier-invoices', label: 'Supplier Invoices', path: '/procurement/invoices', icon: Receipt, badgeKey: 'supplierInvoices' },
        ],
      },
      {
        id: 'master-data',
        label: 'Master Data',
        items: [
          { id: 'procurement-suppliers', label: 'Suppliers', path: '/procurement/suppliers', icon: Users },
          {
            id: 'supplier-products',
            label: 'Supplier Products',
            path: '/procurement/supplier-products',
            icon: Tag,
            isActive: (pathname) => pathname.startsWith('/procurement/supplier-products'),
          },
        ],
      },
    ],
  },
  inventory: {
    moduleId: 'inventory',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          { id: 'inventory-dashboard', label: 'Overview', path: '/inventory', icon: LayoutDashboard },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        items: [
          { id: 'stock-movements', label: 'Stock Movements', path: '/inventory/movements', icon: History },
          { id: 'stock-balances', label: 'Stock Balances', path: '/inventory/balances', icon: Database },
          { id: 'batches', label: 'Batches Registry', path: '/inventory/batches', icon: Layers },
        ],
      },
      {
        id: 'master-data',
        label: 'Master Data',
        items: [
          { id: 'inventory-products', label: 'Products', path: '/inventory/products', icon: Package },
        ],
      },
    ],
  },
  formulation: {
    moduleId: 'formulation',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          { id: 'formulation-dashboard', label: 'Overview', path: '/formulation', icon: LayoutDashboard },
        ],
      },
    ],
  },

  production: {
    moduleId: 'production',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          {
            id: 'production-dashboard',
            label: 'Overview',
            path: '/production',
            icon: LayoutDashboard,
            isActive: (pathname) => pathname === '/production',
          },
        ],
      },
      {
        id: 'planning',
        label: 'Planning',
        items: [
          {
            id: 'planned-orders',
            label: 'Planned Orders',
            path: '/production/planned-orders',
            icon: ListOrdered,
            isActive: (pathname) => pathname.startsWith('/production/planned-orders'),
          },
          {
            id: 'production-calendar',
            label: 'Calendar',
            path: '/production/calendar',
            icon: CalendarDays,
            isActive: (pathname) => pathname.startsWith('/production/calendar'),
          },
        ],
      },
      {
        id: 'execution',
        label: 'Production',
        items: [
          {
            id: 'production-orders',
            label: 'Orders',
            path: '/production/orders',
            icon: ClipboardList,
            isActive: (pathname) => pathname.startsWith('/production/orders'),
          },
          {
            id: 'production-rework',
            label: 'Rework',
            path: '/production/rework',
            icon: RefreshCcw,
            isActive: (pathname) => pathname.startsWith('/production/rework'),
          },
          {
            id: 'production-batches',
            label: 'Batches',
            path: '/production/batches',
            icon: Layers,
            isActive: (pathname) =>
              pathname.startsWith('/production/batches') ||
              (pathname.startsWith('/production/orders') && pathname.includes('/batches')),
          },
        ],
      },
      {
        id: 'reports',
        label: 'Reports',
        items: [
          {
            id: 'production-reports',
            label: 'Reports',
            path: '/production/reports',
            icon: FileBarChart2,
            isActive: (pathname) => pathname.startsWith('/production/reports'),
          },
        ],
      },
    ],
  },

  finance: {
    moduleId: 'finance',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          { id: 'finance-dashboard', label: 'Overview', path: '/finance', icon: LayoutDashboard },
          { id: 'finance-reports', label: 'Reports', path: '/finance/reports', icon: BarChart3 },
        ],
      },
      {
        id: 'accounting',
        label: 'Accounting',
        items: [
          { id: 'journal-entries', label: 'Journal Entries', path: '/finance/journal-entries', icon: FileText },
          { id: 'chart-of-accounts', label: 'Chart of Accounts', path: '/finance/chart-of-accounts', icon: ListOrdered },
          { id: 'fiscal-periods', label: 'Fiscal Periods', path: '/finance/fiscal-periods', icon: CalendarDays },
        ],
      },
      {
        id: 'receivables-payables',
        label: 'Receivables & Payables',
        items: [
          { id: 'accounts-receivable', label: 'Accounts Receivable', path: '/finance/accounts-receivable', icon: ShoppingCart },
          { id: 'accounts-payable', label: 'Accounts Payable', path: '/finance/accounts-payable', icon: ShoppingBag },
        ],
      },
    ],
  },
  costing: {
    moduleId: 'costing',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          {
            id: 'costing-dashboard',
            label: 'Overview',
            path: '/costing',
            icon: LayoutDashboard,
            isActive: (pathname) => pathname === '/costing',
          },
        ],
      },
      {
        id: 'cost-management',
        label: 'Cost Management',
        items: [
          {
            id: 'costing-entries',
            label: 'Costing Entries',
            path: '/costing/entries',
            icon: FileText,
            isActive: (pathname) => pathname.startsWith('/costing/entries'),
          },
          {
            id: 'standard-costs',
            label: 'Standard Costs',
            path: '/costing/standard-costs',
            icon: BookOpen,
            isActive: (pathname) => pathname.startsWith('/costing/standard-costs'),
          },
          {
            id: 'overhead-rates',
            label: 'Overhead Rates',
            path: '/costing/overhead-rates',
            icon: Percent,
            isActive: (pathname) => pathname.startsWith('/costing/overhead-rates'),
          },
        ],
      },
      {
        id: 'product-costing',
        label: 'Product Costing',
        items: [
          {
            id: 'product-costing',
            label: 'Product Costing',
            path: '/costing/product-costing',
            icon: Package,
            isActive: (pathname) => pathname.startsWith('/costing/product-costing'),
          },
          {
            id: 'pricing-rules',
            label: 'Product Pricing Rules',
            path: '/costing/pricing-rules',
            icon: Tag,
            isActive: (pathname) => pathname.startsWith('/costing/pricing-rules'),
          },
        ],
      },
      {
        id: 'analysis',
        label: 'Analysis',
        items: [
          {
            id: 'variance-analysis',
            label: 'Variance Analysis',
            path: '/costing/variance-analysis',
            icon: TrendingUp,
            isActive: (pathname) => pathname.startsWith('/costing/variance-analysis'),
          },
          {
            id: 'costing-reports',
            label: 'Reports & Analytics',
            path: '/costing/reports',
            icon: BarChart3,
            isActive: (pathname) => pathname.startsWith('/costing/reports'),
          },
        ],
      },
      {
        id: 'postings',
        label: 'Postings',
        items: [
          {
            id: 'cogs-posting',
            label: 'COGS Posting',
            path: '/costing/cogs-posting',
            icon: ShoppingBag,
            isActive: (pathname) => pathname.startsWith('/costing/cogs-posting'),
          },
        ],
      },
    ],
  },

  sales: {
    moduleId: 'sales',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          {
            id: 'sales-dashboard',
            label: 'Overview',
            path: '/sales',
            icon: LayoutDashboard,
            isActive: (pathname) => pathname === '/sales',
          },
        ],
      },
      {
        id: 'orders',
        label: 'Orders',
        items: [
          {
            id: 'sales-orders',
            label: 'Sales Orders',
            path: '/sales/orders',
            icon: ShoppingCart,
            isActive: (pathname) => pathname.startsWith('/sales/orders'),
          },
        ],
      },
      {
        id: 'fulfilment',
        label: 'Fulfilment',
        items: [
          {
            id: 'sales-deliveries',
            label: 'Deliveries',
            path: '/sales/deliveries',
            icon: Truck,
            isActive: (pathname) => pathname.startsWith('/sales/deliveries'),
          },
        ],
      },
      {
        id: 'billing',
        label: 'Billing',
        items: [
          {
            id: 'sales-invoices',
            label: 'Invoices',
            path: '/sales/invoices',
            icon: Receipt,
            isActive: (pathname) => pathname.startsWith('/sales/invoices'),
          },
          {
            id: 'sales-payments',
            label: 'Payments',
            path: '/sales/payments',
            icon: Wallet,
            isActive: (pathname) => pathname.startsWith('/sales/payments'),
          },
        ],
      },
      {
        id: 'customers',
        label: 'Customers',
        items: [
          {
            id: 'sales-customers',
            label: 'Customers',
            path: '/sales/customers',
            icon: Users,
            isActive: (pathname) => pathname.startsWith('/sales/customers'),
          },
          {
            id: 'sales-price-agreements',
            label: 'Pricing Agreements',
            path: '/sales/price-agreements',
            icon: FileText,
            isActive: (pathname) => pathname.startsWith('/sales/price-agreements'),
          },
        ],
      },
      {
        id: 'reports',
        label: 'Reports & Analytics',
        items: [
          {
            id: 'sales-reports',
            label: 'Sales Reports',
            path: '/sales/reports',
            icon: BarChart3,
            isActive: (pathname) => pathname.startsWith('/sales/reports'),
          },
          {
            id: 'sales-debtors',
            label: 'Debtor Management',
            path: '/sales/debtors',
            icon: AlertCircle,
            isActive: (pathname) => pathname.startsWith('/sales/debtors'),
          },
        ],
      },
    ],
  },
};

/**
 * Derive the active module ID from the current URL pathname.
 * Returns null if on dashboard or a module without sidebar config.
 */
export const getActiveModuleFromPath = (pathname: string): string | null => {
  for (const moduleId of Object.keys(moduleSidebarConfigs)) {
    if (pathname.startsWith(`/${moduleId}`)) {
      return moduleId;
    }
  }
  return null;
};

/**
 * Get the module sidebar config for a given module ID.
 */
export const getModuleSidebarConfig = (moduleId: string): ModuleSidebarConfig | null => {
  return moduleSidebarConfigs[moduleId] || null;
};
