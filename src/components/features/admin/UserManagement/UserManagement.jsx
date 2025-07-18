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
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          User Management
        </h2>
        <p className="text-white/70 text-lg">
          Manage user roles and document access permissions
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-400/30 text-red-300 px-6 py-4 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center">
            <FiShield className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <ul className="divide-y divide-white/10">
          {users.map((user) => (
            <li
              key={user.id}
              className="px-6 py-6 hover:bg-white/5 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
                      <FiUser className="h-6 w-6 text-emerald-300" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center mb-2">
                      <p className="text-lg font-medium text-white">
                        {user.name}
                      </p>
                      <span
                        className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-white/60 mb-1">
                      <FiMail className="mr-2 h-4 w-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center text-sm text-white/60">
                      <FiCalendar className="mr-2 h-4 w-4" />
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Document Access Toggle */}
                  <div className="flex items-center">
                    <span className="text-sm text-white/80 mr-3 font-medium">
                      Document Access:
                    </span>
                    <button
                      onClick={() =>
                        updateUserAccess(user.id, {
                          hasDocumentAccess: !user.hasDocumentAccess,
                        })
                      }
                      disabled={updating[user.id]}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg ${
                        user.hasDocumentAccess
                          ? "bg-emerald-500"
                          : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                          user.hasDocumentAccess
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    {updating[user.id] && (
                      <div className="ml-3 animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="flex items-center">
                    <span className="text-sm text-white/80 mr-3 font-medium">
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
                      className="block w-full rounded-lg bg-white/10 border border-white/20 text-white shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-0 sm:text-sm backdrop-blur-sm px-3 py-2"
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

      {users.length === 0 && (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-gray-500/10 opacity-50 blur-2xl"></div>
            <FiShield className="mx-auto h-16 w-16 text-white/40 relative z-10" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-white/80">
            No users found
          </h3>
          <p className="mt-2 text-white/60 text-lg">
            Get started by creating the first user account.
          </p>
        </div>
      )}
    </div>
  );
}
