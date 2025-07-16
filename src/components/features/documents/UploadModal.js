"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Modal from "react-modal";
import Swal from "sweetalert2";
import { TagDisplay, TagSearch } from "../tags";
// Temporary icon replacements
const FiFile = () => <span>📄</span>;
const FiUpload = () => <span>⬆️</span>;
const FiX = () => <span>✕</span>;

export default function UploadModal({ folderId, onClose, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [allTags, setAllTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(
      acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: "pending",
        progress: 0,
      }))
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "text/plain": [".txt"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      "video/*": [".mp4", ".avi", ".mov"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (fileId) => {
    setFiles(files.filter((f) => f.id !== fileId));
  };

  const handleTagSelect = (tag) => {
    // Check if tag is already selected
    if (!selectedTags.find((t) => t._id === tag._id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag._id !== tagToRemove._id));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Files Selected",
        text: "Please select at least one file to upload",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    if (selectedTags.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tags Required",
        text: "Please select at least one tag for the documents",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    if (!folderId) {
      Swal.fire({
        icon: "warning",
        title: "No Folder Selected",
        text: "Please select a folder from the sidebar before uploading files. Files will be uploaded to the root directory if no folder is selected.",
        confirmButtonColor: "#3B82F6",
      });
      // Continue with upload anyway (will use environment variable as fallback)
    }

    setUploading(true);
    const uploadPromises = files.map(async (fileObj) => {
      try {
        const formData = new FormData();
        formData.append("file", fileObj.file);
        formData.append("folderId", folderId);
        formData.append(
          "tags",
          JSON.stringify(selectedTags.map((tag) => tag.name))
        );

        // Create progress tracking
        const updateProgress = (progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileObj.id]: progress,
          }));
        };

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          updateProgress((prev) => {
            const newProgress = Math.min(prev + Math.random() * 20, 90);
            return newProgress;
          });
        }, 200);

        const response = await axios.post("/api/documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              updateProgress(progress);
            }
          },
        });

        clearInterval(progressInterval);
        updateProgress(100);

        return { ...fileObj, status: "success", response: response.data };
      } catch (error) {
        return {
          ...fileObj,
          status: "error",
          error: error.response?.data?.error || "Upload failed",
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    setFiles(results);

    const hasErrors = results.some((r) => r.status === "error");
    if (!hasErrors) {
      // Call onUploadSuccess immediately after successful upload
      onUploadSuccess();

      Swal.fire({
        icon: "success",
        title: "Upload Complete!",
        text: `Successfully uploaded ${results.length} file${
          results.length !== 1 ? "s" : ""
        }`,
        confirmButtonColor: "#10B981",
      });
    } else {
      const errorCount = results.filter((r) => r.status === "error").length;
      Swal.fire({
        icon: "error",
        title: "Upload Issues",
        text: `${errorCount} file${
          errorCount !== 1 ? "s" : ""
        } failed to upload`,
        confirmButtonColor: "#EF4444",
      });
    }

    setUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    // Set the app element for react-modal
    if (typeof window !== "undefined") {
      try {
        Modal.setAppElement("#__next");
      } catch (error) {
        Modal.setAppElement("body");
      }
    }
  }, []);

  useEffect(() => {
    // Fetch all available tags when the component mounts
    const fetchTags = async () => {
      try {
        const response = await axios.get("/api/tags/all");
        if (response.data.success) {
          setAllTags(response.data.data);
        }
        setLoadingTags(false);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  // Custom modal styles with dark theme
  const customModalStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    },
    content: {
      position: "relative",
      background: "#111827",
      borderRadius: "1rem",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      maxWidth: "800px",
      width: "100%",
      maxHeight: "80vh",
      overflow: "auto",
      border: "none",
      outline: "none",
      padding: "0",
      inset: "auto",
    },
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Upload Documents"
      shouldCloseOnOverlayClick={!uploading}
      shouldCloseOnEsc={!uploading}
    >
      <div className="bg-transparent rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={uploading}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Folder Information */}
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">📁</span>
              <div>
                <p className="text-sm font-medium text-blue-300">
                  Upload Location
                </p>
                <p className="text-sm text-gray-300">
                  {folderId
                    ? "Selected folder"
                    : "Root directory (no folder selected)"}
                </p>
              </div>
            </div>
          </div>

          {/* Tags Selection - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Tags *
            </label>
            <TagSearch
              onTagSelect={handleTagSelect}
              placeholder="Search and select tags (required)..."
            />

            {/* Tiny display of all available tags */}
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">Available tags:</div>
              {loadingTags ? (
                <div className="text-xs text-gray-500">Loading tags...</div>
              ) : (
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-gray-700 rounded border border-gray-600">
                  {allTags.length === 0 ? (
                    <span className="text-xs text-gray-500">
                      No tags available
                    </span>
                  ) : (
                    allTags.map((tag) => {
                      const isSelected = selectedTags.find(
                        (t) => t._id === tag._id
                      );

                      return (
                        <span
                          key={tag._id}
                          className={`inline-block px-1.5 py-0.5 text-xs rounded-full border cursor-pointer transition-all duration-200 hover:scale-105 ${
                            isSelected
                              ? "ring-2 ring-blue-500 ring-offset-1"
                              : "hover:shadow-sm"
                          }`}
                          style={{
                            backgroundColor: tag.color || "#6B7280",
                            color: "white",
                            borderColor: tag.color || "#6B7280",
                          }}
                          onClick={() => handleTagSelect(tag)}
                          title={`Click to select: ${tag.name}`}
                        >
                          {tag.name}
                        </span>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Display selected tags */}
            {selectedTags.length > 0 && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Selected Tags:
                </label>
                <TagDisplay tags={selectedTags} onRemoveTag={handleRemoveTag} />
              </div>
            )}

            {/* Warning if no tags selected */}
            {selectedTags.length === 0 && (
              <p className="text-sm text-amber-400 mt-2">
                ⚠️ At least one tag is required to upload documents
              </p>
            )}
          </div>

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-400 bg-blue-900/20"
                : "border-gray-600 hover:border-gray-500"
            }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-300">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-300 mb-2">
                  Drag & drop files here, or click to select files
                </p>
                <p className="text-sm text-gray-400">
                  Supports PDF, Word, Excel, PowerPoint, images, and videos (max
                  100MB)
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-200">
                Selected Files
              </h3>
              {files.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <FiFile className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {fileObj.file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(fileObj.file.size)}
                      </p>

                      {/* Progress Bar */}
                      {uploading && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${uploadProgress[fileObj.id] || 0}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {uploadProgress[fileObj.id] || 0}% uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {fileObj.status === "success" && (
                      <span className="text-green-400 text-sm">✓ Uploaded</span>
                    )}
                    {fileObj.status === "error" && (
                      <span className="text-red-400 text-sm">
                        {fileObj.error}
                      </span>
                    )}
                    {!uploading && (
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={
                files.length === 0 || selectedTags.length === 0 || uploading
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Uploading..." : "Upload Files"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
