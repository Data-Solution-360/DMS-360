"use client";

// Temporary icon replacements
const FiSearch = () => <span>🔍</span>;
const FiGrid = () => <span>⊞</span>;
const FiList = () => <span>☰</span>;
const FiTable = () => <span>⊞⊞</span>;

export default function ContentToolbar({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  viewMode,
  setViewMode,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FiSearch className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search documents and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none text-gray-900 placeholder-gray-500 w-full sm:w-auto text-sm focus:border-blue-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="all">All Types</option>
          <option value="documents">Documents</option>
          <option value="folders">Folders</option>
        </select>
      </div>

      {/* View Mode Buttons */}
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg transition-colors text-sm ${
            viewMode === "grid"
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
          title="Grid View"
        >
          <FiGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg transition-colors text-sm ${
            viewMode === "list"
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
          title="List View"
        >
          <FiList className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode("table")}
          className={`p-2 rounded-lg transition-colors text-sm ${
            viewMode === "table"
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
          title="Table View"
        >
          <FiTable className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
