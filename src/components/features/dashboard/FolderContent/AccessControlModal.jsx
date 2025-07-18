"use client";

import React, { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

// Professional close icon
const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function AccessControlModal({
  selectedFolder,
  onClose,
  onAccessControlSuccess,
  maxWidth = "max-w-4xl",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [existingPermissions, setExistingPermissions] = useState([]);
  const [existingUsers, setExistingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [fetchingPermissions, setFetchingPermissions] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing permissions when modal opens
  useEffect(() => {
    if (selectedFolder?.id) {
      fetchExistingPermissions();
    }
  }, [selectedFolder]);

  const fetchExistingPermissions = async () => {
    setFetchingPermissions(true);
    try {
      const response = await fetch(
        `/api/folders/${selectedFolder.id}/access-control`
      );
      const data = await response.json();

      if (data.success) {
        const userIds = data.data.allowedUserIds || [];
        setExistingPermissions(userIds);

        // Fetch user details for existing permissions
        if (userIds.length > 0) {
          await fetchUserDetails(userIds);
        }
      } else {
        setError("Failed to fetch existing permissions");
      }
    } catch (error) {
      console.error("Fetch permissions error:", error);
      setError("Failed to fetch existing permissions");
    } finally {
      setFetchingPermissions(false);
    }
  };

  const fetchUserDetails = async (userIds) => {
    try {
      const userPromises = userIds.map(async (userId) => {
        try {
          const response = await fetch(`/api/users/${userId}`);
          const data = await response.json();
          if (data.success && data.data) {
            return data.data;
          }
          return { id: userId, name: "Unknown User", email: "Unknown" };
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          return { id: userId, name: "Unknown User", email: "Unknown" };
        }
      });

      const users = await Promise.all(userPromises);
      setExistingUsers(users);
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Fallback to showing just user IDs
      setExistingUsers(
        userIds.map((id) => ({ id, name: "Unknown User", email: "Unknown" }))
      );
    }
  };

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        const data = await response.json();

        if (data.success) {
          // Filter out users who already have access
          const filteredResults = data.data.filter(
            (user) => !existingPermissions.includes(user.id)
          );
          setSearchResults(filteredResults);
        } else {
          setError("Failed to search users");
        }
      } catch (error) {
        console.error("Search error:", error);
        setError("Failed to search users");
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, existingPermissions]);

  const handleUserSelect = (user) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleRemoveExistingUser = async (userId) => {
    setLoading(true);
    setError("");

    try {
      const updatedUserIds = existingPermissions.filter((id) => id !== userId);

      const response = await fetch(
        `/api/folders/${selectedFolder.id}/access-control`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userIds: updatedUserIds,
            isRestricted: true,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setExistingPermissions(updatedUserIds);
        setSuccess("User access removed successfully!");
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(data.error || "Failed to remove user access");
      }
    } catch (error) {
      console.error("Remove user error:", error);
      setError("Failed to remove user access");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to grant access");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const newUserIds = selectedUsers.map((u) => u.id);
      const allUserIds = [...existingPermissions, ...newUserIds];

      const response = await fetch(
        `/api/folders/${selectedFolder.id}/access-control`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userIds: allUserIds,
            isRestricted: true,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setExistingPermissions(allUserIds);
        setSelectedUsers([]);
        setSuccess("Folder access control updated successfully!");
        setTimeout(() => {
          if (onAccessControlSuccess) {
            onAccessControlSuccess(data.data);
          }
          onClose();
        }, 1500);
      } else {
        setError(data.error || "Failed to update folder access control");
      }
    } catch (error) {
      console.error("Access control error:", error);
      setError("Failed to update folder access control");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError("");
  const clearSuccess = () => setSuccess("");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[95vh] overflow-hidden border border-gray-700 bg-gray-900`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Manage Folder Access
              </h2>
              <p className="text-sm text-gray-300">
                {selectedFolder?.name
                  ? `Control access to ${selectedFolder.name}`
                  : "Control access to folder"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-all duration-200 text-gray-400 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FiAlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-300 mb-2">
                    How Access Control Works
                  </h3>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>
                      • Only listed users will be able to access this folder
                    </li>
                    <li>
                      • All child folders will also be restricted automatically
                    </li>
                    <li>
                      • The folder will be hidden from other users in the
                      sidebar and content area
                    </li>
                    <li>• You can always modify access permissions later</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Existing Users with Access */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Current Users with Access ({existingPermissions.length})
              </label>
              {fetchingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
                  <span className="ml-2 text-gray-400">
                    Loading current permissions...
                  </span>
                </div>
              ) : existingPermissions.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {existingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveExistingUser(user.id)}
                        disabled={loading}
                        className="p-2 rounded hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-50"
                        title="Remove access"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">
                    No users currently have access to this folder
                  </p>
                </div>
              )}
            </div>

            {/* User Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Add New Users
              </label>
              <div className="relative">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    disabled={loading}
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.name || user.email}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Loading indicator */}
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Users to Add ({selectedUsers.length})
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.name || user.email}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUserRemove(user.id)}
                        disabled={loading}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-50"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-900/20 border border-red-800/30 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-300">Error</h3>
                    <div className="mt-2 text-sm text-red-200">{error}</div>
                    <div className="mt-3">
                      <button
                        onClick={clearError}
                        className="text-sm font-medium text-red-300 hover:text-red-200"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-md bg-green-900/20 border border-green-800/30 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-300">
                      Success
                    </h3>
                    <div className="mt-2 text-sm text-green-200">{success}</div>
                    <div className="mt-3">
                      <button
                        onClick={clearSuccess}
                        className="text-sm font-medium text-green-300 hover:text-green-200"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedUsers.length === 0 || loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2 h-4 w-4" />
                    Update Access Control
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
