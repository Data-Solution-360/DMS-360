"use client";

import { useCallback, useState } from "react";
import { API_ENDPOINTS } from "../../../../../lib/constants";

export const useFolderData = (currentFolder, apiCall) => {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [folderStats, setFolderStats] = useState({});

  // Update current path when folder changes
  const updateCurrentPath = useCallback((folder) => {
    if (!folder) {
      setCurrentPath([]);
      return;
    }

    // For now, we'll create a simple path with just the current folder
    // In a full implementation, you would fetch the complete path hierarchy
    const path = [
      {
        id: folder._id,
        name: folder.name,
      },
    ];

    setCurrentPath(path);
  }, []);

  // Fetch folder statistics for all folders (documents and subfolders count)
  const fetchAllFolderStats = useCallback(
    async (foldersData) => {
      try {
        const stats = {};

        // Fetch stats for each folder
        for (const folder of foldersData) {
          try {
            // Fetch documents count
            const documentsResponse = await apiCall(
              `${API_ENDPOINTS.DOCUMENTS.BASE}?folderId=${folder._id}`
            );

            // Fetch subfolders count
            const subfoldersResponse = await apiCall(
              `${API_ENDPOINTS.FOLDERS.BASE}?parentId=${folder._id}`
            );

            const documentsCount = documentsResponse.success
              ? documentsResponse.pagination?.total || 0
              : 0;
            const subfoldersCount = subfoldersResponse.success
              ? subfoldersResponse.data?.length || 0
              : 0;

            stats[folder._id] = {
              documents: documentsCount,
              subfolders: subfoldersCount,
              total: documentsCount + subfoldersCount,
            };
          } catch (error) {
            console.error(
              `Error fetching stats for folder ${folder._id}:`,
              error
            );
            stats[folder._id] = { documents: 0, subfolders: 0, total: 0 };
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

  // Fetch documents and folders when current folder changes
  const fetchContent = useCallback(async () => {
    if (!currentFolder) {
      setDocuments([]);
      setFolders([]);
      setCurrentPath([]);
      setFolderStats({});
      return;
    }

    setLoading(true);
    try {
      // Fetch documents for current folder
      const documentsResponse = await apiCall(
        `${API_ENDPOINTS.DOCUMENTS.BASE}?folderId=${currentFolder._id}&limit=50&sortBy=createdAt&sortOrder=desc`
      );

      // Fetch child folders for current folder
      const foldersResponse = await apiCall(
        `${API_ENDPOINTS.FOLDERS.BASE}?parentId=${currentFolder._id}`
      );

      if (documentsResponse.success) {
        setDocuments(documentsResponse.data);
      } else {
        setDocuments([]);
      }

      if (foldersResponse.success) {
        setFolders(foldersResponse.data);
      } else {
        setFolders([]);
      }

      // Update current path
      updateCurrentPath(currentFolder);

      // Fetch folder statistics for all folders
      await fetchAllFolderStats(
        foldersResponse.success ? foldersResponse.data : []
      );
    } catch (error) {
      console.error("Error fetching content:", error);
      setDocuments([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, apiCall, updateCurrentPath, fetchAllFolderStats]);

  return {
    documents,
    folders,
    loading,
    currentPath,
    folderStats,
    fetchContent,
    updateCurrentPath,
  };
};
