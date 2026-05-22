import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  KeyRound,
  Save,
  ShieldCheck,
  Trash2,
  UserX,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "@/features/auth/stores/userStore";
import type { User, UserRole } from "@/features/auth/types/models";
import { profileService } from "../services/profile_services";
import type { ProfileUser, PatchProfileUserPayload } from "../types/profile_model";
import "../styles/profile.css";

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: "warehouse_staff", label: "Warehouse Staff" },
  { value: "production_operator", label: "Production Operator" },
  { value: "production_supervisor", label: "Production Supervisor" },
  { value: "inventory_controller", label: "Inventory Controller" },
  { value: "planner", label: "Planner" },
  { value: "sales_rep", label: "Sales Rep" },
  { value: "purchasing_officer", label: "Purchasing Officer" },
  { value: "accountant", label: "Accountant" },
  { value: "quality_officer", label: "Quality Officer" },
  { value: "manager", label: "Manager" },
  { value: "owner_director", label: "Owner / Director" },
  { value: "system_admin", label: "System Admin" },
];

interface UserDetailForm {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_staff: boolean;
}

interface PasswordResetForm {
  new_password: string;
  new_password2: string;
}

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const storeUser = useUserStore((state) => state.user);
  const currentUser = useMemo(() => storeUser ?? getStoredUser(), [storeUser]);
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [formData, setFormData] = useState<UserDetailForm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordResetForm>({
    new_password: "",
    new_password2: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    if (!user || !formData) return false;

    return (
      formData.email !== (user.email || "") ||
      formData.username !== (user.username || "") ||
      formData.first_name !== (user.first_name || "") ||
      formData.last_name !== (user.last_name || "") ||
      formData.role !== user.role ||
      formData.is_active !== user.is_active ||
      formData.is_staff !== user.is_staff
    );
  }, [formData, user]);
  const isCurrentUser = !!user && !!currentUser && user.id === currentUser.id;

  const loadUser = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    setNotice(null);

    try {
      const loadedUser = await profileService.getUserById(userId);
      setUser(loadedUser);
      setFormData(toFormData(loadedUser));
    } catch (err: any) {
      setError(extractErrorMessage(err, "Failed to load user"));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (isCurrentUser) return;

    const { name, value } = event.target;

    setFormData((prev) => {
      if (!prev) return prev;

      if (name === "is_active" || name === "is_staff") {
        return { ...prev, [name]: value === "true" };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleBack = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }

    navigate("/users");
  };

  const handleSave = async () => {
    if (!user || !formData || !isDirty) return;
    if (isCurrentUser) {
      setError("You cannot edit your own account from user management.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const payload: PatchProfileUserPayload = {
        email: formData.email.trim(),
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role,
        is_active: formData.is_active,
        is_staff: formData.is_staff,
      };
      const updatedUser = await profileService.patchUser(user.id, payload);
      setUser(updatedUser);
      setFormData(toFormData(updatedUser));
      setNotice("User details saved.");
    } catch (err: any) {
      setError(extractErrorMessage(err, "Failed to save user"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    if (isCurrentUser) {
      setError("You cannot deactivate your own account from user management.");
      return;
    }

    setIsActionLoading(true);
    setError(null);
    setNotice(null);

    try {
      const updatedUser = await profileService.patchUser(user.id, {
        is_active: false,
      });
      setUser(updatedUser);
      setFormData(toFormData(updatedUser));
      setNotice("User deactivated.");
    } catch (err: any) {
      setError(extractErrorMessage(err, "Failed to deactivate user"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGrantStaffAccess = async () => {
    if (!user) return;
    if (isCurrentUser) {
      setError("You cannot change your own admin access from user management.");
      return;
    }

    setIsActionLoading(true);
    setError(null);
    setNotice(null);

    try {
      const updatedUser = await profileService.patchUser(user.id, {
        is_staff: true,
      });
      setUser(updatedUser);
      setFormData(toFormData(updatedUser));
      setNotice("Staff access granted.");
    } catch (err: any) {
      setError(extractErrorMessage(err, "Failed to grant staff access"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    if (isCurrentUser) {
      setPasswordError("Use your profile password flow to change your own password.");
      return;
    }

    setPasswordError(null);

    if (!passwordForm.new_password || !passwordForm.new_password2) {
      setPasswordError("Enter and confirm the new password.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password2) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsActionLoading(true);

    try {
      await profileService.resetPassword(user.id, passwordForm);
      setPasswordForm({ new_password: "", new_password2: "" });
      setShowResetPassword(false);
      setNotice("Password reset successfully.");
    } catch (err: any) {
      setPasswordError(extractErrorMessage(err, "Failed to reset password"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (isCurrentUser) {
      setError("You cannot delete your own account from user management.");
      setShowDeleteConfirm(false);
      return;
    }

    setIsActionLoading(true);
    setError(null);
    setNotice(null);

    try {
      await profileService.deleteUser(user.id);
      navigate("/users", { replace: true });
    } catch (err: any) {
      setError(extractErrorMessage(err, "Failed to delete user"));
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page profile-page--module">
        <div className="profile-loading-container profile-loading-container--standalone">
          <div className="profile-spinner" />
          <span>Loading user details...</span>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-page profile-page--module">
        <div className="profile-empty-state profile-empty-state--error">
          <h1>User unavailable</h1>
          <p>{error}</p>
          <button className="btn btn-outline" type="button" onClick={loadUser}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || !formData) {
    return (
      <div className="profile-page profile-page--module">
        <div className="profile-empty-state">
          <h1>User unavailable</h1>
          <p>No user was found for this request.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page profile-page--module">
      <div className="profile-user-detail-layout">
        <section className="profile-user-detail-main">
          <div className="profile-page-header profile-page-header--stacked">
            <div className="profile-page-header__left">
              <button
                className="btn btn-ghost profile-back-link"
                onClick={handleBack}
                type="button"
              >
                <ArrowLeft size={16} />
                Back to Users
              </button>
              <h1>{getDisplayName(user)}</h1>
              <p className="profile-page-header__breadcrumb">
                Profile / Users / {user.emp_code}
              </p>
            </div>
          </div>

          {error && (
            <div className="profile-error-banner" role="alert">
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="profile-notice-banner" role="status">
              {notice}
            </div>
          )}

          {isDirty && (
            <div className="profile-dirty-banner" role="status">
              You have unsaved changes on this user.
            </div>
          )}

          {isCurrentUser && (
            <div className="profile-dirty-banner" role="status">
              This is your own account. User management edits and admin actions
              are disabled here.
            </div>
          )}

          <div className="profile-create-form">
            <div className="form-card">
              <h2 className="form-card__title">Editable Details</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleFieldChange}
                    disabled={isCurrentUser || isSaving || isActionLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleFieldChange}
                    disabled={isCurrentUser || isSaving || isActionLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange}
                    disabled={isCurrentUser || isSaving || isActionLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleFieldChange}
                    disabled={isCurrentUser || isSaving || isActionLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleFieldChange}
                    disabled={isCurrentUser || isSaving || isActionLoading}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="is_active">Status</label>
                  <select
                    id="is_active"
                    name="is_active"
                    value={String(formData.is_active)}
                    onChange={handleFieldChange}
                    disabled={isCurrentUser || isSaving || isActionLoading}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="is_staff">Staff / Superuser Access</label>
                  <select
                    id="is_staff"
                    name="is_staff"
                    value={String(formData.is_staff)}
                    onChange={handleFieldChange}
                    disabled={isCurrentUser || isSaving || isActionLoading}
                  >
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <div className="profile-readonly-box">
                    <strong>{user.company_name || user.company}</strong>
                    <span>{user.company}</span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setFormData(toFormData(user))}
                  disabled={
                    isCurrentUser || !isDirty || isSaving || isActionLoading
                  }
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={
                    isCurrentUser || !isDirty || isSaving || isActionLoading
                  }
                >
                  <Save size={16} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="form-card">
              <h2 className="form-card__title">Read-only Details</h2>
              <div className="profile-detail-readonly-grid">
                <ProfileReadonlyField label="Employee Code" value={user.emp_code} />
                <ProfileReadonlyField label="User ID" value={user.id} />
                <ProfileReadonlyField
                  label="Joined"
                  value={formatDateTime(user.date_joined)}
                />
              </div>
            </div>
          </div>
        </section>

        <aside className="profile-user-action-panel">
          <h2>Actions</h2>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleDeactivate}
            disabled={
              isCurrentUser || !user.is_active || isActionLoading || isSaving
            }
          >
            <UserX size={16} />
            Deactivate User
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleGrantStaffAccess}
            disabled={
              isCurrentUser || user.is_staff || isActionLoading || isSaving
            }
          >
            <ShieldCheck size={16} />
            Grant Superuser Access
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowResetPassword(true)}
            disabled={isCurrentUser || isActionLoading || isSaving}
          >
            <KeyRound size={16} />
            Reset Password
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isCurrentUser || isActionLoading || isSaving}
          >
            <Trash2 size={16} />
            Delete User
          </button>
        </aside>
      </div>

      {showDiscardConfirm && (
        <ConfirmDialog
          title="Discard unsaved changes?"
          message="This user has edits that have not been saved. Leaving now will lose those changes."
          confirmLabel="Discard and leave"
          danger
          onCancel={() => setShowDiscardConfirm(false)}
          onConfirm={() => navigate("/users")}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete user?"
          message={`This will permanently delete ${getDisplayName(user)}.`}
          confirmLabel={isActionLoading ? "Deleting..." : "Delete User"}
          danger
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          disabled={isActionLoading}
        />
      )}

      {showResetPassword && (
        <div className="profile-modal" role="dialog" aria-modal="true">
          <div
            className="profile-modal__overlay"
            onClick={() => {
              if (!isActionLoading) setShowResetPassword(false);
            }}
          />
          <div className="profile-modal__content">
            <h3>Reset Password</h3>
            <p>
              Set a new password for <strong>{getDisplayName(user)}</strong>.
              The old password is not required for this admin action.
            </p>
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
                disabled={isActionLoading}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="new_password2">Confirm New Password</label>
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
                disabled={isActionLoading}
                autoComplete="new-password"
              />
            </div>
            {passwordError && <div className="profile-modal__error">{passwordError}</div>}
            <div className="profile-modal__actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowResetPassword(false)}
                disabled={isActionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleResetPassword}
                disabled={isActionLoading}
              >
                {isActionLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileReadonlyField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="profile-readonly-field">
    <span>{label}</span>
    <strong>{value || "-"}</strong>
  </div>
);

const ConfirmDialog: React.FC<{
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({
  title,
  message,
  confirmLabel,
  danger = false,
  disabled = false,
  onCancel,
  onConfirm,
}) => (
  <div className="profile-modal" role="dialog" aria-modal="true">
    <div className="profile-modal__overlay" onClick={onCancel} />
    <div className="profile-modal__content">
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="profile-modal__actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </button>
        <button
          type="button"
          className={danger ? "btn btn-danger" : "btn btn-primary"}
          onClick={onConfirm}
          disabled={disabled}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

function toFormData(user: ProfileUser): UserDetailForm {
  return {
    email: user.email || "",
    username: user.username || "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    role: user.role,
    is_active: user.is_active,
    is_staff: user.is_staff,
  };
}

function getDisplayName(user: ProfileUser): string {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username ||
    user.email
  );
}

function formatDateTime(value: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStoredUser(): User | null {
  try {
    const savedUser = localStorage.getItem("erp_user");
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  } catch {
    return null;
  }
}

function extractErrorMessage(error: any, fallback: string): string {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default UserDetailPage;
