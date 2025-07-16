"use client";

import { useEffect, useState } from "react";
// Temporary icon replacements
const FiFolder = () => <span>📁</span>;
const FiX = () => <span>✕</span>;

export default function CreateFolderModal({
  parentId,
  onClose,
  onFolderCreated,
  allFolders = [],
}) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [parentFolder, setParentFolder] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Find parent folder info if parentId is provided
    if (parentId && allFolders.length > 0) {
      const parent = allFolders.find((f) => f._id === parentId);
      setParentFolder(parent);
    }
  }, [parentId, allFolders]);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Please enter a folder name");
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post("/api/folders", {
        name: name.trim(),
        parentId: parentId || null,
      });

      if (response.data.success) {
        alert("Folder created successfully!");
        onFolderCreated();
        onClose();
      }
    } catch (error) {
      console.error("Create folder error:", error);
      alert(error.response?.data?.error || "Failed to create folder");
    } finally {
      setCreating(false);
    }
  };

  const getModalTitle = () => {
    if (parentId && parentFolder) {
      return `Create Subfolder in "${parentFolder.name}"`;
    }
    return "Create New Folder";
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {getModalTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Parent Folder Info */}
          {parentId && parentFolder && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-gray-600">
                <FiFolder className="h-4 w-4 mr-2 text-blue-500" />
                <span>Parent: {parentFolder.path}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Level: {parentFolder.level} • New folder will be at level{" "}
                {parentFolder.level + 1}
              </div>
            </div>
          )}

          {/* Folder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folder Name *
            </label>
            <div className="relative">
              <FiFolder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name..."
                className="input-field pl-10"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The folder will be created at:{" "}
              {parentFolder
                ? `${parentFolder.path}/${name.trim()}`
                : name.trim()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="btn-primary"
            >
              {creating ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
