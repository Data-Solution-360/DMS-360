"use client";

import { useState } from "react";

export default function VersionButton({
  document,
  onShowHistory,
  onShowUpload,
  loading = false,
  variant = "dropdown", // 'dropdown', 'buttons', 'icon'
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (variant === "buttons") {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={onShowHistory}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          title="View Version History"
        >
          📋 History
        </button>
        <button
          onClick={onShowUpload}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
          title="Upload New Version"
        >
          📤 New Version
        </button>
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
          title="Version Management"
        >
          <span className="text-lg">🔄</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
            <button
              onClick={() => {
                onShowHistory();
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <span>📋</span>
              <span>Version History</span>
            </button>
            <button
              onClick={() => {
                onShowUpload();
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 border-t border-gray-100"
            >
              <span>📤</span>
              <span>Upload New Version</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center space-x-1"
      >
        <span>🔄</span>
        <span>v{document.version || 1}</span>
        <span className="text-xs">▼</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
            Version {document.version || 1} •{" "}
            {document.isLatestVersion ? "Latest" : "Previous"}
          </div>
          <button
            onClick={() => {
              onShowHistory();
              setShowDropdown(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <span>📋</span>
            <span>View History</span>
          </button>
          <button
            onClick={() => {
              onShowUpload();
              setShowDropdown(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 border-t border-gray-100"
          >
            <span>📤</span>
            <span>New Version</span>
          </button>
        </div>
      )}
    </div>
  );
}
