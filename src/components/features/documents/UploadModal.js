"use client";

import React, { useEffect, useState } from "react";
import { FiAlertCircle, FiCheck, FiUpload, FiX } from "react-icons/fi";

export default function UploadModal({ folderId, onClose, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    // Fetch available tags
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
    const selectedFiles = Array.from(e.target.files).map((file) => ({
      file,
      id: Date.now() + Math.random(),
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setUploading(true);
    setUploadProgress({});

    const uploadPromises = files.map(async (fileObj) => {
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
          setUploadProgress((prev) => ({
            ...prev,
            [fileObj.id]: { status: "completed", progress: 100 },
          }));
          return { success: true, data: data.data };
        } else {
          setUploadProgress((prev) => ({
            ...prev,
            [fileObj.id]: { status: "error", error: data.error },
          }));
          return { success: false, error: data.error };
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadProgress((prev) => ({
          ...prev,
          [fileObj.id]: { status: "error", error: error.message },
        }));
        return { success: false, error: error.message };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((r) => r.success);

      if (successfulUploads.length > 0) {
        if (onUploadSuccess) {
          onUploadSuccess(successfulUploads);
        }

        // Clear files after successful upload
        setTimeout(() => {
          setFiles([]);
          setSelectedTags([]);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }

    setUploading(false);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag.name)
        ? prev.filter((t) => t !== tag.name)
        : [...prev, tag.name]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

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
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag.name)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Files
            </h3>
            <div className="space-y-2">
              {files.map((fileObj) => {
                const progress = uploadProgress[fileObj.id];
                return (
                  <div
                    key={fileObj.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">
                        {fileObj.file.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({Math.round(fileObj.file.size / 1024)} KB)
                      </span>
                    </div>
                    <div className="flex items-center">
                      {progress?.status === "completed" && (
                        <FiCheck className="text-green-500" />
                      )}
                      {progress?.status === "error" && (
                        <FiAlertCircle className="text-red-500" />
                      )}
                      {!uploading && (
                        <button
                          onClick={() => removeFile(fileObj.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
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

        {/* Upload Button */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
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
    </div>
  );
}
