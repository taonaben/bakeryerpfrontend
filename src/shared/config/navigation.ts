import {
  LayoutDashboard,
  Package,
  ClipboardList,
  CalendarDays,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Truck,
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
          { id: 'procurement-dashboard', label: 'Dashboard', path: '/procurement', icon: LayoutDashboard },
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
          { id: 'finance-dashboard', label: 'Dashboard', path: '/finance', icon: LayoutDashboard },
        ],
      },
      {
        id: 'finance',
        label: 'Finance',
        items: [
          { id: 'invoices', label: 'Invoices', path: '/finance/invoices', icon: Receipt },
          { id: 'price-lists', label: 'Price Lists', path: '/finance/price-lists', icon: Tag },
          { id: 'costing', label: 'Costing', path: '/finance/costing', icon: Calculator },
        ],
      },
      {
        id: 'master-data',
        label: 'Master Data',
        items: [
          { id: 'finance-suppliers', label: 'Suppliers', path: '/finance/suppliers', icon: Users },
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
          { id: 'inventory-dashboard', label: 'Dashboard', path: '/inventory', icon: LayoutDashboard },
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
  production: {
    moduleId: 'production',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          {
            id: 'production-dashboard',
            label: 'Dashboard',
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
