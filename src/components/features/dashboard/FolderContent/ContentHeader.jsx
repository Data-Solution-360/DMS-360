"use client";

// Temporary icon replacements
const FiUpload = () => <span>📤</span>;
const FiArrowLeft = () => <span>←</span>;
const FiLock = () => <span>🔒</span>;

export default function ContentHeader({
  currentFolder,
  currentPath,
  totalItems,
  onNavigateBack,
  onNavigateToFolder,
  onUpload,
  onMakePrivate,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          {currentPath.length > 1 && (
            <button
              onClick={onNavigateBack}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
              title="Go back"
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-black">
            {currentFolder ? currentFolder.name : "All Documents"}
          </h2>
        </div>

        {/* Breadcrumb */}
        {currentPath.length > 0 && (
          <div className="flex flex-wrap items-center space-x-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
            {currentPath.map((pathItem, index) => (
              <div key={pathItem.id} className="flex items-center">
                <span
                  className="hover:text-gray-900 transition-colors cursor-pointer truncate max-w-[100px] sm:max-w-none"
                  onClick={() =>
                    onNavigateToFolder({
                      id: pathItem.id,
                      name: pathItem.name,
                    })
                  }
                >
                  {pathItem.name}
                </span>
                {index < currentPath.length - 1 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-gray-600 text-xs sm:text-sm mt-1 truncate">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in this folder
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <button
          onClick={onMakePrivate}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <FiLock className="inline-block mr-2" />
          Make Private
        </button>
        <button
          onClick={onUpload}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <FiUpload className="inline-block mr-2" />
          Upload Document
        </button>
      </div>
    </div>
  );
}
