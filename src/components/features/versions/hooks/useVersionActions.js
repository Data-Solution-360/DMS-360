"use client";

import { useState } from "react";
import { clientUploadService } from "../../../../lib/clientUpload.js";

export function useVersionActions({ document, userId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      const response = await fetch("/api/documents/upload-version", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      if (onSuccess) {
        onSuccess(result.data);
      }

      return result.data;
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
      const response = await fetch(`/api/documents/${versionId}/restore`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Restore failed");
      }

      if (onSuccess) {
        onSuccess(result.data);
      }

      return result.data;
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
