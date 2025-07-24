"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { FiCalendar, FiMail, FiShield, FiUser } from "react-icons/fi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});

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
        return "bg-red-500/20 text-red-300 border border-red-400/30";
      case "facilitator":
        return "bg-blue-500/20 text-blue-300 border border-blue-400/30";
      case "employee":
        return "bg-gray-500/20 text-gray-300 border border-gray-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-400/30";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-white/70 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
          User Management
        </h2>
        <p className="text-white/70 text-sm sm:text-base lg:text-lg">
          Manage user roles and document access permissions
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl backdrop-blur-sm">
          <div className="flex items-center">
            <FiShield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        </div>
      )}

      {/* Responsive user list */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <ul className="divide-y divide-white/10">
          {users.map((user) => (
            <li
              key={user.id}
              className="p-4 sm:p-6 hover:bg-white/5 transition-all duration-200"
            >
              {/* Mobile-first layout */}
              <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                {/* User info section */}
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
                      <FiUser className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-300" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                      <p className="text-base sm:text-lg font-medium text-white truncate">
                        {user.name}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 mt-1 sm:mt-0 rounded-full text-xs font-medium w-fit ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-xs sm:text-sm text-white/60">
                        <FiMail className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-white/60">
                        <FiCalendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Joined {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls section - Stack on mobile, inline on desktop */}
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-6">
                  {/* Document Access Toggle */}
                  <div className="flex items-center justify-between sm:justify-start">
                    <span className="text-xs sm:text-sm text-white/80 font-medium">
                      Document Access:
                    </span>
                    <div className="flex items-center ml-3">
                      <button
                        onClick={() =>
                          updateUserAccess(user.id, {
                            hasDocumentAccess: !user.hasDocumentAccess,
                          })
                        }
                        disabled={updating[user.id]}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg ${
                          user.hasDocumentAccess
                            ? "bg-emerald-500"
                            : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform shadow-md ${
                            user.hasDocumentAccess
                              ? "translate-x-5 sm:translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      {updating[user.id] && (
                        <div className="ml-2 animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-emerald-400"></div>
                      )}
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="flex items-center justify-between sm:justify-start">
                    <span className="text-xs sm:text-sm text-white/80 font-medium sm:mr-3">
                      Role:
                    </span>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateUserAccess(user.id, { role: e.target.value })
                      }
                      disabled={updating[user.id]}
                      className="block w-24 sm:w-auto rounded-lg bg-white/10 border border-white/20 text-white shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-0 text-xs sm:text-sm backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2"
                    >
                      <option
                        value="employee"
                        className="bg-gray-800 text-white"
                      >
                        Employee
                      </option>
                      <option
                        value="facilitator"
                        className="bg-gray-800 text-white"
                      >
                        Facilitator
                      </option>
                      <option value="admin" className="bg-gray-800 text-white">
                        Admin
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Empty state */}
      {users.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 rounded-full bg-gray-500/10 opacity-50 blur-2xl"></div>
            <FiShield className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-white/40 relative z-10" />
          </div>
          <h3 className="mt-4 text-lg sm:text-xl font-medium text-white/80">
            No users found
          </h3>
          <p className="mt-2 text-white/60 text-sm sm:text-base lg:text-lg">
            Get started by creating the first user account.
          </p>
        </div>
      )}
    </div>
  );
}
