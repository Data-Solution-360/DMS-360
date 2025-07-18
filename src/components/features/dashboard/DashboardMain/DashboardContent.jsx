"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../../lib/constants";
import FolderContent from "../FolderContent";
import FolderSidebar from "../FolderSidebar"; // This should now point to the folder's index.js
import StatsCards from "../StatsCards/StatsCards";

export default function DashboardContent({
  user,
  sidebarWidth = 320,
  setSidebarWidth,
  showResizeHandle,
  isResizing,
  onMouseDown,
  onResetWidth,
}) {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalFolders: 0,
    totalUsers: 0,
    storageUsed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const { apiCall } = useApi();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch data in parallel
      const [statsResponse, foldersResponse, documentsResponse] =
        await Promise.all([
          apiCall(API_ENDPOINTS.DASHBOARD.STATS),
          apiCall(API_ENDPOINTS.FOLDERS.BASE),
          apiCall(
            `${API_ENDPOINTS.DOCUMENTS.BASE}?limit=10&sortBy=createdAt&sortOrder=desc`
          ),
        ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (foldersResponse.success) {
        // Transform folders to include document count and build hierarchy
        const foldersWithCounts = await Promise.all(
          foldersResponse.data.map(async (folder) => {
            const docCount = await fetch(
              `${API_ENDPOINTS.DOCUMENTS.BASE}?folderId=${folder.id}`,
              { credentials: "include" }
            )
              .then((res) => res.json())
              .then((data) => (data.success ? data.pagination.total : 0))
              .catch(() => 0);

            return {
              ...folder,
              id: folder.id,
              documentCount: docCount,
            };
          })
        );

        // Build nested folder structure
        const nestedFolders = buildFolderTree(foldersWithCounts);
        setFolders(nestedFolders);
      }

      if (documentsResponse.success) {
        setDocuments(documentsResponse.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to empty data on error
      setFolders([]);
      setDocuments([]);
      setStats({
        totalDocuments: 0,
        totalFolders: 0,
        totalUsers: 0,
        storageUsed: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Function to build nested folder structure from flat data
  const buildFolderTree = (flatFolders) => {
    const folderMap = new Map();
    const rootFolders = [];

    // First pass: create a map of all folders by ID
    flatFolders.forEach((folder) => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
      });
    });

    // Second pass: build parent-child relationships
    flatFolders.forEach((folder) => {
      const folderWithChildren = folderMap.get(folder.id);

      if (folder.parentId) {
        // This folder has a parent
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(folderWithChildren);
        } else {
          // Parent not found, treat as root folder
          rootFolders.push(folderWithChildren);
        }
      } else {
        // This is a root folder (no parentId)
        rootFolders.push(folderWithChildren);
      }
    });

    // Sort folders by name within each level
    const sortFolders = (folders) => {
      folders.sort((a, b) => a.name.localeCompare(b.name));
      folders.forEach((folder) => {
        if (folder.children.length > 0) {
          sortFolders(folder.children);
        }
      });
    };

    sortFolders(rootFolders);
    return rootFolders;
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); // Only run once on mount

  const handleFolderSelect = (folder) => {
    setCurrentFolder(folder);
  };

  const handleFolderCreated = () => {
    // Refresh folders after creation
    // Reload dashboard data
    loadDashboardData();
  };

  const handleFolderNavigation = (folder) => {
    setCurrentFolder(folder);
  };

  // Handle mouse down for resizing
  const handleMouseDown = (e) => {
    e.preventDefault();
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  // Reset sidebar width to default
  const resetSidebarWidth = () => {
    if (onResetWidth) {
      onResetWidth();
    }
  };

  // Handle sidebar hover events
  const handleSidebarMouseEnter = () => {
    setIsSidebarHovered(true);
  };

  const handleSidebarMouseLeave = () => {
    setIsSidebarHovered(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
          <span className="block mb-2 text-emerald-300">Welcome back,</span>
          <span className="block bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
            {user?.name || "User"}
          </span>
        </h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
          Manage your documents with{" "}
          <span className="text-emerald-300 font-semibold">
            advanced organization
          </span>{" "}
          and{" "}
          <span className="text-sky-300 font-semibold">powerful search</span>{" "}
          capabilities.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="flex flex-col xl:flex-row gap-8 relative">
        {/* Sidebar */}
        <div
          className="flex-shrink-0 transition-all duration-300 ease-in-out relative"
          style={{ width: `${sidebarWidth}px` }}
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        >
          <div className="relative">
            <FolderSidebar
              folders={folders}
              onFolderSelect={handleFolderSelect}
              selectedFolderId={currentFolder?.id || currentFolder?.id}
              onFolderCreated={handleFolderCreated}
            />

            {/* Resize Handle - positioned to match FolderSidebar exactly */}
            {showResizeHandle && isSidebarHovered && (
              <div
                className={`resize-handle ${
                  isResizing ? "active" : ""
                } opacity-100 transition-opacity duration-200 absolute`}
                style={{
                  right: "-2px",
                  width: "4px",
                  top: "16px",
                  bottom: "0",
                  height: "calc(100% - 30px)",
                  zIndex: 10,
                }}
                onMouseDown={handleMouseDown}
              >
                {/* Resize Icon */}
                <div className="resize-handle-icon">
                  <span>⋮</span>
                </div>

                {/* Width Indicator */}
                <div className="resize-width-indicator">{sidebarWidth}px</div>
              </div>
            )}
          </div>
        </div>

        {/* Reset Button */}
        {showResizeHandle && isSidebarHovered && (
          <button
            onClick={resetSidebarWidth}
            className="resize-reset-button opacity-100 transition-opacity duration-200"
            title="Reset sidebar width"
            style={{ top: "8px", left: `${sidebarWidth + 8}px` }}
          >
            <span>↺</span>
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
          <FolderContent
            currentFolder={currentFolder}
            onFolderNavigation={handleFolderNavigation}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl group-hover:shadow-emerald-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
              <span className="text-3xl text-white group-hover:scale-110 transition-transform duration-300">
                📤
              </span>
            </div>
            <h3 className="text-xl font-bold text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-500 mb-2">
              Quick Upload
            </h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
              Upload documents directly to your current folder
            </p>
          </div>

          <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-sky-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl group-hover:shadow-sky-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
              <span className="text-3xl text-white group-hover:scale-110 transition-transform duration-300">
                🔍
              </span>
            </div>
            <h3 className="text-xl font-bold text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-500 mb-2">
              Smart Search
            </h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
              Find documents instantly with AI-powered search
            </p>
          </div>

          <div className="absolute top-4 right-4 w-2 h-2 bg-sky-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl group-hover:shadow-violet-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
              <span className="text-3xl text-white group-hover:scale-110 transition-transform duration-300">
                📊
              </span>
            </div>
            <h3 className="text-xl font-bold text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-500 mb-2">
              Analytics
            </h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
              View detailed insights about your document usage
            </p>
          </div>

          <div className="absolute top-4 right-4 w-2 h-2 bg-violet-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
}
