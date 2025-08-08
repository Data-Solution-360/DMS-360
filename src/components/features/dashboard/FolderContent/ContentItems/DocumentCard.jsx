"use client";

import { useState } from "react";
import { useDownloadTracking } from "../../../../../hooks/useDownloadTracking";
import { formatTimestamp } from "../../../../../lib/utils.js";
import { useAuth } from "../../../../../store/AuthContext";
import { VersionManager } from "../../../versions";

// Temporary icon replacements
const FiDownload = () => <span>📥</span>;
const FiEye = () => <span>👁️</span>;
const FiMoreVertical = () => <span>⋮</span>;
const FiTrash = () => <span>🗑️</span>;

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimeType) => {
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "📊";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "📈";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("video")) return "🎥";
  if (mimeType.includes("audio")) return "🎵";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "📦";
  return "📄";
};

// Custom Version Button Component
function CustomVersionButton({
  onShowHistory,
  onShowUpload,
  document,
  loading,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        className="p-1 hover:bg-gray-100 rounded text-gray-800"
        title="Version Management"
      >
        🔄
      </button>

      {showDropdown && (
        <>
          <div className="absolute right-0 top-0 mt-1 bg-blue-100 border rounded shadow-lg z-50 w-[200px]">
            <button
              onClick={() => {
                if (onShowHistory) onShowHistory();
                setShowDropdown(false);
              }}
              className="w-full text-gray-800 px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2"
            >
              📋 View History
            </button>
            <button
              onClick={() => {
                if (onShowUpload) onShowUpload();
                setShowDropdown(false);
              }}
              className="w-full px-3 text-gray-800 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2"
            >
              📤 Upload New Version
            </button>
          </div>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        </>
      )}
    </div>
  );
}

// Custom More Options Button Component
function CustomMoreButton({ document, onAction, isDeleting }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAction = (action) => {
    onAction(action, document);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-1 hover:bg-gray-100 rounded"
        title="More options"
        disabled={isDeleting}
      >
        <FiMoreVertical />
      </button>

      {showDropdown && (
        <>
          <div className="absolute right-0 top-0 mt-1 bg-white border rounded shadow-lg z-50 w-[200px]">
            <button
              onClick={() => handleAction("download")}
              className="w-full text-gray-800 px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              disabled={isDeleting}
            >
              <FiDownload />
              Download
            </button>
            <button
              onClick={() => handleAction("delete")}
              className="w-full text-red-600 px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash />
                  Delete
                </>
              )}
            </button>
          </div>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        </>
      )}
    </div>
  );
}

export default function DocumentCard({
  document,
  onAction,
  onVersionChange,
  isDeleting = false,
}) {
  const { user } = useAuth();
  const { handleDownload } = useDownloadTracking();

  const handleVersionChange = () => {
    if (onVersionChange) {
      onVersionChange();
    }
  };

  const handleAction = (action) => {
    if (action === "download") {
      handleDownload(document);
    } else {
      onAction(action, document);
    }
  };

  if (isDeleting) {
    return (
      <div className="bg-white border rounded-lg p-4 hover:shadow-sm">
        <div className="flex items-center justify-center flex-col h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          Deleting...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-sm">
      {/* Icon and title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center text-white">
            {getFileIcon(document.mimeType)}
          </div>
          {document.version && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">v{document.version}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 leading-tight break-words line-clamp-2">
            {document.originalName}
          </h3>
        </div>
      </div>

      {/* File info */}
      <div className="flex justify-between text-xs text-gray-500 mb-3">
        <span>{formatFileSize(document.size)}</span>
        <span>{formatTimestamp(document.createdAt, "short")}</span>
      </div>

      {/* Tags */}
      {document.tags && document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {document.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
            >
              {typeof tag === "string"
                ? tag
                : tag.displayName || tag.name || "Unnamed Tag"}
            </span>
          ))}
          {document.tags.length > 2 && (
            <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded">
              +{document.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("view")}
            className="text-xs text-gray-900 px-2 py-1 bg-green-50 hover:bg-green-100 rounded flex items-center gap-1"
            title="View"
            disabled={isDeleting}
          >
            <FiEye />
            View
          </button>
          <button
            onClick={() => handleAction("download")}
            className="text-xs text-gray-900 px-2 py-1 bg-green-50 hover:bg-green-100 rounded flex items-center gap-1"
            title="Download"
            disabled={isDeleting}
          >
            <FiDownload />
            Download
          </button>
        </div>

        <div className="flex items-center gap-1">
          {user && (
            <VersionManager
              document={document}
              userId={user.id}
              onVersionChange={handleVersionChange}
            >
              <CustomVersionButton document={document} loading={isDeleting} />
            </VersionManager>
          )}
          <CustomMoreButton
            document={document}
            onAction={handleAction}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}
