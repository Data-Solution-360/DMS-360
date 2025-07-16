"use client";

import { useEffect, useState } from "react";
import Modal from "react-modal";

export default function VersionHistoryModal({
  isOpen,
  onClose,
  document,
  onRestore,
}) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState("");

  useEffect(() => {
    if (isOpen && document) {
      fetchVersions();
    }
  }, [isOpen, document]);

  // Add a key to force re-render when document changes
  const modalKey = `${document?.id}-${isOpen}`;

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${document.id}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions);
      }
    } catch (error) {
      console.error("Error fetching versions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId) => {
    if (
      !confirm(
        "Are you sure you want to restore this version? This will create a new version with the restored content."
      )
    ) {
      return;
    }

    setRestoring(true);
    setRestoreError("");

    try {
      const response = await fetch(`/api/documents/${versionId}/restore`, {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Version restored successfully:", result);
        onRestore();
        onClose();
      } else {
        setRestoreError(result.error || "Failed to restore version");
        console.error("Restore failed:", result);
      }
    } catch (error) {
      console.error("Error restoring version:", error);
      setRestoreError("Network error occurred while restoring version");
    } finally {
      setRestoring(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      key={modalKey}
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Version History"
      overlayClassName="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden outline-none"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Version History
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchVersions}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
            title="Refresh versions"
          >
            <span className="text-lg">🔄</span>
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Document:</h3>
          <p className="text-gray-600">{document.originalName}</p>
        </div>

        {restoreError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{restoreError}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading versions...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No version history available</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  version.isLatestVersion
                    ? "border-purple-300 bg-purple-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          version.isLatestVersion
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        Version {version.version}
                        {version.isLatestVersion && " (Current)"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(version.createdAt)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <p>
                        <strong>Uploaded by:</strong> {version.uploadedBy?.name}
                      </p>
                      <p>
                        <strong>File:</strong> {version.originalName}
                      </p>
                      <p>
                        <strong>Size:</strong>{" "}
                        {(version.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {version.tags && version.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {version.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <a
                      href={version.firebaseStorageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors text-center"
                    >
                      View
                    </a>

                    {!version.isLatestVersion && (
                      <button
                        onClick={() => handleRestore(version.id)}
                        disabled={restoring}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {restoring ? "Restoring..." : "Restore"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
