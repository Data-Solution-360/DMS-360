"use client";

import { useEffect, useState } from "react";
import { useFolders } from "../../store";

const Sidebar = ({ isOpen = true, onToggle }) => {
  const { folderTree, fetchFolders } = useFolders([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    fetchFolders();
  }, []);

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFolderTree = (folders, level = 0) => {
    return folders.map((folder) => (
      <div key={folder._id}>
        <div
          className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
            level > 0 ? "ml-" + level * 4 : ""
          }`}
          onClick={() => toggleFolder(folder._id)}
        >
          <div className="flex items-center flex-1">
            {folder.children && folder.children.length > 0 && (
              <svg
                className={`w-4 h-4 mr-2 transition-transform ${
                  expandedFolders.has(folder._id) ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            <span className="mr-2">📁</span>
            <span className="truncate">{folder.name}</span>
          </div>
        </div>

        {expandedFolders.has(folder._id) && folder.children && (
          <div className="ml-4">
            {renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <aside
      className={`bg-white border-r border-gray-200 w-64 flex-shrink-0 transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Folders</h2>
          <button
            onClick={onToggle}
            className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">{renderFolderTree(folderTree)}</div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            New Folder
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
