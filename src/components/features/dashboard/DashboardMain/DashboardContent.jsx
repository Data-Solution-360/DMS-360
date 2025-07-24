"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../../lib/constants";
import FolderContent from "../FolderContent";
import DocumentCard from "../FolderContent/ContentItems/DocumentCard";
import FolderSidebar from "../FolderSidebar";
import StatsCards from "../StatsCards/StatsCards";

export default function DashboardContent({
  user,
  sidebarWidth = 320,
  setSidebarWidth,
  showResizeHandle,
  isResizing,
  onMouseDown,
  onResetWidth,
  // New search-related props
  searchResults = [],
  isSearchActive = false,
  isSearching = false,
  searchQuery = "",
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
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [highlightedFolderId, setHighlightedFolderId] = useState(null);
  const { apiCall } = useApi();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

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

        const nestedFolders = buildFolderTree(foldersWithCounts);
        setFolders(nestedFolders);
      }

      if (documentsResponse.success) {
        setDocuments(documentsResponse.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
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

  const buildFolderTree = (flatFolders) => {
    const folderMap = new Map();
    const rootFolders = [];

    flatFolders.forEach((folder) => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
      });
    });

    flatFolders.forEach((folder) => {
      const folderWithChildren = folderMap.get(folder.id);

      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(folderWithChildren);
        } else {
          rootFolders.push(folderWithChildren);
        }
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

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

  // Function to find folder path and expand tree
  const findAndExpandToFolder = useCallback(
    (folderId) => {
      if (!folderId || !folders.length) return;

      // Find the folder path from root to target folder
      const findFolderPath = (folders, targetId, path = []) => {
        for (const folder of folders) {
          const currentPath = [...path, folder.id];

          if (folder.id === targetId) {
            return currentPath;
          }

          if (folder.children && folder.children.length > 0) {
            const result = findFolderPath(
              folder.children,
              targetId,
              currentPath
            );
            if (result) return result;
          }
        }
        return null;
      };

      const folderPath = findFolderPath(folders, folderId);

      if (folderPath) {
        // Expand all folders in the path
        setExpandedFolders((prev) => {
          const newExpanded = new Set(prev);
          folderPath.forEach((id) => newExpanded.add(id));
          return newExpanded;
        });

        // Highlight the target folder
        setHighlightedFolderId(folderId);

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedFolderId(null);
        }, 3000);

        // Find the actual folder object and set as current
        const findFolderById = (folders, targetId) => {
          for (const folder of folders) {
            if (folder.id === targetId) {
              return folder;
            }
            if (folder.children && folder.children.length > 0) {
              const result = findFolderById(folder.children, targetId);
              if (result) return result;
            }
          }
          return null;
        };

        const targetFolder = findFolderById(folders, folderId);
        if (targetFolder) {
          setCurrentFolder(targetFolder);
        }
      }
    },
    [folders]
  );

  // Handle document actions including navigation to folder
  const handleDocumentAction = useCallback(
    (action, document) => {
      switch (action) {
        case "view":
          // Navigate to the document's folder
          if (document.folderId) {
            const folderId =
              typeof document.folderId === "object"
                ? document.folderId.id
                : document.folderId;
            findAndExpandToFolder(folderId);
          }
          break;
        case "download":
          // Handle download logic
          if (document.downloadUrl) {
            window.open(document.downloadUrl, "_blank");
          }
          break;
        case "more":
          // Handle more options
          console.log("More options for document:", document);
          break;
        default:
          console.log("Unknown action:", action, document);
      }
    },
    [findAndExpandToFolder]
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleFolderSelect = (folder) => {
    setCurrentFolder(folder);
  };

  const handleFolderCreated = () => {
    loadDashboardData();
  };

  const handleFolderUpdated = (updatedFolder) => {
    setFolders((currentFolders) => {
      const updateFolderInTree = (folders, targetId, newName) => {
        return folders.map((folder) => {
          if (folder.id === targetId) {
            return { ...folder, name: newName };
          }
          if (folder.children && folder.children.length > 0) {
            return {
              ...folder,
              children: updateFolderInTree(folder.children, targetId, newName),
            };
          }
          return folder;
        });
      };

      return updateFolderInTree(
        currentFolders,
        updatedFolder.id,
        updatedFolder.name
      );
    });

    if (currentFolder && currentFolder.id === updatedFolder.id) {
      setCurrentFolder({ ...currentFolder, name: updatedFolder.name });
    }

    setTimeout(() => loadDashboardData(), 100);
  };

  const handleFolderDeleted = (deletedFolder) => {
    setFolders((currentFolders) => {
      const removeFolderFromTree = (folders, targetId) => {
        return folders.filter((folder) => {
          if (folder.id === targetId) {
            return false;
          }
          if (folder.children && folder.children.length > 0) {
            folder.children = removeFolderFromTree(folder.children, targetId);
          }
          return true;
        });
      };

      return removeFolderFromTree(currentFolders, deletedFolder.id);
    });

    if (currentFolder && currentFolder.id === deletedFolder.id) {
      setCurrentFolder(null);
    }

    setTimeout(() => loadDashboardData(), 100);
  };

  const handleFolderNavigation = (folder) => {
    setCurrentFolder(folder);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const resetSidebarWidth = () => {
    if (onResetWidth) {
      onResetWidth();
    }
  };

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
      {/* Welcome Section - Hide when searching */}
      {!isSearchActive && (
        <>
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
              <span className="text-sky-300 font-semibold">
                powerful search
              </span>{" "}
              capabilities.
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />
        </>
      )}

      {/* Search Results Section */}
      {isSearchActive && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Search Results
              </h2>
              <p className="text-white/70">
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
                        for "
                        <span className="text-emerald-300">{searchQuery}</span>"
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
                  <DocumentCard
                    document={document}
                    onAction={handleDocumentAction}
                  />
                  {/* Folder path indicator */}
                  {document.folderId && (
                    <div className="mt-2 text-xs text-white/50 flex items-center">
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
              <h3 className="text-xl font-semibold text-white/80 mb-2">
                No documents found
              </h3>
              <p className="text-white/60">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid - Show when not searching or as fallback */}
      {!isSearchActive && (
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
                selectedFolderId={currentFolder?.id}
                onFolderCreated={handleFolderCreated}
                onFolderUpdated={handleFolderUpdated}
                onFolderDeleted={handleFolderDeleted}
                expandedFolders={expandedFolders}
                setExpandedFolders={setExpandedFolders}
                highlightedFolderId={highlightedFolderId}
              />

              {/* Resize Handle */}
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
                  <div className="resize-handle-icon">
                    <span>⋮</span>
                  </div>
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
              onDocumentAction={handleDocumentAction}
            />
          </div>
        </div>
      )}

      {/* Quick Actions - Hide when searching */}
      {!isSearchActive && (
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
      )}
    </div>
  );
}
