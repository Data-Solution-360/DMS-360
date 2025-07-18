"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../store/AuthContext";
import { DateFilter, Navbar, SearchBar } from "../index";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px
  const [isResizing, setIsResizing] = useState(false);
  const [showResizeHandle, setShowResizeHandle] = useState(false);

  // Memoize callback functions
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleSearchScopeChange = useCallback((scope) => {
    setSearchScope(scope);
  }, []);

  const handleDateClear = useCallback(() => {
    // Handle date filter clear
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
    const minWidth = 200; // Minimum sidebar width
    const maxWidth = window.innerWidth * 0.6; // Maximum 60% of screen width

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Dark animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 animate-gradient-xy"></div>

        {/* Floating orbs with better opacity */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/5 to-emerald-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>

        {/* Sparkles with better visibility */}
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
      />

      {/* Main Content */}
      <main className="relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Bar */}
          <div className="mb-8 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search documents, folders, or tags..."
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-4">
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

          {/* Resizable Layout Container */}
          <div
            className="resizable-layout flex flex-col xl:flex-row gap-8 relative"
            onMouseEnter={() => setShowResizeHandle(true)}
            onMouseLeave={() => setShowResizeHandle(false)}
          >
            {/* Page Content with Resizable Areas */}
            <div className="relative w-full">
              {React.cloneElement(children, {
                sidebarWidth,
                setSidebarWidth,
                showResizeHandle,
                isResizing,
                onMouseDown: handleMouseDown,
                onResetWidth: resetSidebarWidth,
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
