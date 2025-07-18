"use client";

import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../../../hooks/useApi";
import UploadModal from "../DocumentsUpload/UploadModal";
import AccessControlModal from "./AccessControlModal";
import ContentEmpty from "./ContentEmpty";
import ContentHeader from "./ContentHeader";
import DocumentCard from "./ContentItems/DocumentCard";
import DocumentList from "./ContentItems/DocumentList";
import FolderCard from "./ContentItems/FolderCard";
import FolderList from "./ContentItems/FolderList";
import ContentToolbar from "./ContentToolbar";
import { useFolderActions } from "./hooks/useFolderActions";
import { useFolderData } from "./hooks/useFolderData";

export default function FolderContent({ currentFolder, onFolderNavigation }) {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAccessControlModal, setShowAccessControlModal] = useState(false);
  const { apiCall } = useApi();

  const {
    documents,
    folders,
    loading,
    currentPath,
    folderStats,
    fetchContent,
    updateCurrentPath,
  } = useFolderData(currentFolder, apiCall);

  const {
    navigateToFolder,
    navigateBack,
    handleDocumentAction,
    handleFolderDoubleClick,
    handleUploadSuccess,
  } = useFolderActions(currentFolder, onFolderNavigation, fetchContent);

  // Fetch content when current folder changes
  useEffect(() => {
    fetchContent();
  }, [currentFolder, apiCall]);

  // Group documents by originalDocumentId and select only the latest version for each group
  const latestDocuments = useMemo(() => {
    if (!documents || documents.length === 0) {
      return [];
    }

    const groups = {};

    documents.forEach((doc) => {
      // Use originalDocumentId if available, otherwise use the document id itself
      const key = doc.originalDocumentId || doc.id;

      // If no document exists in this group yet, add this one
      if (!groups[key]) {
        groups[key] = doc;
        return;
      }

      // If this document is marked as latest, use it
      if (doc.isLatestVersion) {
        groups[key] = doc;
        return;
      }

      // If the existing document is not latest but this one is, use this one
      if (!groups[key].isLatestVersion && doc.isLatestVersion) {
        groups[key] = doc;
        return;
      }

      // If neither is marked as latest, compare versions
      const currentVersion = parseInt(doc.version) || 1;
      const existingVersion = parseInt(groups[key].version) || 1;

      if (currentVersion > existingVersion) {
        groups[key] = doc;
      }
    });

    return Object.values(groups);
  }, [documents]);

  const handleUpload = () => {
    if (!currentFolder) {
      alert("Please select a folder first to upload documents.");
      return;
    }
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleMakePrivate = () => {
    if (!currentFolder) {
      alert("Please select a folder first to make it private.");
      return;
    }
    setShowAccessControlModal(true);
  };

  const handleCloseAccessControlModal = () => {
    setShowAccessControlModal(false);
  };

  const handleAccessControlSuccess = (updatedFolder) => {
    // Refresh the content to reflect the changes
    fetchContent();
    // You might also want to update the parent component about the folder change
    if (onFolderNavigation) {
      onFolderNavigation(updatedFolder);
    }
  };

  // Combine and sort all items (documents and folders)
  const getAllItems = () => {
    const allItems = [
      ...latestDocuments.map((doc) => ({ ...doc, type: "document" })),
      ...folders.map((folder) => ({ ...folder, type: "folder" })),
    ];

    // Sort by name (case-insensitive)
    return allItems.sort((a, b) => {
      const nameA = a.name || a.originalName || "";
      const nameB = b.name || b.originalName || "";
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });
  };

  // Filter items based on search query and filter type
  const getFilteredItems = () => {
    let items = getAllItems();

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const name = item.name || item.originalName || "";
        return name.toLowerCase().includes(query);
      });
    }

    // Apply type filter
    if (filterType === "documents") {
      items = items.filter((item) => item.type === "document");
    } else if (filterType === "folders") {
      items = items.filter((item) => item.type === "folder");
    }

    return items;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <p className="text-white/70 text-lg">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const totalItems = latestDocuments.length + folders.length;

  return (
    <>
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl">
        {/* Header with Breadcrumb */}
        <ContentHeader
          currentFolder={currentFolder}
          currentPath={currentPath}
          totalItems={totalItems}
          onNavigateBack={navigateBack}
          onNavigateToFolder={navigateToFolder}
          onUpload={handleUpload}
          onMakePrivate={handleMakePrivate}
        />

        {/* Toolbar */}
        <ContentToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Content */}
        {!currentFolder ? (
          <ContentEmpty type="select" onUpload={handleUpload} />
        ) : totalItems === 0 ? (
          <ContentEmpty type="empty" onUpload={handleUpload} />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-3"
            }
          >
            {/* Show all items mixed together */}
            {filteredItems.map((item) => {
              if (item.type === "document") {
                return viewMode === "grid" ? (
                  <DocumentCard
                    key={item.id}
                    document={item}
                    onAction={handleDocumentAction}
                    onVersionChange={fetchContent}
                  />
                ) : (
                  <DocumentList
                    key={item.id}
                    document={item}
                    onAction={handleDocumentAction}
                    onVersionChange={fetchContent}
                  />
                );
              } else {
                return viewMode === "grid" ? (
                  <FolderCard
                    key={item.id}
                    folder={item}
                    stats={folderStats[item.id] || folderStats}
                    onDoubleClick={handleFolderDoubleClick}
                  />
                ) : (
                  <FolderList
                    key={item.id}
                    folder={item}
                    stats={folderStats[item.id]}
                    onDoubleClick={handleFolderDoubleClick}
                  />
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          selectedFolder={currentFolder}
          onClose={handleCloseUploadModal}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Access Control Modal */}
      {showAccessControlModal && (
        <AccessControlModal
          selectedFolder={currentFolder}
          onClose={handleCloseAccessControlModal}
          onAccessControlSuccess={handleAccessControlSuccess}
        />
      )}
    </>
  );
}
