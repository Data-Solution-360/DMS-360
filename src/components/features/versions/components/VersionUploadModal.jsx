"use client";

import { useState } from "react";
import Modal from "react-modal";
import { useVersionActions } from "../hooks/useVersionActions";
import {
  formatFileSize,
  generateNextVersion,
  validateVersionFile,
} from "../utils/versionHelpers";

export default function VersionUploadModal({
  isOpen,
  onClose,
  document,
  onSuccess,
  userId,
}) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [emailStatus, setEmailStatus] = useState("");

  const { uploadVersion } = useVersionActions({
    document,
    userId,
    onSuccess: handleUploadSuccess,
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validation = validateVersionFile(selectedFile, document);

      if (validation.isValid) {
        setFile(selectedFile);
        setError("");
        setValidationErrors([]);
      } else {
        setFile(null);
        setValidationErrors(validation.errors);
        setError("");
      }
    }
  };

  async function handleUploadSuccess(newVersion) {
    setProgress(100);
    setEmailStatus("📧 Sending notifications to document collaborators...");

    // Wait a moment to show the email status
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(newVersion);
      }
      handleClose();
    }, 2000);
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    const validation = validateVersionFile(file, document);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");
    setValidationErrors([]);

    try {
      const metadata = {
        description: description.trim(),
        version: generateNextVersion([document]), // Calculate next version
      };

      // Pass progress callback to upload function
      await uploadVersion(file, metadata, (progressPercent) => {
        setProgress(progressPercent);
      });
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFile(null);
    setDescription("");
    setProgress(0);
    setError("");
    setValidationErrors([]);
    setEmailStatus("");
  };

  const nextVersion = generateNextVersion([document]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Upload New Version"
      overlayClassName="fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden outline-none border border-gray-700"
      shouldCloseOnOverlayClick={!uploading}
      shouldCloseOnEsc={!uploading}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Upload New Version
        </h2>
        <button
          onClick={handleClose}
          disabled={uploading}
          className="text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
        >
          <span className="text-2xl">✕</span>
        </button>
      </div>

      <div className="p-6 bg-gray-900">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 mb-6 border border-blue-700/30">
          <h3 className="font-semibold text-gray-200 mb-2">Document:</h3>
          <p className="text-gray-300">
            {document.originalName || document.name}
          </p>
          <p className="text-sm text-gray-400">
            Current Version: v{document.version || 1} → New Version: v
            {nextVersion}
          </p>
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
          />

          {file && (
            <div className="mt-3 p-3 bg-gray-800/50 rounded-md border border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>📄 {file.name}</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Version Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
            placeholder="Describe what changed in this version..."
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 resize-none disabled:opacity-50"
            rows={3}
          />
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <h4 className="font-semibold text-red-300 mb-2">
              Validation Errors:
            </h4>
            <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {emailStatus && (
              <p className="text-sm text-blue-300 mt-2">{emailStatus}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload Version"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
