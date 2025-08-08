"use client";

import DocumentCard from "../../../FolderContent/ContentItems/DocumentCard";

export default function SearchResults({
  searchResults,
  isSearching,
  searchQuery,
  onDocumentAction,
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Search Results
          </h2>
          <p className="text-black/70">
            {isSearching ? (
              <>
                <span className="inline-block animate-spin mr-2">🔍</span>
                Searching...
              </>
            ) : (
              <>
                Found {searchResults.length} document
                {searchResults.length !== 1 ? "s" : ""}
                {searchQuery && (
                  <span>
                    {" "}
                    for "<span className="text-emerald-300">{searchQuery}</span>
                    "
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Search Results Grid */}
      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Loading skeletons */}
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white/5 p-6 rounded-3xl border border-white/10 animate-pulse"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded mb-4 w-3/4"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-white/10 rounded"></div>
                <div className="h-8 w-8 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((document) => (
            <div key={document.id} className="relative">
              <DocumentCard document={document} onAction={onDocumentAction} />
              {/* Folder path indicator */}
              {document.folderId && (
                <div className="mt-2 text-xs text-black/50 flex items-center">
                  <span className="mr-1">📁</span>
                  <span className="truncate">
                    {typeof document.folderId === "object"
                      ? document.folderId.name
                      : "Unknown Folder"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-black/80 mb-2">
            No documents found
          </h3>
          <p className="text-black/60">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}
