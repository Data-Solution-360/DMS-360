"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export function useVersionHistory(originalDocumentId, refreshTrigger = 0) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!originalDocumentId) return;
    setLoading(true);

    axios
      .get(`/api/documents?originalDocumentId=${originalDocumentId}`)
      .then((res) => {
        // Check if the response has the expected structure
        const documents = res.data.data || res.data.documents || [];
        setVersions(documents);
        setError(null);
      })
      .catch((err) => {
        console.error("useVersionHistory - Error:", err);
        setError(err.message || "Failed to load versions");
        setVersions([]);
      })
      .finally(() => setLoading(false));
  }, [originalDocumentId, refreshTrigger]);

  const refresh = () => {
    setLoading(true);
    axios
      .get(`/api/documents?originalDocumentId=${originalDocumentId}`)
      .then((res) => {
        const documents = res.data.data || res.data.documents || [];
        setVersions(documents);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load versions");
        setVersions([]);
      })
      .finally(() => setLoading(false));
  };

  return { versions, loading, error, refresh };
}
