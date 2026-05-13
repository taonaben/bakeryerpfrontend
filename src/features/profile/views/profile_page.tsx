import React, { useMemo } from 'react';
import { Building2, CheckCircle2, Mail, User } from 'lucide-react';
import { useUserStore } from '../../auth/stores/userStore';
import type { User } from '../../auth/types/models';
import './profile_page.css';

const ProfilePage: React.FC = () => {
  const storeUser = useUserStore((state) => state.user);
  const user = useMemo(() => storeUser ?? getStoredUser(), [storeUser]);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-empty-state">
          <User size={40} />
          <h1>Profile unavailable</h1>
          <p>No active user profile was found for this session.</p>
        </div>
      </div>
    );
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;

  return (
    <div className="profile-page">
      <section className="profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {getInitials(user)}
        </div>
        <div>
          <h1>{fullName}</h1>
          <p>{user.emp_code} · {formatRole(user.role)}</p>
        </div>
      </section>

      <section className="profile-grid" aria-label="User profile details">
        <ProfileField icon={<User size={18} />} label="Username" value={user.username} />
        <ProfileField icon={<Mail size={18} />} label="Email" value={user.email || '-'} />
        <ProfileField icon={<Building2 size={18} />} label="Company" value={user.company_name || user.company} />
        <ProfileField icon={<User size={18} />} label="Role" value={formatRole(user.role)} />
        <ProfileField icon={<CheckCircle2 size={18} />} label="Status" value={user.is_active ? 'Active' : 'Inactive'} />
        <ProfileField icon={<User size={18} />} label="Staff Access" value={user.is_staff ? 'Enabled' : 'Disabled'} />
      </section>
    </div>
  );
};

const ProfileField: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="profile-field">
    <div className="profile-field__icon">{icon}</div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('erp_user');
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    return null;
  }
}

function getInitials(user: User): string {
  const initials = [user.first_name, user.last_name]
    .filter(Boolean)
    .map((part) => part[0])
    .join('');
  return (initials || user.username.slice(0, 2) || 'U').toUpperCase();
}

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default ProfilePage;
