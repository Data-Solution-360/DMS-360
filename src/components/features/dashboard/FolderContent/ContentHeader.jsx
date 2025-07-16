"use client";

// Temporary icon replacements
const FiUpload = () => <span>📤</span>;
const FiArrowLeft = () => <span>←</span>;

export default function ContentHeader({
  currentFolder,
  currentPath,
  totalItems,
  onNavigateBack,
  onNavigateToFolder,
  onUpload,
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex-1">
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">
            {currentFolder ? currentFolder.name : "All Documents"}
          </h2>
        </div>

        {/* Breadcrumb */}
        {currentPath.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-white/60">
            {currentPath.map((pathItem, index) => (
              <div key={pathItem.id} className="flex items-center">
                <span
                  className="hover:text-white/90 transition-colors cursor-pointer"
                  onClick={() =>
                    onNavigateToFolder({
                      _id: pathItem.id,
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

        <p className="text-white/60 text-sm mt-1">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in this folder
        </p>
      </div>

      <button
        onClick={onUpload}
        className="group px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/50"
      >
        <FiUpload className="inline-block mr-2 group-hover:scale-110 transition-transform duration-300" />
        Upload Document
      </button>
    </div>
  );
}
