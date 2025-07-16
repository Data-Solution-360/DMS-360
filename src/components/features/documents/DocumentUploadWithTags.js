"use client";

import React, { useEffect, useState } from "react";
import { FiAlertCircle, FiCheck, FiUpload, FiX } from "react-icons/fi";

export default function DocumentUploadWithTags({
  folderId,
  onUploadSuccess,
  onCancel,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);

  useEffect(() => {
    fetchAvailableTags();
  }, []);

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();
      if (data.success) {
        setAvailableTags(data.data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      status: "pending",
    }));
    setSelectedFiles(files);
  };

  const removeFile = (fileId) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag.name)
        ? prev.filter((t) => t !== tag.name)
        : [...prev, tag.name]
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setUploading(true);
    setUploadResults([]);

    const uploadPromises = selectedFiles.map(async (fileObj) => {
      try {
        // Create FormData for the file upload
        const formData = new FormData();
        formData.append("file", fileObj.file);
        formData.append("folderId", folderId || "");
        formData.append("tags", JSON.stringify(selectedTags));
        formData.append("description", ""); // Add description if needed

        // Upload using the API endpoint
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          return {
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            status: "success",
            data: data.data,
          };
        } else {
          return {
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            status: "error",
            error: data.error,
          };
        }
      } catch (error) {
        console.error("Upload error:", error);
        return {
          fileId: fileObj.id,
          fileName: fileObj.file.name,
          status: "error",
          error: error.message,
        };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      setUploadResults(results);

      const successfulUploads = results.filter((r) => r.status === "success");

      if (successfulUploads.length > 0 && onUploadSuccess) {
        onUploadSuccess(successfulUploads);
      }

      // Auto close after success if all uploads completed
      if (successfulUploads.length === results.length) {
        setTimeout(() => {
          if (onCancel) {
            onCancel();
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }

    setUploading(false);
  };

  const getStatusIcon = (result) => {
    if (!result) return <FiUpload className="text-gray-400" />;

    switch (result.status) {
      case "success":
        return <FiCheck className="text-green-500" />;
      case "error":
        return <FiAlertCircle className="text-red-500" />;
      default:
        return <FiUpload className="text-gray-400" />;
    }
  };

  const getStatusText = (result) => {
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>

      {/* File Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Files
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading}
        />
      </div>

      {/* Tags Selection */}
      {availableTags.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag)}
                disabled={uploading}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.name)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((fileObj) => {
              const result = uploadResults.find((r) => r.fileId === fileObj.id);
              return (
                <div
                  key={fileObj.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result)}
                    <span className="text-sm">{fileObj.file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round(fileObj.file.size / 1024)} KB)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {getStatusText(result)}
                    </span>
                    {!uploading && !result && (
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagName) => (
              <span
                key={tagName}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {tagName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <FiUpload className="mr-2" />
              Upload Files
            </>
          )}
        </button>
      </div>
    </div>
  );
}
