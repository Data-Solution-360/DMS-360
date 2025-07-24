"use client";

import { useState } from "react";
import { formatTimestamp } from "../../../../../lib/utils.js";
import { useAuth } from "../../../../../store/AuthContext";
import { VersionManager } from "../../../versions";

// Temporary icon replacements
const FiDownload = () => <span>📥</span>;
const FiEye = () => <span>👁️</span>;
const FiMoreVertical = () => <span>⋮</span>;

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
        className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/40 hover:to-blue-500/40 text-white/80 hover:text-white border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-110 shadow-lg relative disabled:opacity-50 disabled:cursor-not-allowed"
        title="Version Management"
      >
        <span className="text-lg">🔄</span>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
      </button>

      {/* Version Dropdown */}
      {showDropdown && (
        <>
          <div className="absolute right-full bottom-0 mt-2 mr-1 bg-gray-900/95 border border-gray-700 rounded-lg shadow-xl z-50 min-w-52 backdrop-blur-lg">
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  if (onShowHistory) onShowHistory();
                  setShowDropdown(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-purple-500/20 rounded-md flex items-center space-x-2 transition-colors"
              >
                <span>📋</span>
                <span>View History</span>
              </button>
              <button
                onClick={() => {
                  if (onShowUpload) onShowUpload();
                  setShowDropdown(false);
                }}
                className="w-full px-2 py-2 text-left text-sm text-white hover:bg-blue-500/20 rounded-md flex items-center space-x-2 transition-colors"
              >
                <span>📤</span>
                <span>Upload New Version</span>
              </button>
            </div>
          </div>

          {/* Click outside to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        </>
      )}
    </div>
  );
}

export default function DocumentCard({ document, onAction, onVersionChange }) {
  const { user } = useAuth();

  const handleVersionChange = () => {
    if (onVersionChange) {
      onVersionChange();
    }
  };

  return (
    <div className="group relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-sky-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

      {/* Version Badge */}
      {document.version && (
        <div className="absolute top-4 right-4 z-20">
          <span className="px-2 py-1 bg-gradient-to-r from-purple-500/90 to-blue-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm border border-white/20 shadow-lg">
            v{document.version}
          </span>
        </div>
      )}

      <div className="relative z-10">
        {/* Document icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl group-hover:shadow-sky-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
            {getFileIcon(document.mimeType)}
          </span>
        </div>

        {/* Document info */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-500 line-clamp-2">
            {document.originalName}
          </h3>

          <div className="space-y-2">
            <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
              {document.mimeType}
            </p>

            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{formatFileSize(document.size)}</span>
              <span>{formatTimestamp(document.createdAt, "short")}</span>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 rounded-full border border-emerald-500/30"
                  >
                    {typeof tag === "string"
                      ? tag
                      : tag.displayName || tag.name || "Unnamed Tag"}
                  </span>
                ))}
                {document.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-white/10 text-white/60 rounded-full">
                    +{document.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex space-x-2">
              <button
                onClick={() => onAction("view", document)}
                className="p-2 rounded-lg bg-white/10 hover:bg-sky-500/20 text-white/70 hover:text-sky-300 transition-all duration-300 transform hover:scale-110"
                title="View"
              >
                <FiEye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onAction("download", document)}
                className="p-2 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300 transition-all duration-300 transform hover:scale-110"
                title="Download"
              >
                <FiDownload className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Version Management with Proper Modals */}
              {user && (
                <VersionManager
                  document={document}
                  userId={user.id}
                  onVersionChange={handleVersionChange}
                >
                  <CustomVersionButton document={document} />
                </VersionManager>
              )}

              <button
                onClick={() => onAction("more", document)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110"
                title="More options"
              >
                <FiMoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-sky-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
      <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-1000 transition-opacity duration-500"></div>
    </div>
  );
}
