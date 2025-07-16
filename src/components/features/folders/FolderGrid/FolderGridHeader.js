"use client";

// Temporary icon replacements
const FiRefreshCw = () => <span>🔄</span>;
const FiGrid = () => <span>⊞</span>;
const FiList = () => <span>☰</span>;
const FiUpload = () => <span>⬆️</span>;
const FiShield = () => <span>🛡️</span>;
const FiPlus = () => <span>➕</span>;

export default function FolderGridHeader({
  selectedFolder,
  refreshing,
  sortBy,
  sortOrder,
  viewMode,
  user,
  onRefresh,
  onSort,
  onViewModeChange,
  onCreateFolder,
  onUploadDocuments,
  onAccessControl,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedFolder ? `Contents of "${selectedFolder.name}"` : "Folders"}
        </h2>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Sort controls */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [newSortBy, newSortOrder] = e.target.value.split("-");
            onSort(newSortBy, newSortOrder);
          }}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="date-desc">Date (Newest)</option>
        </select>

        {/* View mode toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="Grid view"
          >
            <FiGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="List view"
          >
            <FiList className="h-4 w-4" />
          </button>
        </div>

        {/* Upload documents button - always available */}
        <button
          onClick={onUploadDocuments}
          className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            selectedFolder
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gray-400 text-white hover:bg-gray-500 cursor-not-allowed"
          }`}
          disabled={!selectedFolder}
          title={
            selectedFolder
              ? "Upload documents to this folder"
              : "Please select a folder first to upload documents"
          }
        >
          <FiUpload className="h-4 w-4 mr-1" />
          Upload Documents
        </button>

        {/* Access Control button - only show for admin users */}
        {user?.role === "admin" && selectedFolder && (
          <button
            onClick={onAccessControl}
            className="flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            title="Manage folder access permissions"
          >
            <FiShield className="h-4 w-4 mr-1" />
            Access Control
          </button>
        )}

        {/* Create folder button */}
        <button
          onClick={onCreateFolder}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="h-4 w-4 mr-1" />
          New Folder
        </button>
      </div>
    </div>
  );
}
