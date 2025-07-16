"use client";

// Temporary icon replacements
const FiFolder = () => <span>📁</span>;

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function FolderList({ folder, stats, onDoubleClick }) {
  return (
    <div
      className="folder-list-item group relative flex items-center p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-300 border border-white/10 hover:border-white/20 cursor-pointer"
      onDoubleClick={(e) => onDoubleClick(folder, e)}
    >
      {/* Folder icon */}
      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300">
        <span className="h-6 w-6 text-white">
          <FiFolder />
        </span>
      </div>

      {/* Folder info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors duration-300 truncate">
          {folder.name}
        </h3>
        <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300 truncate">
          Folder
        </p>
        <div className="flex items-center space-x-4 mt-1 text-xs text-white/60">
          <span>{stats?.total || 0} items</span>
          <span>{formatDate(folder.createdAt)}</span>
          <span className="text-emerald-300">Double-click to open</span>
        </div>
      </div>
    </div>
  );
}
