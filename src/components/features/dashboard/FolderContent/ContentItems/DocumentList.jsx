"use client";

import { formatTimestamp } from "../../../../../lib/utils";
import { useAuth } from "../../../../../store/AuthContext";
import { VersionButton, VersionManager } from "../../../versions";

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

const formatDate = (dateString) => {
  return formatTimestamp(dateString, "short");
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

export default function DocumentList({ document, onAction, onVersionChange, isDeleting = false }) {
  const { user } = useAuth();

  const handleVersionChange = () => {
    if (onVersionChange) {
      onVersionChange();
    }
  };

  return (
    <div className="group relative flex items-center p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Document icon */}
      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
        <span className="h-6 w-6 text-white">
          {getFileIcon(document.mimeType)}
        </span>
      </div>

      {/* Document info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors truncate">
          {document.originalName}
        </h3>
        <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors truncate">
          {document.mimeType}
        </p>
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
          <span>{formatFileSize(document.size)}</span>
          <span>{formatDate(document.createdAt)}</span>
          {document.tags && document.tags.length > 0 && (
            <span className="text-blue-600">
              {document.tags.length} tags
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => onAction("view", document)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
          title="View"
          disabled={isDeleting}
        >
          <FiEye className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAction("download", document)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors"
          title="Download"
          disabled={isDeleting}
        >
          <FiDownload className="h-4 w-4" />
        </button>

        {/* Delete button */}
        <button
          onClick={() => onAction("delete", document)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
          title="Delete"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <FiTrash className="h-4 w-4" />
          )}
        </button>

        {/* Version Management Button */}
        {user && (
          <VersionManager
            document={document}
            userId={user.id}
            onVersionChange={handleVersionChange}
          >
            <VersionButton document={document} variant="icon" />
          </VersionManager>
        )}

        <button
          onClick={() => onAction("more", document)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
          title="More options"
          disabled={isDeleting}
        >
          <FiMoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
