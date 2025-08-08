"use client";

import { useApi } from "@/hooks/useApi";
import { useCallback, useState } from "react";
import Swal from "sweetalert2";

export const useFolderActions = (
  currentFolder,
  onFolderNavigation,
  fetchContent
) => {
  const { apiCall } = useApi();
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);

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
  }, []);

  const handleDocumentAction = useCallback(
    async (action, document) => {
      switch (action) {
        case "view":
          // Handle view action
          console.log("View document:", document);
          break;

        case "download":
          // Handle download action
          console.log("Download document:", document);
          break;

        case "delete":
          // Handle delete action - soft delete
          const confirm = await Swal.fire({
            title: "🗑️ Delete Document",
            text: `Are you sure you want to delete "${document.originalName}"? This will move it to trash.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
            background: "#ffffff",
            color: "#1f2937",
          });

          if (!confirm.isConfirmed) return;

          setDeletingDocumentId(document.id);
          try {
            const result = await apiCall(`/api/documents/${document.id}`, {
              method: "DELETE",
            });

            if (result.success) {
              Swal.fire({
                title: "✅ Document Deleted!",
                text: "Document has been moved to trash.",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#10b981",
                background: "#ffffff",
                color: "#1f2937",
              });
              // Refresh the content to remove the deleted document
              if (fetchContent) {
                fetchContent();
              }
            } else {
              Swal.fire({
                title: "❌ Delete Failed",
                text:
                  result.error ||
                  "Failed to delete document. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ef4444",
                background: "#ffffff",
                color: "#1f2937",
              });
            }
          } catch (error) {
            console.error("Error deleting document:", error);
            Swal.fire({
              title: "❌ Error",
              text: "An unexpected error occurred while deleting the document.",
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#ef4444",
              background: "#ffffff",
              color: "#1f2937",
            });
          } finally {
            setDeletingDocumentId(null);
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
    [apiCall, fetchContent]
  );

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
    deletingDocumentId,
  };
};
