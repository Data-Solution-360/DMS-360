"use client";

import { useCallback } from "react";

export const useFolderActions = (
  currentFolder,
  onFolderNavigation,
  fetchContent
) => {
  // Navigate to a specific folder
  const navigateToFolder = useCallback(
    async (folder) => {
      if (onFolderNavigation) {
        onFolderNavigation(folder);
      }
    },
    [onFolderNavigation]
  );

  // Navigate back to parent folder
  const navigateBack = useCallback(() => {
    // This would need to be implemented based on your path structure
    // For now, it's a placeholder
    console.log("Navigate back clicked");
  }, []);

  const handleDocumentAction = useCallback((action, document) => {
    console.log(`${action} clicked for document:`, document.originalName);
    // Implement document actions here (download, delete, etc.)
  }, []);

  const handleFolderDoubleClick = useCallback(
    (folder, event) => {
      // Add double-click animation
      const target =
        event.target.closest(".folder-card") ||
        event.target.closest(".folder-list-item");
      if (target) {
        target.classList.add("folder-double-click");
        setTimeout(() => {
          target.classList.remove("folder-double-click");
        }, 200);
      }

      navigateToFolder(folder);
    },
    [navigateToFolder]
  );

  const handleUploadSuccess = useCallback(() => {
    // Refresh the content after successful upload
    if (fetchContent) {
      fetchContent();
    }
  }, [fetchContent]);

  return {
    navigateToFolder,
    navigateBack,
    handleDocumentAction,
    handleFolderDoubleClick,
    handleUploadSuccess,
  };
};
