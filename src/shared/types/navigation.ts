import { LucideIcon } from 'lucide-react';
import type { UserRole } from '../../features/auth/types/models';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
  isActive?: (pathname: string) => boolean;
}

export interface SidebarSectionItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: UserRole[];
  badgeKey?: string;
  isActive?: (pathname: string) => boolean;
}

export interface SidebarSection {
  id: string;
  label: string;
  items: SidebarSectionItem[];
}

export interface ModuleSidebarConfig {
  moduleId: string;
  sections: SidebarSection[];
}

