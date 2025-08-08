"use client";

import { ChevronRight, Home } from "lucide-react";
import FolderContent from "../../FolderContent";
import DrivesView from "./components/DrivesView";
import LoadingSpinner from "./components/LoadingSpinner";
import SearchResults from "./components/SearchResults";
import { useDashboardData } from "./hooks/useDashboardData";
import { useFolderNavigation } from "./hooks/useFolderNavigation";

export default function DashboardContent({
  searchResults = [],
  isSearchActive = false,
  isSearching = false,
  searchQuery = "",
}) {
  const { currentFolder, setCurrentFolder, rootFolders, loading } =
    useDashboardData();

  const {
    breadcrumbPath,
    navigateToFolder,
    navigateBack,
    handleDocumentAction,
  } = useFolderNavigation(setCurrentFolder);

  const handleFolderSelect = (folder) => {
    navigateToFolder(folder);
  };

  const handleFolderNavigation = (folder) => {
    navigateToFolder(folder);
  };

  const handleNavigateToFolder = (pathItem) => {
    if (pathItem.id === "root") {
      navigateBack();
    } else {
      // Find folder by id and navigate to it
      const folder = rootFolders.find((f) => f.id === pathItem.id);
      if (folder) {
        navigateToFolder(folder);
      }
    }
  };

  // Breadcrumb navigation handlers
  const navigateToRoot = () => {
    setCurrentFolder(null);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      // Root click
      navigateToRoot();
    } else {
      // Navigate to specific folder in path
      const targetFolder = breadcrumbPath[index];
      if (targetFolder) {
        handleNavigateToFolder(targetFolder);
      }
    }
  };

  // Build current path for breadcrumb - ensure no duplicates
  const currentPath = currentFolder
    ? [...breadcrumbPath, { id: currentFolder.id, name: currentFolder.name }]
    : breadcrumbPath;

  // Remove duplicates from path while preserving order
  const uniquePath = currentPath.filter(
    (folder, index, self) => index === self.findIndex((f) => f.id === folder.id)
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      {(uniquePath.length > 0 || currentFolder) && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <button
            onClick={navigateToRoot}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Root</span>
          </button>

          {uniquePath.map((folder, index) => (
            <div
              key={`breadcrumb-${folder.id}-${index}`}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
              >
                {folder.name}
              </button>
            </div>
          ))}

          {uniquePath.length > 0 && (
            <button
              onClick={navigateBack}
              className="ml-auto px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          )}
        </div>
      )}

      {/* Search Results Section */}
      {isSearchActive && (
        <SearchResults
          searchResults={searchResults}
          isSearching={isSearching}
          searchQuery={searchQuery}
          onDocumentAction={handleDocumentAction}
        />
      )}

      {/* Main Content - Show drives view or folder content */}
      {!isSearchActive && (
        <div className="w-full">
          {!currentFolder ? (
            // Drives View - Show root folders as drives
            <DrivesView
              rootFolders={rootFolders}
              onFolderSelect={handleFolderSelect}
              breadcrumbPath={
                breadcrumbPath.length > 0
                  ? breadcrumbPath
                  : [{ id: "root", name: "Drives" }]
              }
              onNavigateBack={navigateBack}
              onNavigateToFolder={handleNavigateToFolder}
            />
          ) : (
            // Folder Content View
            <div className="relative">
              <FolderContent
                currentFolder={currentFolder}
                onFolderNavigation={handleFolderNavigation}
                onDocumentAction={handleDocumentAction}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
