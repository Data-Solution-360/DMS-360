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

export default function DriveCard({
  folder,
  onDoubleClick,
  viewMode = "grid",
}) {
  if (viewMode === "grid") {
    return (
      <div
        className="group relative bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer"
        onDoubleClick={(e) => onDoubleClick(folder, e)}
      >
        <div className="flex items-start space-x-3">
          {/* Drive icon */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">💾</span>
            </div>
            {folder.isRestricted && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🔒</span>
              </div>
            )}
          </div>

          {/* Drive info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {folder.name}
            </h3>

            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              <span>{folder.documentCount || 0} documents</span>
              <span>{formatDate(folder.createdAt)}</span>
            </div>

            {folder.description && (
              <p className="mt-1 text-xs text-gray-500 truncate">
                {folder.description}
              </p>
            )}

            <div className="mt-1 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Double-click to open
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className="group relative bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer flex items-center space-x-4"
      onDoubleClick={(e) => onDoubleClick(folder, e)}
    >
      {/* Drive icon */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">💾</span>
        </div>
        {folder.isRestricted && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🔒</span>
          </div>
        )}
      </div>

      {/* Drive info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {folder.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{folder.documentCount || 0} documents</span>
          <span>{formatDate(folder.createdAt)}</span>
        </div>
      </div>

      <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
        Double-click to open
      </div>
    </div>
  );
}
