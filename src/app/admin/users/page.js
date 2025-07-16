"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiMail,
  FiShield,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { TagManager } from "../../../components/features";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/auth/users");
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const updateUserAccess = async (userId, updates) => {
    setUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await axios.patch("/api/auth/users", {
        userId,
        ...updates,
      });

      if (response.data.success) {
        // Update the user in the local state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, ...updates } : user
          )
        );
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to update user");
    } finally {
      setUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "facilitator":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">
            Manage users, roles, and system settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiUsers className="h-4 w-4" />
              <span>User Management</span>
            </button>
            <button
              onClick={() => setActiveTab("tags")}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tags"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiTag className="h-4 w-4" />
              <span>Tag Management</span>
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "users" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                User Management
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage user roles and document access permissions
              </p>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FiUser className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name}
                            </p>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiMail className="mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiCalendar className="mr-1" />
                            Joined {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Document Access Toggle */}
                        <div className="flex items-center">
                          <span className="text-sm text-gray-700 mr-2">
                            Document Access:
                          </span>
                          <button
                            onClick={() =>
                              updateUserAccess(user.id, {
                                hasDocumentAccess: !user.hasDocumentAccess,
                              })
                            }
                            disabled={updating[user.id]}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                              user.hasDocumentAccess
                                ? "bg-primary-600"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                user.hasDocumentAccess
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                          {updating[user.id] && (
                            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                          )}
                        </div>

                        {/* Role Selection */}
                        <div className="flex items-center">
                          <span className="text-sm text-gray-700 mr-2">
                            Role:
                          </span>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              updateUserAccess(user.id, {
                                role: e.target.value,
                              })
                            }
                            disabled={updating[user.id]}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          >
                            <option value="employee">Employee</option>
                            <option value="facilitator">Facilitator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <FiShield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating the first user account.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "tags" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Tag Management
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage document tags for better organization
              </p>
            </div>
            <TagManager />
          </div>
        )}
      </div>
    </div>
  );
}
