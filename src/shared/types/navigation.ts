import { LucideIcon } from 'lucide-react';

export type UserRole = 'Admin' | 'Production' | 'Warehouse' | 'Sales';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
  isActive?: (pathname: string) => boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  code?: string;
}
