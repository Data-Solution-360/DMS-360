"use client";

import { useEffect, useState } from "react";
import { auth } from "../../../../lib/firebase";

export function useVersionHistory(originalDocumentId, refreshTrigger = 0) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get fresh ID token
  const getFreshIdToken = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Authentication required");
    }

    try {
      // Try to get a fresh token
      return await user.getIdToken(true);
    } catch (error) {
      console.warn("Failed to refresh token:", error);
      // If quota exceeded or other Firebase errors, try to get the current token
      try {
        return await user.getIdToken(false); // Don't force refresh
      } catch (fallbackError) {
        console.error("Failed to get token:", fallbackError);
        throw new Error("Authentication required");
      }
    }
  };

  const fetchVersions = async () => {
    if (!originalDocumentId) return;

    setLoading(true);
    setError(null);

    try {
      // Get the current user's ID token
      const idToken = await getFreshIdToken();

      const response = await fetch(
        `/api/documents?originalDocumentId=${originalDocumentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Check if the response has the expected structure
        const documents = data.data || data.documents || [];
        setVersions(documents);
      } else {
        setError(data.error || "Failed to load versions");
        setVersions([]);
      }
    } catch (err) {
      console.error("useVersionHistory - Error:", err);
      setError(err.message || "Failed to load versions");
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [originalDocumentId, refreshTrigger]);

  const refresh = () => {
    fetchVersions();
  };

  return { versions, loading, error, refresh };
}
