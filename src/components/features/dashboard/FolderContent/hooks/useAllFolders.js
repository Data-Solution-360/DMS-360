"use client";

import { useApi } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/lib/constants";
import { useCallback, useEffect, useState } from "react";

export const useAllFolders = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiCall } = useApi();

  const fetchAllFolders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all folders (no parentId parameter)
      const response = await apiCall(`${API_ENDPOINTS.FOLDERS.BASE}`);

      if (response.success) {
        setFolders(response.data || []);
      } else {
        setError(response.error || "Failed to fetch folders");
        setFolders([]);
      }
    } catch (error) {
      console.error("Error fetching all folders:", error);
      setError(error.message || "Failed to fetch folders");
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Fetch folders on mount
  useEffect(() => {
    fetchAllFolders();
  }, [fetchAllFolders]);

  return {
    folders,
    loading,
    error,
    refetch: fetchAllFolders,
  };
};
