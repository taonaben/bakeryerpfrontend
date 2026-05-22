import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { profileService } from "../services/profile_services";
import type { ProfileUser } from "../types/profile_model";
import "../styles/profile.css";

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileService.listUsers({ page_size: 1000 });
      setUsers(response.results);
    } catch (err: any) {
      setError(extractErrorMessage(err, "Failed to load users"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [
        user.emp_code,
        user.email,
        user.first_name,
        user.last_name,
        user.username,
        user.company_name,
        user.role,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [searchTerm, users]);

  return (
    <div className="profile-page profile-page--module">
      <div className="profile-sticky-stack">
        <div className="profile-page-header">
          <div className="profile-page-header__left">
            <h1>Users / Employees</h1>
            <p className="profile-page-header__breadcrumb">
              Profile / Users
            </p>
          </div>
          <div className="profile-page-header__actions">
            <button
              className="btn btn-outline"
              onClick={loadUsers}
              type="button"
              disabled={isLoading}
            >
              <RefreshCcw size={17} className={isLoading ? "spin" : ""} />
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/users/new")}
              type="button"
            >
              <Plus size={18} />
              Add User
            </button>
          </div>
        </div>

        <div className="profile-toolbar">
          <div className="profile-toolbar__left">
            <span className="profile-result-count">
              {filteredUsers.length} of {users.length} users
            </span>
          </div>
          <div className="profile-toolbar__right">
            <label className="profile-search-bar">
              <Search size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search users"
                aria-label="Search users"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {error && (
          <div className="profile-error-banner" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadUsers}>
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="profile-loading-container">
            <div className="profile-spinner" />
            <span>Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="profile-empty-state">
            <Users size={40} />
            <h1>No users found</h1>
            <p>
              {searchTerm
                ? "No company users match the current search."
                : "No company users are available yet."}
            </p>
          </div>
        ) : (
          <div className="profile-table-card">
            <div className="profile-table-wrap">
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => navigate(`/users/${user.id}`)}
                      className="profile-table__clickable-row"
                    >
                      <td data-label="Employee">
                        <div className="profile-user-cell">
                          <strong>{getDisplayName(user)}</strong>
                          <span>{user.emp_code}</span>
                        </div>
                      </td>
                      <td data-label="Email">{user.email || "-"}</td>
                      <td data-label="Username">{user.username || "-"}</td>
                      <td data-label="Role">
                        <span className="profile-role-pill">
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td data-label="Status">
                        <span
                          className={`profile-status-badge ${
                            user.is_active
                              ? "profile-status-badge--active"
                              : "profile-status-badge--inactive"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td data-label="Joined">{formatDate(user.date_joined)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getDisplayName(user: ProfileUser): string {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username ||
    user.email
  );
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function extractErrorMessage(error: any, fallback: string): string {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default UserManagementPage;
