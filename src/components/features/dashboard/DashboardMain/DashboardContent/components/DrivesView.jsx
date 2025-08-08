"use client";

import { useState } from "react";
import ContentHeader from "../../../FolderContent/ContentHeader";
import ContentToolbar from "../../../FolderContent/ContentToolbar";
import DriveCard from "./DriveCard";

export default function DrivesView({
  rootFolders,
  onFolderSelect,
  breadcrumbPath,
  onNavigateBack,
  onNavigateToFolder,
}) {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Filter root folders based on search query
  const getFilteredRootFolders = () => {
    let filtered = rootFolders;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((folder) => {
        const name = folder.name || "";
        const description = folder.description || "";
        return (
          name.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query)
        );
      });
    }

    // Apply type filter (for drives view, we only have folders)
    if (filterType === "documents") {
      filtered = filtered.filter((folder) => folder.documentCount > 0);
    }

    return filtered;
  };

  const handleUpload = () => {
    console.log("Create new drive");
  };

  const handleMakePrivate = () => {
    console.log("Make drive private");
  };

  const handleFolderDoubleClick = (folder) => {
    onFolderSelect(folder);
  };

  const filteredFolders = getFilteredRootFolders();

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      {/* Content Header for Drives View */}
      <ContentHeader
        currentFolder={null}
        currentPath={breadcrumbPath}
        totalItems={rootFolders.length}
        onNavigateBack={onNavigateBack}
        onNavigateToFolder={onNavigateToFolder}
        onUpload={handleUpload}
        onMakePrivate={handleMakePrivate}
      />

      {/* Content Toolbar for Drives View */}
      <ContentToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Drives Grid/List */}
      {filteredFolders.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-3"
          }
        >
          {filteredFolders.map((folder) => (
            <DriveCard
              key={folder.id}
              folder={folder}
              onDoubleClick={handleFolderDoubleClick}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📁</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery.trim() ? "No drives found" : "No drives available"}
          </h3>
          <p className="text-gray-600">
            {searchQuery.trim()
              ? "Try adjusting your search terms"
              : "Contact your administrator to create folders"}
          </p>
        </div>
      )}
    </div>
  );
}
