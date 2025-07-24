"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "../../../../lib/constants";
import { useAuth } from "../../../../store/AuthContext";
import { DateFilter, Navbar, SearchBar } from "../index";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState("accessible");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    tags: [],
    fileType: "",
    dateRange: { start: "", end: "" },
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [showResizeHandle, setShowResizeHandle] = useState(false);

  // Determine user role and permissions
  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);

  // Available file types for search filter
  const fileTypes = [
    { value: "", label: "All Types" },
    { value: "pdf", label: "PDF" },
    { value: "document", label: "Documents" },
    { value: "spreadsheet", label: "Spreadsheets" },
    { value: "presentation", label: "Presentations" },
    { value: "image", label: "Images" },
    { value: "video", label: "Videos" },
    { value: "archive", label: "Archives" },
    { value: "other", label: "Other" },
  ];

  // Debounced search function
  const performSearch = useCallback(
    async (query, filters = {}) => {
      if (!query.trim() && !filters.tags?.length && !filters.fileType) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchParams = new URLSearchParams();

        if (query.trim()) {
          searchParams.append("q", query.trim());
        }

        if (filters.tags?.length) {
          searchParams.append("tags", filters.tags.join(","));
        }

        if (filters.fileType) {
          searchParams.append("fileType", filters.fileType);
        }

        // Admin can choose search scope
        if (isAdmin) {
          searchParams.append("scope", searchScope);
        }

        const response = await fetch(
          `${API_ENDPOINTS.DOCUMENTS.BASE}/search?${searchParams}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.success) {
          setSearchResults(data.data || []);
        } else {
          console.error("Search failed:", data.error);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [isAdmin, searchScope]
  );

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, searchFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFilters, performSearch]);

  // Memoized callback functions
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleSearchScopeChange = useCallback((scope) => {
    setSearchScope(scope);
  }, []);

  const handleTagFilter = useCallback((tags) => {
    setSearchFilters((prev) => ({ ...prev, tags }));
  }, []);

  const handleFileTypeFilter = useCallback((fileType) => {
    setSearchFilters((prev) => ({ ...prev, fileType }));
  }, []);

  const handleDateClear = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setSearchFilters((prev) => ({
      ...prev,
      dateRange: { start: "", end: "" },
    }));
  }, []);

  // Handle mouse down for resizing
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // Handle mouse move for resizing
  const handleMouseMove = (e) => {
    if (!isResizing) return;

    const newWidth = e.clientX;
    const minWidth = 200;
    const maxWidth = window.innerWidth * 0.6;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  };

  // Handle mouse up to stop resizing
  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // Add event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Reset sidebar width to default
  const resetSidebarWidth = () => {
    setSidebarWidth(320);
  };

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchFilters({
      tags: [],
      fileType: "",
      dateRange: { start: "", end: "" },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 animate-gradient-xy"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/5 to-emerald-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-sky-400 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-violet-400 rounded-full animate-ping animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-amber-400 rounded-full animate-ping animation-delay-3000"></div>
      </div>

      {/* Navigation */}
      <Navbar
        user={user}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        searchScope={searchScope}
        onSearchScopeChange={handleSearchScopeChange}
        onLogout={logout}
        isAdmin={isAdmin}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 max-w-2xl">
                <SearchBar
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search by name, title, tags, or content..."
                  className="w-full"
                  isSearching={isSearching}
                />
              </div>

              {/* Search Controls */}
              <div className="flex items-center gap-4">
                {/* Admin Search Scope */}
                {isAdmin && (
                  <select
                    value={searchScope}
                    onChange={(e) => handleSearchScopeChange(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 backdrop-blur-sm"
                  >
                    <option value="accessible" className="bg-gray-800">
                      My Accessible
                    </option>
                    <option value="all" className="bg-gray-800">
                      All Documents
                    </option>
                  </select>
                )}

                <DateFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onClear={handleDateClear}
                  className="flex-shrink-0"
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* File Type Filter */}
              <select
                value={searchFilters.fileType}
                onChange={(e) => handleFileTypeFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 backdrop-blur-sm"
              >
                {fileTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                    className="bg-gray-800"
                  >
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Clear Search Button */}
              {(searchQuery ||
                searchFilters.tags.length > 0 ||
                searchFilters.fileType) && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl text-sm hover:bg-red-500/30 transition-colors border border-red-500/30"
                >
                  Clear Search
                </button>
              )}

              {/* Search Results Count */}
              {searchResults.length > 0 && (
                <span className="text-white/70 text-sm">
                  Found {searchResults.length} document
                  {searchResults.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Resizable Layout Container */}
          <div
            className="resizable-layout flex flex-col xl:flex-row gap-8 relative"
            onMouseEnter={() => setShowResizeHandle(true)}
            onMouseLeave={() => setShowResizeHandle(false)}
          >
            <div className="relative w-full">
              {React.cloneElement(children, {
                sidebarWidth,
                setSidebarWidth,
                showResizeHandle,
                isResizing,
                onMouseDown: handleMouseDown,
                onResetWidth: resetSidebarWidth,
                searchResults,
                isSearchActive:
                  searchQuery.trim().length > 0 ||
                  searchFilters.tags.length > 0 ||
                  searchFilters.fileType,
                isSearching,
                searchQuery,
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
