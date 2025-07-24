"use client";

// Temporary icon replacements
const FiSearch = () => <span>🔍</span>;
const FiGrid = () => <span>⊞</span>;
const FiList = () => <span>☰</span>;

export default function ContentToolbar({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  viewMode,
  setViewMode,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 p-3 sm:p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl border border-white/10">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FiSearch className="h-4 w-4 text-white/60 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search documents and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white placeholder-white/60 w-full sm:w-auto text-sm sm:text-base"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-transparent border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
        >
          <option value="all" className="bg-gray-800">
            All Types
          </option>
          <option value="documents" className="bg-gray-800">
            Documents
          </option>
          <option value="folders" className="bg-gray-800">
            Folders
          </option>
        </select>
      </div>

      {/* View Mode Buttons */}
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg transition-all duration-300 text-sm sm:text-base ${
            viewMode === "grid"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
          }`}
        >
          <FiGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg transition-all duration-300 text-sm sm:text-base ${
            viewMode === "list"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
          }`}
        >
          <FiList className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
