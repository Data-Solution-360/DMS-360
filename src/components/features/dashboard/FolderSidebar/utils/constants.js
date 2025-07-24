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

// CSS Classes
export const FOLDER_STYLES = {
  container:
    "bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl w-full",
  header: "flex items-center justify-between mb-6",
  title:
    "text-lg font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent",
  addButton:
    "group p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-emerald-500/50",
  scrollArea: "space-y-2 max-h-96 folder-sidebar-scrollbar",
  emptyState: "text-center py-8",
};

export const FOLDER_ITEM_STYLES = {
  container: "space-y-1",
  button:
    "group relative flex items-center px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 transform",
  selected:
    "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 shadow-emerald-500/25",
  hover:
    "hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 border border-transparent hover:border-white/20",
  icon: "w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3 shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3",
  name: "flex-1 text-sm font-medium transition-all duration-300",
  nameSelected: "text-emerald-200 font-semibold",
  nameDefault: "text-white/80 group-hover:text-white group-hover:font-semibold",
  expandButton:
    "mr-2 p-1 rounded-lg hover:bg-white/10 transition-all duration-200 group-hover:scale-110",
  counter:
    "text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300",
  children: "ml-4 space-y-1",
};
