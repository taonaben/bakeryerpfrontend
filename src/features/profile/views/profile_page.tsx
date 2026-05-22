import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { User as AuthUser } from "../../auth/types/models";
import { profileService } from "../services/profile_services";
import { useProfileStore } from "../stores/profile_store";
import "../styles/profile.css";

interface ProfilePageProps {
  userId?: string;
  onLogout?: () => void | Promise<void>;
  onUserUpdated?: (user: AuthUser) => void;
}

interface PasswordForm {
  old_password: string;
  new_password: string;
  new_password2: string;
}

const companyResources = [
  {
    icon: <FileText size={18} />,
    title: "Terms & Conditions",
    body: "Follow company system-use, attendance, confidentiality, asset-care, and acceptable conduct requirements for every shift.",
  },
  {
    icon: <BookOpen size={18} />,
    title: "Code of Conduct",
    body: "Treat coworkers, suppliers, drivers, and customers with respect. Keep records truthful and escalate conflicts early.",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Safety Rules",
    body: "Use PPE where required, report hazards immediately, keep production areas clean, and never bypass safety checks.",
  },
  {
    icon: <ClipboardCheck size={18} />,
    title: "Data Responsibility",
    body: "Only access records needed for your duties. Do not share credentials or export company data without approval.",
  },
];

const ProfilePage: React.FC<ProfilePageProps> = ({
  userId: explicitUserId,
  onLogout,
  onUserUpdated,
}) => {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams<{ userId: string }>();
  const user = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const error = useProfileStore((state) => state.error);
  const fetchCurrentProfile = useProfileStore(
    (state) => state.fetchCurrentProfile,
  );
  const fetchProfileById = useProfileStore((state) => state.fetchProfileById);
  const clearProfile = useProfileStore((state) => state.clearProfile);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    old_password: "",
    new_password: "",
    new_password2: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameNotice, setUsernameNotice] = useState<string | null>(null);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const targetUserId = explicitUserId ?? routeUserId;
  const isOwnProfile = !targetUserId;

  useEffect(() => {
    if (targetUserId) {
      fetchProfileById(targetUserId);
    } else {
      fetchCurrentProfile();
    }

    return () => {
      clearProfile();
    };
  }, [clearProfile, fetchCurrentProfile, fetchProfileById, targetUserId]);

  useEffect(() => {
    if (user) {
      setUsernameDraft(user.username || "");
    }
  }, [user]);

  const fullName = useMemo(() => {
    if (!user) return "";
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
  }, [user]);

  const handlePasswordChange = async () => {
    setPasswordError(null);

    if (
      !passwordForm.old_password ||
      !passwordForm.new_password ||
      !passwordForm.new_password2
    ) {
      setPasswordError("Enter the current password and the new password.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password2) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await profileService.changePassword(passwordForm);
      setPasswordForm({
        old_password: "",
        new_password: "",
        new_password2: "",
      });
      setShowPasswordModal(false);
      setPasswordNotice("Password changed successfully.");
    } catch (err: any) {
      setPasswordError(extractErrorMessage(err, "Failed to change password"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUsernameSave = async () => {
    if (!user) return;

    const nextUsername = usernameDraft.trim();
    setUsernameError(null);
    setUsernameNotice(null);

    if (!nextUsername) {
      setUsernameError("Username is required.");
      return;
    }

    if (nextUsername === user.username) {
      setUsernameNotice("Username is already up to date.");
      return;
    }

    setIsSavingUsername(true);

    try {
      const updatedUser = await profileService.patchUser(user.id, {
        username: nextUsername,
      });
      onUserUpdated?.(updatedUser);
      await fetchCurrentProfile();
      setShowUsernameModal(false);
      setUsernameNotice("Username updated successfully.");
    } catch (err: any) {
      setUsernameError(extractErrorMessage(err, "Failed to update username"));
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleLogout = async () => {
    if (!onLogout) return;

    setIsLoggingOut(true);
    try {
      await Promise.resolve(onLogout());
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page profile-page--module">
        <div className="profile-empty-state" aria-live="polite">
          <User size={40} />
          <h1>Loading profile</h1>
          <p>Fetching the latest user details from the server.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page profile-page--module">
        <div
          className="profile-empty-state profile-empty-state--error"
          role="alert"
        >
          <User size={40} />
          <h1>Profile unavailable</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page profile-page--module">
        <div className="profile-empty-state">
          <User size={40} />
          <h1>Profile unavailable</h1>
          <p>No active user profile was found for this session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page profile-page--module">
      <div className="profile-self-content">
        <section className="profile-self-hero">
          <div className="profile-self-hero__identity">
            <div className="profile-self-avatar" aria-hidden="true">
              {getInitials(user)}
            </div>
            <div>
              <span className="profile-self-eyebrow">Employee profile</span>
              <h1>{fullName}</h1>
              <p>
                {user.emp_code} | {formatRole(user.role)}
              </p>
            </div>
          </div>
          {isOwnProfile && (
            <div className="profile-self-hero__actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setPasswordNotice(null);
                  setShowPasswordModal(true);
                }}
              >
                <KeyRound size={16} />
                Change Password
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setUsernameError(null);
                  setUsernameNotice(null);
                  setUsernameDraft(user.username || "");
                  setShowUsernameModal(true);
                }}
              >
                <Pencil size={16} />
                Change Username
              </button>
              {onLogout && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut size={16} />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              )}
            </div>
          )}
        </section>

        {passwordNotice && (
          <div className="profile-notice-banner" role="status">
            {passwordNotice}
          </div>
        )}

        <section className="profile-self-grid" aria-label="User profile details">
          <ProfileMetric
            icon={<Mail size={18} />}
            label="Email"
            value={user.email || "-"}
          />
          <ProfileMetric
            icon={<User size={18} />}
            label="Username"
            value={user.username || "-"}
          />
          <ProfileMetric
            icon={<Building2 size={18} />}
            label="Company"
            value={user.company_name || user.company}
          />
          <ProfileMetric
            icon={<BadgeCheck size={18} />}
            label="Employee Code"
            value={user.emp_code}
          />
          <ProfileMetric
            icon={<CheckCircle2 size={18} />}
            label="Account Status"
            value={user.is_active ? "Active" : "Inactive"}
          />
          <ProfileMetric
            icon={<ShieldCheck size={18} />}
            label="Staff Access"
            value={user.is_staff ? "Enabled" : "Disabled"}
          />
        </section>

        <section className="profile-self-panel">
          <div className="profile-self-panel__header">
            <div>
              <h2>Company Standards</h2>
              <p>Reference material every employee should understand and follow.</p>
            </div>
          </div>
          <div className="profile-resource-grid">
            {companyResources.map((resource) => (
              <article key={resource.title} className="profile-resource-card">
                <div className="profile-resource-card__icon">{resource.icon}</div>
                <h3>{resource.title}</h3>
                <p>{resource.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-self-panel">
          <div className="profile-self-panel__header">
            <div>
              <h2>Operational Expectations</h2>
              <p>Daily practices that keep the bakery ERP reliable.</p>
            </div>
          </div>
          <div className="profile-expectation-list">
            <ProfileExpectation
              title="Record work promptly"
              body="Post production, inventory, procurement, sales, and finance activity as close to the real event as possible."
            />
            <ProfileExpectation
              title="Escalate exceptions"
              body="Report stock variance, unsafe work, failed deliveries, supplier problems, and data errors before they become wider issues."
            />
            <ProfileExpectation
              title="Protect access"
              body="Lock shared terminals, keep passwords private, and use the correct account for every transaction."
            />
          </div>
        </section>
      </div>

      {showPasswordModal && (
        <div className="profile-modal" role="dialog" aria-modal="true">
          <div
            className="profile-modal__overlay"
            onClick={() => {
              if (!isChangingPassword) setShowPasswordModal(false);
            }}
          />
          <div className="profile-modal__content">
            <h3>Change Password</h3>
            <p>Confirm your current password before setting a new one.</p>
            <div className="form-group">
              <label htmlFor="old_password">Current Password</label>
              <input
                id="old_password"
                type="password"
                value={passwordForm.old_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    old_password: event.target.value,
                  }))
                }
                disabled={isChangingPassword}
                autoComplete="current-password"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="new_password">New Password</label>
                <input
                  id="new_password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      new_password: event.target.value,
                    }))
                  }
                  disabled={isChangingPassword}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="new_password2">Confirm Password</label>
                <input
                  id="new_password2"
                  type="password"
                  value={passwordForm.new_password2}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      new_password2: event.target.value,
                    }))
                  }
                  disabled={isChangingPassword}
                  autoComplete="new-password"
                />
              </div>
            </div>
            {passwordError && <div className="profile-modal__error">{passwordError}</div>}
            <div className="profile-modal__actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowPasswordModal(false)}
                disabled={isChangingPassword}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUsernameModal && (
        <div className="profile-modal" role="dialog" aria-modal="true">
          <div
            className="profile-modal__overlay"
            onClick={() => {
              if (!isSavingUsername) setShowUsernameModal(false);
            }}
          />
          <div className="profile-modal__content">
            <h3>Change Username</h3>
            <p>Update the username shown in the application and sidebar.</p>
            <div className="form-group">
              <label htmlFor="profile-username">Username</label>
              <input
                id="profile-username"
                type="text"
                value={usernameDraft}
                onChange={(event) => {
                  setUsernameDraft(event.target.value);
                  setUsernameError(null);
                  setUsernameNotice(null);
                }}
                disabled={isSavingUsername}
              />
              {usernameError && (
                <span className="field-error">{usernameError}</span>
              )}
              {usernameNotice && (
                <span className="profile-field-success">{usernameNotice}</span>
              )}
            </div>
            <div className="profile-modal__actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowUsernameModal(false)}
                disabled={isSavingUsername}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUsernameSave}
                disabled={
                  isSavingUsername || usernameDraft.trim() === user.username
                }
              >
                {isSavingUsername ? "Saving..." : "Save Username"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileMetric: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="profile-self-metric">
    <div className="profile-self-metric__icon">{icon}</div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);

const ProfileExpectation: React.FC<{ title: string; body: string }> = ({
  title,
  body,
}) => (
  <div className="profile-expectation-item">
    <div className="profile-expectation-item__marker" aria-hidden="true" />
    <div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  </div>
);

function getInitials(user: AuthUser): string {
  const initials = [user.first_name, user.last_name]
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
  return (initials || user.username.slice(0, 2) || "U").toUpperCase();
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractErrorMessage(error: any, fallback: string): string {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default ProfilePage;
