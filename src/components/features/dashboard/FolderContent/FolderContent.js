"use client";

import { useEffect, useState } from "react";
import { useApi } from "../../../../hooks/useApi";
import ContentEmpty from "./ContentEmpty";
import ContentHeader from "./ContentHeader";
import DocumentCard from "./ContentItems/DocumentCard";
import DocumentList from "./ContentItems/DocumentList";
import FolderCard from "./ContentItems/FolderCard";
import FolderList from "./ContentItems/FolderList";
import ContentToolbar from "./ContentToolbar";
import UploadModal from "./UploadModal";
import { useFolderActions } from "./hooks/useFolderActions";
import { useFolderData } from "./hooks/useFolderData";

export default function FolderContent({ currentFolder, onFolderNavigation }) {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  // Combine and sort all items (documents and folders)
  const getAllItems = () => {
    const allItems = [
      ...documents.map((doc) => ({ ...doc, type: "document" })),
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
  const totalItems = documents.length + folders.length;

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
                    key={item._id}
                    document={item}
                    onAction={handleDocumentAction}
                  />
                ) : (
                  <DocumentList
                    key={item._id}
                    document={item}
                    onAction={handleDocumentAction}
                  />
                );
              } else {
                return viewMode === "grid" ? (
                  <FolderCard
                    key={item._id}
                    folder={item}
                    stats={folderStats[item._id] || folderStats}
                    onDoubleClick={handleFolderDoubleClick}
                  />
                ) : (
                  <FolderList
                    key={item._id}
                    folder={item}
                    stats={folderStats[item._id]}
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
    </>
  );
}
