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

