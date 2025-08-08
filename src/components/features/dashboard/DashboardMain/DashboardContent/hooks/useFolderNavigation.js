import { useCallback, useState } from "react";
import { useApi } from "../../../../../../hooks/useApi";

export const useFolderNavigation = (setCurrentFolder) => {
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const { apiCall } = useApi();

  const navigateToFolder = useCallback(
    async (folder) => {
      setCurrentFolder(folder);

      // Build breadcrumb path
      if (folder) {
        // If this is a root folder, clear the path
        if (!folder.parentId) {
          setBreadcrumbPath([{ id: folder.id, name: folder.name }]);
        } else {
          // For nested folders, we need to build the full path
          // This is a simplified version - you might want to fetch the full path
          const newPath = [
            ...breadcrumbPath,
            { id: folder.id, name: folder.name },
          ];
          setBreadcrumbPath(newPath);
        }
      } else {
        // Navigating to root
        setBreadcrumbPath([]);
      }
    },
    [breadcrumbPath, setCurrentFolder]
  );

  const navigateBack = useCallback(() => {
    if (breadcrumbPath.length > 1) {
      // Remove the last item and navigate to the previous folder
      const newPath = breadcrumbPath.slice(0, -1);
      setBreadcrumbPath(newPath);

      if (newPath.length > 0) {
        const previousFolder = newPath[newPath.length - 1];
        // You might need to fetch the full folder data here
        setCurrentFolder({ id: previousFolder.id, name: previousFolder.name });
      } else {
        setCurrentFolder(null);
      }
    } else {
      // Go back to root
      setBreadcrumbPath([]);
      setCurrentFolder(null);
    }
  }, [breadcrumbPath, setCurrentFolder]);

  const handleDocumentAction = useCallback((action, document) => {
    // Handle document actions like view, download, etc.
    console.log("Document action:", action, document);
  }, []);

  return {
    breadcrumbPath,
    navigateToFolder,
    navigateBack,
    handleDocumentAction,
  };
};
