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

export default function FolderCard({ folder, stats, onDoubleClick }) {
  return (
    <div
      className="folder-card group relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden cursor-pointer"
      onDoubleClick={(e) => onDoubleClick(folder, e)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

      <div className="relative z-10">
        {/* Folder icon */}
        <div className="relative w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl group-hover:shadow-emerald-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
            <FiFolder />
          </span>
          {folder.isRestricted && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">🔒</span>
            </div>
          )}
        </div>

        {/* Folder info */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-500 line-clamp-2">
            {folder.name}
          </h3>

          <div className="space-y-2">
            <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
              Folder
            </p>

            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{stats?.total || 0} items</span>
              <span>{formatDate(folder.createdAt)}</span>
            </div>

            {/* Double-click hint */}
            <div className="text-xs text-emerald-300/70 group-hover:text-emerald-300 transition-colors duration-300">
              Double-click to open
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
      <div className="absolute bottom-4 left-4 w-2 h-2 bg-teal-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-1000 transition-opacity duration-500"></div>
    </div>
  );
}
