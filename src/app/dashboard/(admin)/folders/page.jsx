"use client";

import ContentEmpty from "@/components/features/dashboard/FolderContent/ContentEmpty";
import FolderCard from "@/components/features/dashboard/FolderContent/ContentItems/FolderCard";
import FolderList from "@/components/features/dashboard/FolderContent/ContentItems/FolderList";
import ContentToolbar from "@/components/features/dashboard/FolderContent/ContentToolbar";
import { useFolderNavigation } from "@/components/features/dashboard/FolderContent/hooks/useFolderNavigation";
import { ChevronRight, Folder, Home } from "lucide-react";
import { useState } from "react";

export default function FolderListPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const {
    folders,
    loading,
    error,
    currentPath,
    currentFolder,
    folderStats,
    navigateToFolder,
    navigateBack,
    navigateToPath,
    navigateToRoot,
    refetch,
  } = useFolderNavigation();

  // Filter folders based on search query
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFolderDoubleClick = (folder) => {
    navigateToFolder(folder);
  };

  const handleBreadcrumbClick = (index) => {
    navigateToPath(index);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Folder className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Folder List</h1>
            <p className="text-gray-600">
              Organize and manage document folders and structure.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading folders...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Folder className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Folder List</h1>
            <p className="text-gray-600">
              Organize and manage document folders and structure.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Folder className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Folder List</h1>
          <p className="text-gray-600">
            Organize and manage document folders and structure.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <button
            onClick={navigateToRoot}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Root</span>
          </button>

          {currentPath.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
              >
                {folder.name}
              </button>
            </div>
          ))}

          {currentPath.length > 0 && (
            <button
              onClick={navigateBack}
              className="ml-auto px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          )}
        </div>

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
        {filteredFolders.length === 0 ? (
          <ContentEmpty
            type="empty_folder_list"
            onUpload={() => {}}
            message={
              searchQuery
                ? "No folders found matching your search."
                : currentFolder
                ? "This folder is empty."
                : "No root folders available."
            }
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "space-y-3"
            }
          >
            {filteredFolders.map((folder) =>
              viewMode === "grid" ? (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  stats={
                    folderStats[folder.id] || {
                      documents: 0,
                      subfolders: 0,
                      total: 0,
                    }
                  }
                  onDoubleClick={handleFolderDoubleClick}
                />
              ) : (
                <FolderList
                  key={folder.id}
                  folder={folder}
                  stats={
                    folderStats[folder.id] || {
                      documents: 0,
                      subfolders: 0,
                      total: 0,
                    }
                  }
                  onDoubleClick={handleFolderDoubleClick}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
