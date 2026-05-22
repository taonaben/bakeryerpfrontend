import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/features/auth/stores/userStore";
import type { User, UserRole } from "@/features/auth/types/models";
import { profileService } from "../services/profile_services";
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

interface CreateUserForm {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: UserRole | "";
}

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const storeUser = useUserStore((state) => state.user);
  const sessionUser = useMemo(() => storeUser ?? getStoredUser(), [storeUser]);
  const [formData, setFormData] = useState<CreateUserForm>({
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    role: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyId = sessionUser?.company || "";
  const companyName = sessionUser?.company_name || companyId || "Current company";

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    if (!formData.password2) {
      errors.password2 = "Please confirm the password";
    }
    if (
      formData.password &&
      formData.password2 &&
      formData.password !== formData.password2
    ) {
      errors.password2 = "Passwords do not match";
    }
    if (!formData.role) {
      errors.role = "Role is required";
    }
    if (!companyId) {
      errors.company = "Company was not found in the current session";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm() || !formData.role || !companyId) return;

    setIsSubmitting(true);

    try {
      await profileService.createUser({
        email: formData.email.trim(),
        password: formData.password,
        password2: formData.password2,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        company: companyId,
        role: formData.role,
      });
      navigate("/users");
    } catch (error: any) {
      setFormError(extractErrorMessage(error, "Failed to create user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page profile-page--module">
      <div className="profile-form-layout">
        <div className="profile-page-header profile-page-header--stacked">
          <div className="profile-page-header__left">
            <button
              className="btn btn-ghost profile-back-link"
              onClick={() => navigate("/users")}
              type="button"
            >
              <ArrowLeft size={16} />
              Back to Users
            </button>
            <h1>Create User</h1>
            <p className="profile-page-header__breadcrumb">
              Profile / Users / New
            </p>
          </div>
        </div>

        {formError && (
          <div className="profile-error-banner" role="alert">
            <span>{formError}</span>
          </div>
        )}

        <form className="profile-create-form" onSubmit={handleSubmit} noValidate>
          <div className="form-card">
            <h2 className="form-card__title">User Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">
                  First Name <span className="required">*</span>
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {fieldErrors.first_name && (
                  <span className="field-error">{fieldErrors.first_name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last_name">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {fieldErrors.last_name && (
                  <span className="field-error">{fieldErrors.last_name}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {fieldErrors.email && (
                  <span className="field-error">{fieldErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="role">
                  Role <span className="required">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select role</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.role && (
                  <span className="field-error">{fieldErrors.role}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Company</label>
              <div className="profile-readonly-box">
                <strong>{companyName}</strong>
                <span>This is assigned from the current operating company.</span>
              </div>
              {fieldErrors.company && (
                <span className="field-error">{fieldErrors.company}</span>
              )}
            </div>
          </div>

          <div className="form-card">
            <h2 className="form-card__title">Initial Password</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                {fieldErrors.password && (
                  <span className="field-error">{fieldErrors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password2">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                {fieldErrors.password2 && (
                  <span className="field-error">{fieldErrors.password2}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/users")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

export default CreateUserPage;
