"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import CreateFolderModal from "./CreateFolderModal";
// Temporary icon replacements
const FiChevronDown = () => <span>▼</span>;
const FiChevronRight = () => <span>▶</span>;
const FiFolder = () => <span>📁</span>;
const FiGrid = () => <span>⊞</span>;
const FiList = () => <span>☰</span>;
const FiPlus = () => <span>➕</span>;
const FiRefreshCw = () => <span>🔄</span>;
const FiTrash2 = () => <span>🗑️</span>;

export default function FolderTree({
  selectedFolder,
  onFolderSelect,
  onFolderCreated,
  expandToFolderId,
  setExpandToFolderId,
  folders: propFolders,
  onFoldersUpdate,
}) {
  const [folders, setFolders] = useState(propFolders || []);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "board"
  const [expandedRootFolder, setExpandedRootFolder] = useState(null); // Track which root folder is expanded in board view
  const [expandedFoldersBoard, setExpandedFoldersBoard] = useState(new Set()); // Track all expanded folders in board view

  // Update local folders state when propFolders changes
  useEffect(() => {
    if (propFolders) {
      setFolders(propFolders);
    }
  }, [propFolders]);

  useEffect(() => {
    setMounted(true);
    if (propFolders) {
      setFolders(propFolders);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [propFolders]);

  // Effect to expand to a specific folder when requested
  useEffect(() => {
    if (expandToFolderId && folders.length > 0) {
      expandToFolderPath(expandToFolderId);

      // Clear the highlight after a short delay
      setTimeout(() => {
        if (expandToFolderId) {
          // This will trigger a re-render without the highlight
          setExpandToFolderId(null);
        }
      }, 3000); // Highlight for 3 seconds
    }
  }, [expandToFolderId, folders]);

  const fetchFolders = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get("/api/folders");

      if (response.data.success) {
        console.log(
          "Frontend: Received folders:",
          response.data.data.map((f) => ({
            name: f.name,
            _id: f._id,
            parentId: f.parentId,
            level: f.level,
          }))
        );
        setFolders(response.data.data);
        // Notify parent component about the update
        if (onFoldersUpdate) {
          onFoldersUpdate(response.data.data);
        }
      } else {
        console.error("API returned error:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const expandToFolderPath = (targetFolderId) => {
    const targetFolder = folders.find((f) => f._id === targetFolderId);
    if (!targetFolder) return;

    const newExpanded = new Set(expandedFolders);

    // Expand all parent folders to make the target folder visible
    let currentFolder = targetFolder;
    while (currentFolder.parentId) {
      newExpanded.add(currentFolder.parentId);
      currentFolder = folders.find((f) => f._id === currentFolder.parentId);
      if (!currentFolder) break;
    }

    setExpandedFolders(newExpanded);

    // Also select the target folder
    onFolderSelect(targetFolder);
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateSubfolder = (e, parentId) => {
    e.stopPropagation();
    setSelectedParentId(parentId);
    setShowCreateModal(true);
  };

  const handleFolderCreated = async () => {
    // Wait a moment for the database to update
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Refresh the folder list
    await fetchFolders();

    // If a subfolder was created, expand the parent folder
    if (selectedParentId) {
      const newExpanded = new Set(expandedFolders);
      newExpanded.add(selectedParentId);
      setExpandedFolders(newExpanded);
    }

    if (onFolderCreated) {
      onFolderCreated();
    }
  };

  const handleDeleteFolder = async (e, folder) => {
    e.stopPropagation();

    const confirmMessage = `Are you sure you want to delete the folder "${folder.name}"?\n\nThis action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await axios.delete(
        `/api/folders?folderId=${folder._id}`
      );

      if (response.data.success) {
        // Remove from expanded folders if it was expanded
        const newExpanded = new Set(expandedFolders);
        newExpanded.delete(folder._id);
        setExpandedFolders(newExpanded);

        // Clear expanded root folder if it was deleted
        if (expandedRootFolder === folder._id) {
          setExpandedRootFolder(null);
        }

        // Clear from board expanded folders
        const newBoardExpanded = new Set(expandedFoldersBoard);
        newBoardExpanded.delete(folder._id);
        setExpandedFoldersBoard(newBoardExpanded);

        // Refresh the folder list
        await fetchFolders();

        // Clear selection if the deleted folder was selected
        if (selectedFolder?._id === folder._id) {
          onFolderSelect(null);
        }
      } else {
        alert(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to delete folder";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleRootFolderDoubleClick = (folder) => {
    // Toggle expanded state for root folder in board view
    if (expandedRootFolder === folder._id) {
      setExpandedRootFolder(null); // Collapse
      // Also collapse all its subfolders
      const newExpanded = new Set(expandedFoldersBoard);
      newExpanded.delete(folder._id);
      // Remove all subfolders of this folder
      folders.forEach((f) => {
        if (f.parentId && f.parentId.toString() === folder._id.toString()) {
          newExpanded.delete(f._id);
        }
      });
      setExpandedFoldersBoard(newExpanded);
    } else {
      setExpandedRootFolder(folder._id); // Expand this folder
      const newExpanded = new Set(expandedFoldersBoard);
      newExpanded.add(folder._id);
      setExpandedFoldersBoard(newExpanded);
    }
  };

  const handleFolderDoubleClick = (folder) => {
    // Toggle expanded state for any folder in board view
    const newExpanded = new Set(expandedFoldersBoard);

    if (newExpanded.has(folder._id)) {
      // Collapse this folder and all its subfolders
      newExpanded.delete(folder._id);
      // Remove all subfolders of this folder
      folders.forEach((f) => {
        if (f.parentId && f.parentId.toString() === folder._id.toString()) {
          newExpanded.delete(f._id);
        }
      });
    } else {
      // Expand this folder
      newExpanded.add(folder._id);
    }

    setExpandedFoldersBoard(newExpanded);
  };

  const renderFolderBoardRecursive = (folder, level = 0) => {
    const isSelected = selectedFolder?._id === folder._id;
    const isExpandedTo = expandToFolderId === folder._id;
    const isExpanded = expandedFoldersBoard.has(folder._id);
    const hasChildren = folders.some((f) => {
      const childParentId = f.parentId ? f.parentId.toString() : null;
      return childParentId === folder._id.toString();
    });

    // Find parent folder name for subfolders
    const parentFolder = folder.parentId
      ? folders.find((f) => f._id.toString() === folder.parentId.toString())
      : null;

    // Check if this is a root folder that can be expanded
    const isRootFolder = !folder.parentId || folder.parentId === null;
    const isExpandedRoot = expandedRootFolder === folder._id;

    // Get subfolders of this folder
    const subfolders = folders
      .filter((f) => {
        const childParentId = f.parentId ? f.parentId.toString() : null;
        return childParentId === folder._id.toString();
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div key={folder._id}>
        <div
          onDoubleClick={() =>
            isRootFolder
              ? handleRootFolderDoubleClick(folder)
              : handleFolderDoubleClick(folder)
          }
          className="cursor-pointer"
        >
          <div
            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              isSelected
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            } ${isExpandedTo ? "border-yellow-400 bg-yellow-50" : ""} ${
              isExpandedRoot ? "border-blue-400 bg-blue-50" : ""
            }`}
            onClick={() => onFolderSelect(folder)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FiFolder className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-sm truncate">
                  {folder.name}
                </span>
                {hasChildren && (
                  <span className="text-xs text-gray-400">
                    {isExpanded ? "(expanded)" : "(double-click to expand)"}
                  </span>
                )}
              </div>

              {mounted && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleCreateSubfolder(e, folder._id)}
                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                    title="Create subfolder"
                  >
                    <FiPlus className="h-3 w-3" />
                  </button>

                  <button
                    onClick={(e) => handleDeleteFolder(e, folder)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                    title="Delete folder"
                  >
                    <FiTrash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div>Level: {folder.level}</div>
              {parentFolder && (
                <div className="text-blue-600">Parent: {parentFolder.name}</div>
              )}
              {hasChildren && (
                <div className="text-green-600">
                  Contains {subfolders.length} subfolder
                  {subfolders.length !== 1 ? "s" : ""}
                </div>
              )}
              {!hasChildren && (
                <div className="text-gray-400">No subfolders</div>
              )}
            </div>
          </div>
        </div>

        {/* Recursively render subfolders if expanded */}
        {isExpanded && hasChildren && (
          <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Subfolders of "{folder.name}" (Level {level + 1})
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {subfolders.map((subfolder) =>
                renderFolderBoardRecursive(subfolder, level + 1)
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFolderList = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id);
    const isSelected = selectedFolder?._id === folder._id;
    const isExpandedTo = expandToFolderId === folder._id;

    // Convert both IDs to strings for comparison to handle ObjectId vs String mismatch
    const folderIdString = folder._id.toString();
    const hasChildren = folders.some((f) => {
      const childParentId = f.parentId ? f.parentId.toString() : null;
      return childParentId === folderIdString;
    });

    const maxLevel = 10; // Visual limit for indentation, but no functional limit

    return (
      <div key={folder._id}>
        <div
          className={`group flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? "bg-primary-100 text-primary-700" : ""
          } ${isExpandedTo ? "bg-yellow-50 border border-yellow-200" : ""}`}
          style={{
            paddingLeft: `${Math.min(level * 16 + 8, maxLevel * 16 + 8)}px`,
          }}
          onClick={() => onFolderSelect(folder)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder._id);
              }}
              className="mr-1 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <FiChevronDown className="h-4 w-4" />
              ) : (
                <FiChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5 mr-1" />}

          <FiFolder className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-sm truncate flex-1">{folder.name}</span>

          {/* Action buttons - only show on hover and after mount */}
          {mounted && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleCreateSubfolder(e, folder._id)}
                className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                title="Create subfolder"
              >
                <FiPlus className="h-3 w-3" />
              </button>

              <button
                onClick={(e) => handleDeleteFolder(e, folder)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                title="Delete folder"
              >
                <FiTrash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div>
            {folders
              .filter((f) => {
                const childParentId = f.parentId ? f.parentId.toString() : null;
                return childParentId === folderIdString;
              })
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
              .map((childFolder) => renderFolderList(childFolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Show loading state during initial render to prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header with Refresh and View Toggle */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={fetchFolders}
          disabled={refreshing}
          className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
          title="Refresh folders"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1 rounded transition-colors ${
              viewMode === "list"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="List view"
          >
            <FiList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={`p-1 rounded transition-colors ${
              viewMode === "board"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="Board view"
          >
            <FiGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Folder Content */}
      {viewMode === "board" ? (
        // Board View - Grid Layout
        <div className="space-y-4">
          {/* Root Level Folders */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Root Folders
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {folders
                .filter(
                  (folder) => !folder.parentId || folder.parentId === null
                )
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((folder) => (
                  <div key={folder._id}>
                    <div
                      onDoubleClick={() => handleRootFolderDoubleClick(folder)}
                      className="cursor-pointer"
                    >
                      {renderFolderBoardRecursive(folder)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        // List View - Hierarchical Layout
        <div className="space-y-1">
          {folders
            .filter((folder) => !folder.parentId || folder.parentId === null)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((folder) => renderFolderList(folder))}
        </div>
      )}

      {folders.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <FiFolder className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No folders yet</p>
        </div>
      )}

      {/* Create Subfolder Modal */}
      {showCreateModal && (
        <CreateFolderModal
          parentId={selectedParentId}
          onClose={() => setShowCreateModal(false)}
          onFolderCreated={handleFolderCreated}
          allFolders={folders}
        />
      )}
    </div>
  );
}
