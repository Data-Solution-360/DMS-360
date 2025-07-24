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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          {currentPath.length > 1 && (
            <button
              onClick={onNavigateBack}
              className="p-2 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300 transition-all duration-300"
              title="Go back"
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent truncate">
            {currentFolder ? currentFolder.name : "All Documents"}
          </h2>
        </div>

        {/* Breadcrumb */}
        {currentPath.length > 0 && (
          <div className="flex flex-wrap items-center space-x-2 text-xs sm:text-sm text-white/60 overflow-x-auto">
            {currentPath.map((pathItem, index) => (
              <div key={pathItem.id} className="flex items-center">
                <span
                  className="hover:text-white/90 transition-colors cursor-pointer truncate max-w-[100px] sm:max-w-none"
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
                  <span className="mx-2 text-white/40">/</span>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-white/60 text-xs sm:text-sm mt-1 truncate">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in this folder
        </p>
      </div>

      {/* Responsive action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
        <button
          onClick={onMakePrivate}
          className="group w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-red-500/50"
        >
          <FiLock className="inline-block mr-2 group-hover:scale-110 transition-transform duration-300" />
          <span className="hidden xs:inline">Make Private</span>
          <span className="inline xs:hidden">Private</span>
        </button>
        <button
          onClick={onUpload}
          className="group w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/50"
        >
          <FiUpload className="inline-block mr-2 group-hover:scale-110 transition-transform duration-300" />
          <span className="hidden xs:inline">Upload Document</span>
          <span className="inline xs:hidden">Upload</span>
        </button>
      </div>
    </div>
  );
}
