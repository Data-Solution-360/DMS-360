"use client";

import { useEffect, useState } from "react";
import { AccessControlModal } from "../";
import UploadModal from "../../dashboard/DocumentsUpload/UploadModal";
import CreateFolderModal from "../../dashboard/FolderSidebar/components/CreateFolderModal";
import FolderGridContent from "./FolderGridContent";
import FolderGridEmpty from "./FolderGridEmpty";
import FolderGridHeader from "./FolderGridHeader";
import { useFolderActions } from "./hooks/useFolderActions";
import { useFolderData } from "./hooks/useFolderData";

// Temporary icon replacements
const FiFolder = () => <span>📁</span>;
const FiFileText = () => <span>📄</span>;

export default function FolderGrid({
  selectedFolder,
  onFolderSelect,
  onFolderCreated,
  expandToFolderId,
  setExpandToFolderId,
  user,
  folders: propFolders,
  onFoldersUpdate,
}) {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [sortBy, setSortBy] = useState("name"); // "name", "date", "type"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAccessControlModal, setShowAccessControlModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);

  // Custom hooks for data management
  const {
    folders,
    documents,
    loading,
    refreshing,
    fetchFolders,
    fetchDocuments,
  } = useFolderData(propFolders, selectedFolder, onFoldersUpdate);

  // Custom hooks for actions
  const {
    handleCreateFolder,
    handleUploadDocuments,
    handleUploadSuccess,
    handleFolderCreated,
    handleDeleteFolder,
    handleDeleteDocument,
  } = useFolderActions({
    selectedFolder,
    onFolderSelect,
    onFolderCreated,
    fetchFolders,
    fetchDocuments,
    setSelectedParentId,
    setShowCreateModal,
    setShowUploadModal,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to highlight a specific folder when requested
  useEffect(() => {
    if (expandToFolderId && folders.length > 0) {
      // Clear the highlight after a short delay
      setTimeout(() => {
        if (expandToFolderId) {
          setExpandToFolderId(null);
        }
      }, 3000); // Highlight for 3 seconds
    }
  }, [expandToFolderId, folders, setExpandToFolderId]);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  // Show loading state
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredFolders = getFilteredAndSortedFolders();
  const sortedDocuments = getSortedDocuments();

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <FolderGridHeader
        selectedFolder={selectedFolder}
        refreshing={refreshing}
        sortBy={sortBy}
        sortOrder={sortOrder}
        viewMode={viewMode}
        user={user}
        onRefresh={() => {
          fetchFolders();
          if (selectedFolder) {
            fetchDocuments();
          }
        }}
        onSort={handleSort}
        onViewModeChange={setViewMode}
        onCreateFolder={handleCreateFolder}
        onUploadDocuments={handleUploadDocuments}
        onAccessControl={() => setShowAccessControlModal(true)}
      />

      {/* Documents Section - Only show when a folder is selected */}
      {selectedFolder && sortedDocuments.length > 0 && (
        <FolderGridContent
          title={`Documents (${sortedDocuments.length})`}
          icon={<FiFileText className="h-5 w-5 mr-2 text-gray-500" />}
          viewMode={viewMode}
          items={sortedDocuments}
          renderGridItem={renderDocumentGridItem}
          renderListItem={renderDocumentListItem}
          onDeleteItem={handleDeleteDocument}
          user={user}
          mounted={mounted}
        />
      )}

      {/* Folders Section */}
      {filteredFolders.length > 0 ? (
        <FolderGridContent
          title={`Folders (${filteredFolders.length})`}
          icon={<FiFolder className="h-5 w-5 mr-2 text-gray-500" />}
          viewMode={viewMode}
          items={filteredFolders}
          renderGridItem={renderGridItem}
          renderListItem={renderListItem}
          onDeleteItem={handleDeleteFolder}
          user={user}
          mounted={mounted}
          selectedFolder={selectedFolder}
          expandToFolderId={expandToFolderId}
          onFolderSelect={onFolderSelect}
        />
      ) : (
        <FolderGridEmpty
          selectedFolder={selectedFolder}
          onCreateFolder={handleCreateFolder}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateFolderModal
          parentId={selectedParentId}
          onClose={() => setShowCreateModal(false)}
          onFolderCreated={handleFolderCreated}
          allFolders={folders}
        />
      )}

      {showUploadModal && (
        <UploadModal
          selectedFolder={selectedFolder}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {showAccessControlModal && (
        <AccessControlModal
          folder={selectedFolder}
          onClose={() => setShowAccessControlModal(false)}
          onPermissionsUpdated={() => {
            // Refresh folders after permissions are updated
            fetchFolders();
          }}
        />
      )}
    </div>
  );

  // Helper functions (these will be moved to separate utility files)
  function getFilteredAndSortedFolders() {
    // Filter folders based on current selection and user permissions
    let filteredFolders = folders;

    if (selectedFolder) {
      // Show subfolders of the selected folder
      filteredFolders = folders.filter(
        (folder) =>
          folder.parentId === selectedFolder.id && hasFolderAccess(folder)
      );
    } else {
      // Show root folders
      filteredFolders = folders.filter(
        (folder) =>
          (!folder.parentId || folder.parentId === null) &&
          hasFolderAccess(folder)
      );
    }

    return sortFolders(filteredFolders);
  }

  function getSortedDocuments() {
    return sortDocuments(documents);
  }

  function sortFolders(foldersToSort) {
    return [...foldersToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        case "type":
          comparison = 0;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  function sortDocuments(documentsToSort) {
    return [...documentsToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = (
            a.name ||
            a.originalName ||
            a.title ||
            a.filename ||
            ""
          ).localeCompare(
            b.name || b.originalName || b.title || b.filename || ""
          );
          break;
        case "date":
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        case "type":
          comparison = (a.mimeType || a.fileType || "").localeCompare(
            b.mimeType || b.fileType || ""
          );
          break;
        default:
          comparison = (
            a.name ||
            a.originalName ||
            a.title ||
            a.filename ||
            ""
          ).localeCompare(
            b.name || b.originalName || b.title || b.filename || ""
          );
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  function hasFolderAccess(folder) {
    if (!user) return false;
    if (user.role === "admin") return true;

    // Check if user has explicit permission for this folder
    const hasDirectPermission =
      folder.permissions?.some((perm) => {
        const permUserId = perm.userId?.toString();
        const userID = user.id?.toString();
        return permUserId === userID;
      }) || false;

    if (hasDirectPermission) return true;

    // Check for inherited permissions
    return checkInheritedPermissions(folder);
  }

  function checkInheritedPermissions(folder) {
    if (!folder || !folder.parentId) return false;

    const parentFolder = folders.find((f) => f.id === folder.parentId);
    if (!parentFolder) return false;

    const hasParentPermission =
      parentFolder.permissions?.some((perm) => {
        const permUserId = perm.userId?.toString();
        const userID = user.id?.toString();
        return permUserId === userID;
      }) || false;

    if (hasParentPermission) return true;

    return checkInheritedPermissions(parentFolder);
  }

  function renderDocumentGridItem(document) {
    const fileName =
      document.originalName ||
      document.name ||
      document.title ||
      document.filename ||
      "Untitled";
    const fileSize =
      document.size || document.fileSize
        ? `${((document.size || document.fileSize) / 1024).toFixed(1)} KB`
        : "Unknown";

    return (
      <div
        key={document.id}
        className="group relative border-2 border-gray-200 bg-white/60 backdrop-blur-sm rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-white/80 hover:shadow-lg hover:scale-105 hover:border-gray-200"
      >
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-purple-100 rounded-xl transition-all duration-300">
            <FiFileText className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-medium text-sm truncate text-gray-700 group-hover:text-blue-700 transition-colors">
            {fileName}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{fileSize}</p>
        </div>

        {mounted && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    document.firebaseStorageUrl || document.fileUrl,
                    "_blank"
                  );
                }}
                className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="View document"
              >
                <span className="text-xs">👁️</span>
              </button>
              <button
                onClick={(e) => handleDeleteDocument(e, document)}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Delete document"
              >
                <span className="text-xs">🗑️</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderDocumentListItem(document) {
    const fileName =
      document.name ||
      document.originalName ||
      document.title ||
      document.filename ||
      "Untitled";
    const fileSize =
      document.size || document.fileSize
        ? `${((document.size || document.fileSize) / 1024).toFixed(1)} KB`
        : "Unknown";

    return (
      <div
        key={document.id}
        className="group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
      >
        <FiFileText className="h-5 w-5 mr-3 text-gray-500" />

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate text-gray-700">{fileName}</h3>
          <p className="text-xs text-gray-500">{fileSize}</p>
        </div>

        {mounted && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  document.firebaseStorageUrl || document.fileUrl,
                  "_blank"
                );
              }}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
              title="View document"
            >
              <span className="text-xs">👁️</span>
            </button>
            <button
              onClick={(e) => handleDeleteDocument(e, document)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
              title="Delete document"
            >
              <span className="text-xs">🗑️</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderGridItem(folder) {
    const isSelected = selectedFolder?.id === folder.id;
    const isExpandedTo = expandToFolderId === folder.id;
    const hasChildren = folders.some((f) => f.parentId === folder.id);
    const hasAccess = hasFolderAccess(folder);

    return (
      <div
        key={folder.id}
        className={`group relative bg-white/60 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 border-2 ${
          hasAccess
            ? "cursor-pointer hover:bg-white/80 hover:shadow-lg hover:scale-105"
            : "cursor-not-allowed opacity-60"
        } ${
          isSelected
            ? "border-blue-500 bg-blue-50/80 shadow-lg"
            : hasAccess
            ? "border-transparent hover:border-gray-200"
            : "border-gray-300"
        } ${
          isExpandedTo ? "border-yellow-400 bg-yellow-50/80 animate-pulse" : ""
        }`}
        onClick={() => {
          if (hasAccess) {
            onFolderSelect(folder);
          } else {
            alert("You don't have permission to access this folder.");
          }
        }}
      >
        <div className="flex justify-center mb-3">
          <div
            className={`p-3 rounded-xl transition-all duration-300 ${
              isSelected
                ? "bg-gradient-to-r from-blue-500 to-purple-600"
                : "bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-purple-100"
            }`}
          >
            <FiFolder
              className={`h-8 w-8 ${
                isSelected ? "text-white" : "text-blue-600"
              }`}
            />
          </div>
        </div>

        <div className="text-center">
          <h3
            className={`font-medium text-sm truncate transition-colors ${
              isSelected
                ? "text-blue-700"
                : hasAccess
                ? "text-gray-700 group-hover:text-blue-700"
                : "text-gray-500"
            }`}
          >
            {folder.name}
            {!hasAccess && (
              <span className="ml-1 text-xs text-red-500">(No Access)</span>
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {hasChildren
              ? `${
                  folders.filter((f) => f.parentId === folder.id).length
                } items`
              : "Empty folder"}
          </p>
        </div>

        {mounted && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex space-x-1">
              <button
                onClick={(e) => handleDeleteFolder(e, folder)}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Delete folder"
              >
                <span className="text-xs">🗑️</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderListItem(folder) {
    const isSelected = selectedFolder?.id === folder.id;
    const isExpandedTo = expandToFolderId === folder.id;
    const hasChildren = folders.some((f) => f.parentId === folder.id);
    const hasAccess = hasFolderAccess(folder);

    return (
      <div
        key={folder.id}
        className={`group flex items-center p-3 rounded-lg transition-all duration-200 ${
          hasAccess
            ? "cursor-pointer hover:bg-gray-50"
            : "cursor-not-allowed opacity-60"
        } ${isSelected ? "bg-blue-50 border border-blue-200" : ""} ${
          isExpandedTo ? "bg-yellow-50 border border-yellow-200" : ""
        }`}
        onClick={() => {
          if (hasAccess) {
            onFolderSelect(folder);
          } else {
            alert("You don't have permission to access this folder.");
          }
        }}
      >
        <FiFolder
          className={`h-5 w-5 mr-3 ${
            isSelected ? "text-blue-600" : "text-gray-500"
          }`}
        />

        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium truncate ${
              isSelected
                ? "text-blue-700"
                : hasAccess
                ? "text-gray-700"
                : "text-gray-500"
            }`}
          >
            {folder.name}
            {!hasAccess && (
              <span className="ml-1 text-xs text-red-500">(No Access)</span>
            )}
          </h3>
          <p className="text-xs text-gray-500">
            {hasChildren
              ? `${
                  folders.filter((f) => f.parentId === folder.id).length
                } items`
              : "Empty folder"}
          </p>
        </div>

        {mounted && (
          <button
            onClick={(e) => handleDeleteFolder(e, folder)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
            title="Delete folder"
          >
            <span className="text-xs">🗑️</span>
          </button>
        )}
      </div>
    );
  }
}
