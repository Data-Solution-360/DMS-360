"use client";

import { useState } from "react";
import Modal from "react-modal";

export default function VersionUploadModal({
  isOpen,
  onClose,
  document,
  onSuccess,
  userId,
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentId", document._id);
      formData.append("userId", userId);

      const response = await fetch("/api/documents/upload-version", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setProgress(100);
        setEmailStatus("📧 Sending notifications to document collaborators...");

        // Call onSuccess immediately to trigger refresh
        onSuccess();
        setTimeout(() => {
          onClose();
          setFile(null);
          setProgress(0);
          setEmailStatus("");
        }, 2000);
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
      setFile(null);
      setProgress(0);
      setError("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Upload New Version"
      overlayClassName="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50"
      className="bg-white rounded-lg p-8 shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto outline-none"
      shouldCloseOnOverlayClick={!uploading}
      shouldCloseOnEsc={!uploading}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Upload New Version
        </h2>
        <button
          onClick={handleClose}
          disabled={uploading}
          className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <span className="text-2xl">✕</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            Current Document:
          </h3>
          <p className="text-gray-600">{document.originalName}</p>
          <p className="text-sm text-gray-500">Version {document.version}</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select New Version File
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
          <input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="version-file-input"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
          />
          <label htmlFor="version-file-input" className="cursor-pointer block">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-600">
              {file ? file.name : "Click to select file"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports: PDF, Word, Excel, PowerPoint, Text, Images
            </p>
          </label>
        </div>
      </div>

      {file && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Selected File:</h4>
            <p className="text-sm text-gray-600">{file.name}</p>
            <p className="text-xs text-gray-500">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="mb-6">
          <div className="bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Uploading... {progress}%
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {emailStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600 text-sm">{emailStatus}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleClose}
          disabled={uploading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {uploading ? "Uploading..." : "Upload Version"}
        </button>
      </div>
    </Modal>
  );
}
