"use client";

import { useApi } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/lib/constants";
import { useCallback, useEffect, useState } from "react";

export const useFolderNavigation = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderStats, setFolderStats] = useState({});
  const { apiCall } = useApi();

  // Fetch folder statistics for all folders
  const fetchFolderStats = useCallback(
    async (foldersData) => {
      try {
        const stats = {};

        // Fetch stats for each folder
        for (const folder of foldersData) {
          try {
            // Fetch documents count
            const documentsResponse = await apiCall(
              `${API_ENDPOINTS.DOCUMENTS.BASE}?folderId=${folder.id}`
            );

            // Fetch subfolders count
            const subfoldersResponse = await apiCall(
              `${API_ENDPOINTS.FOLDERS.BASE}?parentId=${folder.id}`
            );

            const documentsCount = documentsResponse.success
              ? documentsResponse.pagination?.total ||
                documentsResponse.data?.length ||
                0
              : 0;
            const subfoldersCount = subfoldersResponse.success
              ? subfoldersResponse.data?.length || 0
              : 0;

            stats[folder.id] = {
              documents: documentsCount,
              subfolders: subfoldersCount,
              total: documentsCount + subfoldersCount,
            };
          } catch (error) {
            console.error(
              `Error fetching stats for folder ${folder.id}:`,
              error
            );
            stats[folder.id] = { documents: 0, subfolders: 0, total: 0 };
          }
        }

        setFolderStats(stats);
      } catch (error) {
        console.error("Error fetching folder stats:", error);
        setFolderStats({});
      }
    },
    [apiCall]
  );

  const fetchFoldersByParent = useCallback(
    async (parentId = null) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (parentId === null) {
          // For root folders, fetch all folders and filter for those with no parent
          response = await apiCall(`${API_ENDPOINTS.FOLDERS.BASE}`);
          if (response.success) {
            // Filter for root folders (parentId is null or undefined)
            const rootFolders = response.data.filter(
              (folder) =>
                !folder.parentId ||
                folder.parentId === null ||
                folder.parentId === undefined
            );
            setFolders(rootFolders);
            // Fetch stats for root folders
            await fetchFolderStats(rootFolders);
          } else {
            setError(response.error || "Failed to fetch folders");
            setFolders([]);
          }
        } else {
          // For subfolders, use parentId parameter
          response = await apiCall(
            `${API_ENDPOINTS.FOLDERS.BASE}?parentId=${parentId}`
          );
          if (response.success) {
            setFolders(response.data || []);
            // Fetch stats for subfolders
            await fetchFolderStats(response.data || []);
          } else {
            setError(response.error || "Failed to fetch folders");
            setFolders([]);
          }
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
        setError(error.message || "Failed to fetch folders");
        setFolders([]);
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchFolderStats]
  );

  const navigateToFolder = useCallback(
    async (folder) => {
      setCurrentFolder(folder);
      setCurrentPath((prev) => [...prev, folder]);
      await fetchFoldersByParent(folder.id);
    },
    [fetchFoldersByParent]
  );

  const navigateBack = useCallback(async () => {
    if (currentPath.length <= 1) {
      // Go back to root
      setCurrentFolder(null);
      setCurrentPath([]);
      await fetchFoldersByParent(null);
    } else {
      // Go back one level
      const newPath = currentPath.slice(0, -1);
      const parentFolder = newPath[newPath.length - 1];
      setCurrentPath(newPath);
      setCurrentFolder(parentFolder);
      await fetchFoldersByParent(parentFolder?.id || null);
    }
  }, [currentPath, fetchFoldersByParent]);

  const navigateToPath = useCallback(
    async (pathIndex) => {
      if (pathIndex < 0 || pathIndex >= currentPath.length) return;

      const targetFolder = currentPath[pathIndex];
      const newPath = currentPath.slice(0, pathIndex + 1);
      setCurrentPath(newPath);
      setCurrentFolder(targetFolder);
      await fetchFoldersByParent(targetFolder.id);
    },
    [currentPath, fetchFoldersByParent]
  );

  const navigateToRoot = useCallback(async () => {
    setCurrentFolder(null);
    setCurrentPath([]);
    await fetchFoldersByParent(null);
  }, [fetchFoldersByParent]);

  // Fetch root folders on mount
  useEffect(() => {
    fetchFoldersByParent(null);
  }, [fetchFoldersByParent]);

  return {
    folders,
    loading,
    error,
    currentPath,
    currentFolder,
    folderStats,
    navigateToFolder,
    navigateBack,
    navigateToPath,
    navigateToRoot,
    refetch: () => fetchFoldersByParent(currentFolder?.id || null),
  };
};
