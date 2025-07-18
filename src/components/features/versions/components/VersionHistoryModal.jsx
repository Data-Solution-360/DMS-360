"use client";

import { useState } from "react";
import Modal from "react-modal";
import { formatTimestamp } from "../../../../lib/utils.js";
import { useVersionActions } from "../hooks/useVersionActions";
import { useVersionHistory } from "../hooks/useVersionHistory";
import {
  formatFileSize,
  formatVersionDisplay,
  sortVersions,
} from "../utils/versionHelpers";

export default function VersionHistoryModal({
  isOpen,
  onClose,
  document,
  onRestore,
  refreshTrigger = 0,
}) {
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState("");

  // Use originalDocumentId for fetching all versions
  const { versions, loading, error, refresh } = useVersionHistory(
    document.originalDocumentId || document.id,
    refreshTrigger
  );

  const { restoreVersion } = useVersionActions({
    document,
    onSuccess: handleRestoreSuccess,
  });

  async function handleRestoreSuccess() {
    setRestoring(false);
    setRestoreError("");
    if (onRestore) {
      onRestore();
    }
    refresh();
  }

  const handleRestore = async (versionDocument) => {
    if (
      !confirm(
        `Are you sure you want to restore version ${versionDocument.version}? This will create a new version with the restored content.`
      )
    ) {
      return;
    }

    setRestoring(true);
    setRestoreError("");

    try {
      await restoreVersion(versionDocument.id);
    } catch (error) {
      setRestoreError(error.message || "Failed to restore version");
    }
  };

  const sortedVersions = sortVersions(versions);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Version History"
      overlayClassName="fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden outline-none border border-gray-700"
      shouldCloseOnOverlayClick={!restoring}
      shouldCloseOnEsc={!restoring}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Version History
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={refresh}
            disabled={loading || restoring}
            className="p-2 text-gray-400 hover:text-blue-400 rounded-md hover:bg-blue-500/10 transition-colors disabled:opacity-50"
            title="Refresh versions"
          >
            <span className="text-lg">🔄</span>
          </button>
          <button
            onClick={onClose}
            disabled={restoring}
            className="text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>
      </div>

      <div className="p-6 bg-gray-900">
        {/* Restore Loading Overlay */}
        {restoring && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                <div>
                  <p className="text-white font-medium">Restoring version...</p>
                  <p className="text-gray-400 text-sm">
                    Please wait while we create the new version.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 mb-6 border border-blue-700/30">
          <h3 className="font-semibold text-gray-200 mb-2">Document:</h3>
          <p className="text-gray-300">{document.originalName}</p>
          <p className="text-sm text-gray-400">
            Current Version:{" "}
            {formatVersionDisplay(document.version, document.isLatestVersion)}
          </p>
        </div>

        {restoreError && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{restoreError}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">
              Error loading versions: {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading version history...</p>
          </div>
        ) : sortedVersions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-400">No version history available</p>
            <p className="text-sm text-gray-500 mt-2">
              This document doesn't have any version history yet.
            </p>
            {/* Temporary debugging info */}
            <div className="mt-4 p-4 bg-gray-800 rounded text-xs text-left">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>Versions length: {versions?.length || 0}</p>
              <p>Sorted versions length: {sortedVersions?.length || 0}</p>
              <p>Loading: {loading ? "true" : "false"}</p>
              <p>Error: {error || "none"}</p>
              <p>
                OriginalDocumentId: {document.originalDocumentId || document.id}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedVersions.map((version) => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  version.isLatestVersion
                    ? "border-purple-500/50 bg-purple-900/20 shadow-md"
                    : "border-gray-700 bg-gray-800/50 hover:bg-gray-800/70 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          version.isLatestVersion
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-gray-700/50 text-gray-300 border border-gray-600"
                        }`}
                      >
                        {formatVersionDisplay(
                          version.version,
                          version.isLatestVersion
                        )}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatTimestamp(version.createdAt, "short")}
                      </span>
                      {version.isLatestVersion && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-3">
                      <div>
                        <p>
                          <strong>Uploaded by:</strong>{" "}
                          {version.uploadedBy?.name ||
                            version.createdByName ||
                            "Unknown"}
                        </p>
                        <p>
                          <strong>Email:</strong>{" "}
                          {version.uploadedBy?.email ||
                            version.createdByEmail ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>File:</strong> {version.originalName}
                        </p>
                        <p>
                          <strong>Size:</strong> {formatFileSize(version.size)}
                        </p>
                      </div>
                    </div>

                    {version.tags && version.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {version.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                          >
                            {typeof tag === "string"
                              ? tag
                              : tag.displayName || tag.name || "Unnamed Tag"}
                          </span>
                        ))}
                      </div>
                    )}

                    {version.description && (
                      <div className="bg-gray-800/50 rounded-md p-3 mt-3 border border-gray-700">
                        <p className="text-sm text-gray-300">
                          <strong>Description:</strong> {version.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {version.firebaseStorageUrl && (
                      <a
                        href={version.firebaseStorageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                      >
                        📥 Download
                      </a>
                    )}
                    {!version.isLatestVersion && (
                      <button
                        onClick={() => handleRestore(version)}
                        disabled={restoring}
                        className={`px-3 py-1 text-sm rounded transition-colors border ${
                          restoring
                            ? "bg-gray-500/20 text-gray-400 border-gray-600 cursor-not-allowed"
                            : "bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/30"
                        }`}
                      >
                        {restoring ? (
                          <span className="flex items-center space-x-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-green-300"></div>
                            <span>Restoring...</span>
                          </span>
                        ) : (
                          "🔄 Restore"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
