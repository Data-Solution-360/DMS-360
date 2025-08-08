"use client";

import { useState } from "react";
import { useApi } from "../../../../hooks/useApi";
import { clientUploadService } from "../../../../lib/clientUpload.js";

export function useVersionActions({ document, userId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiCall } = useApi();

  const uploadVersion = async (file, metadata = {}, onProgress) => {
    if (!file || !document) {
      throw new Error("File and document are required");
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload file to Firebase Storage (like regular document upload)
      const uploadResult = await clientUploadService.uploadWithProgress(
        file,
        `documents/${document.id}/versions`,
        onProgress
      );

      // Step 2: Send metadata to API (like regular document upload)
      const documentData = {
        documentId: document.id,
        fileName: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        firebaseStorageUrl: uploadResult.downloadURL,
        firebaseStoragePath: uploadResult.storagePath,
        description: metadata.description || "",
        version: metadata.version || null,
      };

      // Fix: apiCall expects (url, options) not (method, url, data)
      const response = await apiCall("/api/documents/upload-version", {
        method: "POST",
        body: JSON.stringify(documentData),
      });

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data);
        }
        return response.data;
      } else {
        throw new Error(response.error || "Upload failed");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (versionId) => {
    if (!versionId) {
      throw new Error("Version ID is required");
    }

    setLoading(true);
    setError(null);

    try {
      // Fix: apiCall expects (url, options) not (method, url)
      const response = await apiCall(`/api/documents/${versionId}/restore`, {
        method: "POST",
      });

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data);
        }
        return response.data;
      } else {
        throw new Error(response.error || "Restore failed");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadVersion,
    restoreVersion,
    loading,
    error,
  };
}
