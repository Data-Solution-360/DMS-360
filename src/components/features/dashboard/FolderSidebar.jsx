"use client";

import { useState } from "react";
import { useApi } from "../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../lib/constants";

// Temporary icon replacements
const FiFolder = () => <span>📁</span>;
const FiFolderPlus = () => <span>📁➕</span>;
const FiChevronRight = () => <span>▶️</span>;
const FiChevronDown = () => <span>🔽</span>;
const FiX = () => <span>✕</span>;

export default function FolderSidebar({
  folders = [],
  onFolderSelect,
  selectedFolderId,
  onFolderCreated,
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [creating, setCreating] = useState(false);
  const { apiCall } = useApi();

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Function to find a folder by ID in the nested structure
  const findFolderById = (folders, targetId) => {
    for (const folder of folders) {
      if (folder.id === targetId) {
        return folder;
      }
      if (folder.children && folder.children.length > 0) {
        const found = findFolderById(folder.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Function to get the path to a folder (array of parent IDs)
  const getFolderPath = (folders, targetId, path = []) => {
    for (const folder of folders) {
      const currentPath = [...path, folder.id];
      if (folder.id === targetId) {
        return currentPath;
      }
      if (folder.children && folder.children.length > 0) {
        const found = getFolderPath(folder.children, targetId, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  // Function to expand all parent folders of a selected folder
  const expandParentFolders = (folderId) => {
    const path = getFolderPath(folders, folderId);
    if (path) {
      const newExpanded = new Set(expandedFolders);
      // Add all parent folders to expanded set (excluding the selected folder itself)
      path.slice(0, -1).forEach((parentId) => {
        newExpanded.add(parentId);
      });
      setExpandedFolders(newExpanded);
    }
  };

  // Enhanced folder selection that auto-expands parents
  const handleFolderSelect = (folder) => {
    onFolderSelect(folder);
    expandParentFolders(folder.id);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Please enter a folder name");
      return;
    }

    setCreating(true);
    try {
      const response = await apiCall(API_ENDPOINTS.FOLDERS.BASE, {
        method: "POST",
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: selectedParentId,
        }),
      });

      if (response.success) {
        // Reset form
        setNewFolderName("");
        setSelectedParentId(null);
        setIsCreatingFolder(false);

        // Notify parent component to refresh folders
        if (onFolderCreated) {
          onFolderCreated();
        }
      }
    } catch (error) {
      console.error("Create folder error:", error);
      alert(error.message || "Failed to create folder");
    } finally {
      setCreating(false);
    }
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id} className="space-y-1">
        <div
          className={`group relative flex items-center px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 transform ${
            isSelected
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 shadow-emerald-500/25"
              : "hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 border border-transparent hover:border-white/20"
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => handleFolderSelect(folder)}
        >
          {/* Animated background gradient */}
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              isSelected ? "opacity-100" : ""
            }`}
          ></div>

          {/* Glowing border effect */}
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${
              isSelected ? "opacity-20" : ""
            }`}
          ></div>

          <div className="relative z-10 flex items-center w-full">
            {/* Expand/Collapse button */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="mr-2 p-1 rounded-lg hover:bg-white/10 transition-all duration-200 group-hover:scale-110"
              >
                {isExpanded ? (
                  <FiChevronDown className="h-3 w-3 text-emerald-300 group-hover:text-emerald-200 transition-colors" />
                ) : (
                  <FiChevronRight className="h-3 w-3 text-emerald-300 group-hover:text-emerald-200 transition-colors" />
                )}
              </button>
            )}

            {/* Folder icon */}
            <div
              className={`w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3 shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3 ${
                isSelected ? "shadow-emerald-500/50" : ""
              }`}
            >
              <FiFolder className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* Folder name */}
            <span
              className={`flex-1 text-sm font-medium transition-all duration-300 ${
                isSelected
                  ? "text-emerald-200 font-semibold"
                  : "text-white/80 group-hover:text-white group-hover:font-semibold"
              }`}
            >
              {folder.name}
            </span>

            {/* Document count */}
            {folder.documentCount > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${
                  isSelected
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50"
                    : "bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white/80"
                }`}
              >
                {folder.documentCount}
              </span>
            )}

            {/* Child count indicator */}
            {hasChildren && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ml-2 transition-all duration-300 ${
                  isSelected
                    ? "bg-blue-500/30 text-blue-200 border border-blue-500/50"
                    : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300"
                }`}
              >
                {folder.children.length}
              </span>
            )}
          </div>

          {/* Floating particles */}
          <div className="absolute top-2 right-2 w-1 h-1 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="ml-4 space-y-1">
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderFolderOption = (folder, level = 0) => {
    const isSelected = selectedParentId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id} className="space-y-1">
        <div
          className={`group relative flex items-center px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 ${
            isSelected
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
              : "hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 border border-transparent hover:border-white/20"
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => setSelectedParentId(folder.id)}
        >
          <div className="relative z-10 flex items-center w-full">
            {/* Folder icon */}
            <div
              className={`w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3 shadow-lg ${
                isSelected ? "shadow-emerald-500/50" : ""
              }`}
            >
              <FiFolder className="h-3 w-3 text-white" />
            </div>

            {/* Folder name */}
            <span
              className={`flex-1 text-sm font-medium transition-all duration-300 ${
                isSelected
                  ? "text-emerald-200 font-semibold"
                  : "text-white/80 group-hover:text-white"
              }`}
            >
              {folder.name}
            </span>

            {/* Document count */}
            {folder.documentCount > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  isSelected
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {folder.documentCount}
              </span>
            )}

            {/* Child count indicator */}
            {hasChildren && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ml-2 ${
                  isSelected
                    ? "bg-blue-500/30 text-blue-200 border border-blue-500/50"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                {folder.children.length}
              </span>
            )}
          </div>
        </div>

        {/* Render children */}
        {hasChildren && (
          <div className="ml-4 space-y-1">
            {folder.children.map((child) =>
              renderFolderOption(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
          📁 Folders
        </h3>
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="group p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-emerald-500/50"
        >
          <FiFolderPlus className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>

      {/* Folder list */}
      <div className="space-y-2 max-h-96 folder-sidebar-scrollbar">
        {folders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiFolder className="h-8 w-8 text-emerald-300" />
            </div>
            <p className="text-white/60 text-sm">No folders yet</p>
            <p className="text-white/40 text-xs mt-1">
              Create your first folder to get started
            </p>
          </div>
        ) : (
          folders.map((folder) => renderFolder(folder))
        )}
      </div>

      {/* Create folder modal */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Create New Folder
              </h3>
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                  setSelectedParentId(null);
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Parent Folder Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                Parent Folder (Optional)
              </label>
              <div className="bg-white/5 rounded-xl p-3 max-h-32 overflow-y-auto">
                <div
                  className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedParentId === null
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                      : "hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
                  }`}
                  onClick={() => setSelectedParentId(null)}
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mr-3">
                    <FiFolder className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-white/80">Root Level</span>
                </div>
                {folders.map((folder) => renderFolderOption(folder))}
              </div>

              {/* Selected parent path display */}
              {selectedParentId &&
                (() => {
                  const selectedFolder = findFolderById(
                    folders,
                    selectedParentId
                  );
                  const path = getFolderPath(folders, selectedParentId);
                  return (
                    <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="text-xs text-emerald-300 font-medium mb-1">
                        Selected Parent:
                      </div>
                      <div className="text-sm text-white/90">
                        {path
                          ? path.map((id, index) => {
                              const folder = findFolderById(folders, id);
                              return (
                                <span key={id}>
                                  {folder?.name || "Unknown"}
                                  {index < path.length - 1 && (
                                    <span className="text-emerald-400 mx-1">
                                      /
                                    </span>
                                  )}
                                </span>
                              );
                            })
                          : "Unknown"}
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* Folder Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                Folder Name *
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                  setSelectedParentId(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || creating}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Folder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
