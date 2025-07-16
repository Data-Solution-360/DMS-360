"use client";

import { useEffect, useState } from "react";

// Temporary icon replacements
const FiX = () => <span>✕</span>;
const FiSearch = () => <span>🔍</span>;
const FiUser = () => <span>👤</span>;
const FiShield = () => <span>🛡️</span>;
const FiCheck = () => <span>✅</span>;
const FiXCircle = () => <span>❌</span>;

export default function AccessControlModal({
  folder,
  onClose,
  onPermissionsUpdated,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (folder) {
      fetchCurrentPermissions();
    }
  }, [folder]);

  const fetchCurrentPermissions = async () => {
    try {
      const response = await fetch(`/api/folders/${folder._id}/permissions`);
      if (response.ok) {
        const data = await response.json();
        setCurrentPermissions(data.permissions || []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsers();
  };

  const grantAccess = async (userId) => {
    setUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(`/api/folders/${folder._id}/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action: "grant",
        }),
      });

      if (response.ok) {
        await fetchCurrentPermissions();
        if (onPermissionsUpdated) {
          onPermissionsUpdated();
        }
      }
    } catch (error) {
      console.error("Error granting access:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const revokeAccess = async (userId) => {
    setUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(`/api/folders/${folder._id}/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action: "revoke",
        }),
      });

      if (response.ok) {
        await fetchCurrentPermissions();
        if (onPermissionsUpdated) {
          onPermissionsUpdated();
        }
      }
    } catch (error) {
      console.error("Error revoking access:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const hasAccess = (userId) => {
    return currentPermissions.some((perm) => perm.userId === userId);
  };

  const filteredSearchResults = searchResults.filter(
    (user) => !currentPermissions.some((perm) => perm.userId === user._id)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiShield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Access Control
              </h2>
              <p className="text-sm text-gray-500">
                Manage permissions for "{folder?.name}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Search Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Search Users</h3>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email or name..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            {/* Search Results */}
            {filteredSearchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Search Results
                </h4>
                <div className="space-y-2">
                  {filteredSearchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-200 rounded-full">
                          <FiUser className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => grantAccess(user._id)}
                        disabled={updating[user._id]}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {updating[user._id] ? "Granting..." : "Grant Access"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Current Permissions
            </h3>
            {currentPermissions.length > 0 ? (
              <div className="space-y-2">
                {currentPermissions.map((permission) => (
                  <div
                    key={permission.userId}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-200 rounded-full">
                        <FiUser className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {permission.userName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {permission.userEmail}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => revokeAccess(permission.userId)}
                      disabled={updating[permission.userId]}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {updating[permission.userId]
                        ? "Revoking..."
                        : "Revoke Access"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiShield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No users have access to this folder yet.</p>
                <p className="text-sm">
                  Search for users above to grant access.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
