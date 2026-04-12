import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  Truck,
  Settings,
} from 'lucide-react';
import type { NavigationItem } from '../types/navigation';

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
    id: 'purchasing',
    label: 'Purchasing',
    path: '/purchasing',
    icon: ShoppingBag,
    roles: [
      'purchasing_officer',
      'accountant',
      'planner',
      'manager',
      'owner_director',
    ],
    isActive: (pathname) => pathname.startsWith('/purchasing'),
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
