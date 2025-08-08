"use client";

// Temporary icon replacements
const FiFolder = () => <span>📁</span>;

// Utility functions
const formatDate = (dateData) => {
  if (!dateData) return "Unknown date";

  try {
    let date;

    // Handle Firebase Timestamp format
    if (dateData._seconds) {
      date = new Date(dateData._seconds * 1000);
    } else if (typeof dateData === "string") {
      date = new Date(dateData);
    } else if (dateData instanceof Date) {
      date = dateData;
    } else {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

export default function FolderList({ folder, stats, onDoubleClick }) {
  return (
    <div
      className="group flex items-center p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer"
      onDoubleClick={(e) => onDoubleClick(folder, e)}
    >
      {/* Folder icon */}
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
        <span className="text-white text-sm">
          <FiFolder />
        </span>
      </div>

      {/* Folder info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {folder.name}
        </h3>
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
          <span>{stats?.total || 0} items</span>
          <span>{formatDate(folder.createdAt)}</span>
          <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Double-click to open
          </span>
        </div>
      </div>
    </div>
  );
}
