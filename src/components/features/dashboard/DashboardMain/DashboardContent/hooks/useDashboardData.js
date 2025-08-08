import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../../../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../../../../lib/constants";
import { useAuth } from "../../../../../../store/AuthContext";

export const useDashboardData = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [rootFolders, setRootFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { apiCall } = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    try {
      setLoading(true);

      const foldersResponse = await apiCall(API_ENDPOINTS.FOLDERS.BASE);

      if (foldersResponse.success) {
        const foldersWithCounts = await Promise.all(
          foldersResponse.data.map(async (folder) => {
            try {
              const docResponse = await apiCall(
                `${API_ENDPOINTS.DOCUMENTS.BASE}?folderId=${folder.id}`
              );
              const docCount = docResponse.success
                ? docResponse.pagination.total
                : 0;

              return {
                ...folder,
                id: folder.id,
                documentCount: docCount,
              };
            } catch (error) {
              console.error(
                `Error getting document count for folder ${folder.id}:`,
                error
              );
              return {
                ...folder,
                id: folder.id,
                documentCount: 0,
              };
            }
          })
        );

        // Filter only root folders (no parentId)
        const onlyRootFolders = foldersWithCounts.filter(
          (folder) => !folder.parentId
        );

        // Sort root folders by name
        onlyRootFolders.sort((a, b) => a.name.localeCompare(b.name));

        setRootFolders(onlyRootFolders);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);

      // Handle authentication errors
      if (
        error.message?.includes("Authentication required") ||
        error.message?.includes("Authentication failed")
      ) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          router.push("/login");
        }
        return;
      }

      setRootFolders([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall, isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadDashboardData();
    }
  }, [isAuthenticated, authLoading, loadDashboardData]);

  return {
    currentFolder,
    setCurrentFolder,
    rootFolders,
    loading,
    loadDashboardData,
  };
};
