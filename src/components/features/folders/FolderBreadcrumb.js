"use client";

import { useEffect, useState } from "react";
// Temporary icon replacements
const FiChevronRight = () => <span>▶</span>;
const FiFolder = () => <span>📁</span>;
const FiHome = () => <span>🏠</span>;

export default function FolderBreadcrumb({
  selectedFolder,
  onFolderSelect,
  allFolders = [],
}) {
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (selectedFolder && allFolders.length > 0) {
      buildBreadcrumbPath(selectedFolder, allFolders);
    } else {
      setBreadcrumbPath([]);
    }
  }, [selectedFolder, allFolders]);

  const buildBreadcrumbPath = (folder, folders) => {
    const path = [];
    let currentFolder = folder;

    // Build path from current folder up to root
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = folders.find((f) => f._id === currentFolder.parentId);
    }

    setBreadcrumbPath(path);
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center text-sm">
        <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-100 to-blue-50 text-gray-600 rounded-lg font-medium shadow-sm animate-pulse">
          <FiHome className="h-4 w-4 mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!selectedFolder) {
    return (
      <div className="flex items-center text-sm">
        <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-lg font-medium shadow-sm">
          <FiHome className="h-4 w-4 mr-2" />
          <span>Root Directory</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm flex-wrap gap-1">
      <button
        onClick={() => onFolderSelect(null)}
        className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-lg hover:from-blue-200 hover:to-purple-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
      >
        <FiHome className="h-4 w-4 mr-2" />
        <span>Root</span>
      </button>

      {breadcrumbPath.map((folder, index) => (
        <div key={folder._id} className="flex items-center">
          <div className="mx-2 text-gray-400">
            <FiChevronRight className="h-4 w-4" />
          </div>
          {index === breadcrumbPath.length - 1 ? (
            <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg font-medium shadow-sm">
              <FiFolder className="h-4 w-4 mr-2" />
              <span>{folder.name}</span>
            </div>
          ) : (
            <button
              onClick={() => onFolderSelect(folder)}
              className="flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-100 to-blue-50 text-gray-700 rounded-lg hover:from-gray-200 hover:to-blue-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <FiFolder className="h-4 w-4 mr-2" />
              <span>{folder.name}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
