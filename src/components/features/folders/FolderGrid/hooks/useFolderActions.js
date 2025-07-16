"use client";

export function useFolderActions({
  selectedFolder,
  onFolderSelect,
  onFolderCreated,
  fetchFolders,
  fetchDocuments,
  setSelectedParentId,
  setShowCreateModal,
  setShowUploadModal,
}) {
  const handleCreateFolder = (e) => {
    e.stopPropagation();
    setSelectedParentId(selectedFolder?._id || null);
    setShowCreateModal(true);
  };

  const handleUploadDocuments = (e) => {
    e.stopPropagation();

    if (!selectedFolder) {
      // Show a helpful message when no folder is selected
      alert(
        "Please select a folder first to upload documents. You can select any folder from the sidebar or create a new folder."
      );
      return;
    }

    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    // Refresh documents after successful upload
    if (selectedFolder) {
      fetchDocuments();
    }
  };

  const handleFolderCreated = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await fetchFolders();
    if (onFolderCreated) {
      onFolderCreated();
    }
  };

  const handleDeleteFolder = async (e, folder) => {
    e.stopPropagation();

    const confirmMessage = `Are you sure you want to delete the folder "${folder.name}"?\n\nThis action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/folders?folderId=${folder._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchFolders();
        // Clear selection if the deleted folder was selected
        if (selectedFolder?._id === folder._id) {
          onFolderSelect(null);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to delete folder"}`);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder");
    }
  };

  const handleDeleteDocument = async (e, document) => {
    e.stopPropagation();

    const documentName =
      document.name ||
      document.originalName ||
      document.title ||
      document.filename ||
      "Untitled";
    const confirmMessage = `Are you sure you want to delete the document "${documentName}"?\n\nThis action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${document._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDocuments();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to delete document"}`);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  return {
    handleCreateFolder,
    handleUploadDocuments,
    handleUploadSuccess,
    handleFolderCreated,
    handleDeleteFolder,
    handleDeleteDocument,
  };
}
