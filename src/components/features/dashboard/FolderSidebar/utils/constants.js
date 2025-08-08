import React from "react";

// Icon components
export const FolderIcons = {
  Folder: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
  FolderPlus: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ),
  ChevronRight: ({ className }) => (
    <svg
      className={className}
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
  ),
  ChevronDown: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  Close: ({ className }) => (
    <svg
      className={className}
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
  ),
  Edit: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  Trash: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
};

// Simple CSS Classes
export const FOLDER_STYLES = {
  container: "bg-white rounded-lg p-4 border border-gray-200 shadow-sm w-full",
  header: "flex items-center justify-between mb-4",
  title: "text-lg font-semibold text-gray-900",
  addButton: "p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors",
  scrollArea: "space-y-1 max-h-96 overflow-y-auto",
  emptyState: "text-center py-8",
};

export const FOLDER_ITEM_STYLES = {
  container: "space-y-1",
  button: "group flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors",
  selected: "bg-blue-50 text-blue-600 border border-blue-200",
  hover: "hover:bg-gray-50 hover:text-gray-900",
  icon: "w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-3 text-white",
  name: "flex-1 text-sm font-medium transition-colors",
  nameSelected: "text-blue-600 font-semibold",
  nameDefault: "text-gray-700 group-hover:text-gray-900",
  expandButton: "mr-2 p-1 rounded hover:bg-gray-100 transition-colors",
  counter: "text-xs px-2 py-1 rounded-full font-medium",
  children: "ml-4 space-y-1",
};
