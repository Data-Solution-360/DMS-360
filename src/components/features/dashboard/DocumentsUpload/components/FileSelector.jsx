"use client";

import React from "react";
import { FiFile, FiTrash2, FiUpload } from "react-icons/fi";

export default function FileSelector({
  selectedFiles,
  onFileSelect,
  onRemoveFile,
  uploading = false,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedFileTypes = "*/*",
}) {
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      status: "pending",
    }));
    onFileSelect(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Files
        </label>
        <div className="relative">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={uploading}
            accept={acceptedFileTypes}
          />
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
              uploading
                ? "border-gray-600 bg-gray-800 cursor-not-allowed"
                : "border-gray-600 bg-gray-800 hover:border-blue-500 hover:bg-gray-700"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUpload className="w-8 h-8 mb-4 text-gray-400" />
              <p className="mb-2 text-sm text-gray-300">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">
                Multiple files supported (MAX. {formatFileSize(maxFileSize)}{" "}
                each)
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((fileObj) => (
              <div
                key={fileObj.id}
                className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FiFile className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(fileObj.file.size)}
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={() => onRemoveFile(fileObj.id)}
                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
