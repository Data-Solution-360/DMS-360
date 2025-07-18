"use client";

import React from "react";
import { FiAlertCircle, FiCheck, FiFile } from "react-icons/fi";

export default function UploadProgress({
  selectedFiles,
  uploadProgress,
  uploadResults,
}) {
  const getStatusIcon = (result, fileId) => {
    const progress = uploadProgress[fileId];

    if (progress?.status === "uploading") {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
      );
    }

    if (!result) return <FiFile className="text-gray-400" />;

    switch (result.status) {
      case "success":
        return <FiCheck className="text-green-400" />;
      case "error":
        return <FiAlertCircle className="text-red-400" />;
      default:
        return <FiFile className="text-gray-400" />;
    }
  };

  const getStatusText = (result, fileId) => {
    const progress = uploadProgress[fileId];

    if (progress?.status === "uploading") {
      return `Uploading... ${progress.progress}%`;
    }

    if (!result) return "Pending";

    switch (result.status) {
      case "success":
        return "Upload successful";
      case "error":
        return `Failed: ${result.error}`;
      default:
        return "Pending";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (selectedFiles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">
        Upload Progress ({selectedFiles.length} files)
      </h3>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {selectedFiles.map((fileObj) => {
          const result = uploadResults.find((r) => r.fileId === fileObj.id);
          const progress = uploadProgress[fileObj.id];
          const progressValue = progress?.progress || 0;

          return (
            <div
              key={fileObj.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(result, fileObj.id)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(fileObj.file.size)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 ml-2">
                  {getStatusText(result, fileObj.id)}
                </span>
              </div>

              {/* Progress Bar */}
              {progress?.status === "uploading" && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressValue}%` }}
                  ></div>
                </div>
              )}

              {/* Error Details */}
              {result?.status === "error" && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-800/30 rounded text-red-400 text-xs">
                  {result.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
