"use client";

import { useCallback, useState } from "react";
import { useApi } from "../../../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../../../lib/constants";
import { getFolderPath } from "../utils/helpers";

export const useFolderSidebar = (folders, onFolderCreated) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [creating, setCreating] = useState(false);
  const { apiCall } = useApi();

  const toggleFolder = useCallback((folderId) => {
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  }, []);

  const expandParentFolders = useCallback(
    (folderId) => {
      const path = getFolderPath(folders, folderId);
      if (path) {
        setExpandedFolders((prev) => {
          const newExpanded = new Set(prev);
          path.slice(0, -1).forEach((parentId) => {
            newExpanded.add(parentId);
          });
          return newExpanded;
        });
      }
    },
    [folders]
  );

  const openCreateModal = useCallback(() => {
    setIsCreatingFolder(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreatingFolder(false);
    setNewFolderName("");
    setSelectedParentId(null);
  }, []);

  const createFolder = useCallback(async () => {
    if (!newFolderName.trim()) {
      alert("Please enter a folder name");
      return;
    }

    setCreating(true);
    try {
      const response = await apiCall(API_ENDPOINTS.FOLDERS.BASE, {
        method: "POST",
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: selectedParentId,
        }),
      });

      if (response.success) {
        closeCreateModal();
        if (onFolderCreated) {
          onFolderCreated();
        }
      } else {
        throw new Error(response.error || "Failed to create folder");
      }
    } catch (error) {
      console.error("Create folder error:", error);
      alert(`Failed to create folder: ${error.message}`);
    } finally {
      setCreating(false);
    }
  }, [
    newFolderName,
    selectedParentId,
    apiCall,
    onFolderCreated,
    closeCreateModal,
  ]);

  return {
    // State
    expandedFolders,
    isCreatingFolder,
    newFolderName,
    selectedParentId,
    creating,

    // Actions
    toggleFolder,
    expandParentFolders,
    openCreateModal,
    closeCreateModal,
    createFolder,
    setNewFolderName,
    setSelectedParentId,
  };
};
