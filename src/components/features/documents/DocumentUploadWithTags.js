"use client";

import { collection, getDocs } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useApi } from "../../../hooks/useApi";
import { API_ENDPOINTS, UPLOAD_CONFIG } from "../../../lib/constants";
import { db } from "../../../lib/firebase";
import { uploadFileToFirebase } from "../../../lib/firebaseUpload";
import { TagDisplay, TagSearch } from "../tags";

// Icons (you can replace with actual icon components)
const UploadIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const FileIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const XIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function DocumentUploadWithTags({
  folderId,
  onClose,
  onUploadSuccess,
}) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStep, setUploadStep] = useState("file"); // file, details, uploading, success
  const fileInputRef = useRef(null);
  const { apiCall } = useApi();

  useEffect(() => {
    async function fetchTestCollection() {
      try {
        const querySnapshot = await getDocs(collection(db, "testCollection"));
        const docsArray = [];
        querySnapshot.forEach((doc) => {
          docsArray.push({ id: doc.id, ...doc.data() });
        });
        console.log("[Firestore] All documents in testCollection:", docsArray);
      } catch (err) {
        console.error("[Firestore] Failed to fetch testCollection:", err);
      }
    }
    fetchTestCollection();
  }, []);

  const handleTagSelect = (tag) => {
    if (!selectedTags.find((t) => t._id === tag._id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag._id !== tagToRemove._id));
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file size
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      alert(
        `File size must be less than ${
          UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
        }MB`
      );
      return;
    }

    // Validate file type
    if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      alert("File type not supported. Please select a valid file.");
      return;
    }

    setSelectedFile(file);
    setDocumentName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension for name
    setUploadStep("details");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentName.trim()) {
      alert("Please enter a document name");
      return;
    }

    if (selectedTags.length === 0) {
      alert("Please select at least one tag");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadStep("uploading");
    setUploadProgress(0);

    try {
      // 1. Upload file to Firebase Storage
      const path = `documents/${folderId || "root"}/${Date.now()}-${
        selectedFile.name
      }`;
      const downloadURL = await uploadFileToFirebase(
        selectedFile,
        path,
        setUploadProgress
      );

      // 2. Save metadata and downloadURL to MongoDB via backend
      const response = await apiCall(API_ENDPOINTS.DOCUMENTS.UPLOAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: documentName,
          description: documentDescription,
          folderId,
          tags: selectedTags.map((tag) => tag._id),
          url: downloadURL,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      if (response.success) {
        setUploadStep("success");
        setUploadProgress(100);

        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess();
        }

        // Auto close after 2 seconds
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 2000);
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload document. Please try again.");
      setUploadStep("details");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedTags([]);
    setDocumentName("");
    setDocumentDescription("");
    setSelectedFile(null);
    setUploadStep("file");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const goBack = () => {
    if (uploadStep === "details") {
      setUploadStep("file");
      setSelectedFile(null);
      setDocumentName("");
      setDocumentDescription("");
    }
  };

  // File upload step
  if (uploadStep === "file") {
    return (
      <div className="bg-transparent rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadIcon />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Upload Document
          </h2>
          <p className="text-gray-300">
            Select a file to upload to Google Drive and store in our database
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? "border-blue-400 bg-blue-900/20"
              : "border-gray-600 hover:border-gray-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileIcon />
          </div>
          <p className="text-lg font-medium text-gray-200 mb-2">
            Drop your file here
          </p>
          <p className="text-gray-400 mb-4">
            or click to browse from your computer
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            accept={UPLOAD_CONFIG.ALLOWED_TYPES.join(",")}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Supported formats: PDF, Word, Excel, PowerPoint, Images, Videos,
            Archives
          </p>
          <p className="text-sm text-gray-400">
            Max file size: {UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB
          </p>
        </div>
      </div>
    );
  }

  // Document details step
  if (uploadStep === "details") {
    return (
      <div className="bg-transparent rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={goBack}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Document Details
              </h2>
              <p className="text-gray-300">Add metadata and tags</p>
            </div>
          </div>
        </div>

        {/* File preview */}
        <div className="bg-gray-700 border border-gray-600 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <FileIcon />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-200">{selectedFile?.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Document Name *
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              placeholder="Enter document name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              placeholder="Enter document description"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Tags *
            </label>
            <TagSearch
              onTagSelect={handleTagSelect}
              placeholder="Search and select tags..."
            />

            {selectedTags.length > 0 && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Selected Tags:
                </label>
                <TagDisplay tags={selectedTags} onRemoveTag={handleRemoveTag} />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={uploading}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
            >
              Reset
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Uploading step
  if (uploadStep === "uploading") {
    return (
      <div className="bg-transparent rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <UploadIcon />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Uploading to Cloud Storage
          </h2>
          <p className="text-gray-300 mb-6">
            Please wait while we upload your document...
          </p>

          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">{uploadProgress}% complete</p>
        </div>
      </div>
    );
  }

  // Success step
  if (uploadStep === "success") {
    return (
      <div className="bg-transparent rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckIcon />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Upload Successful!
          </h2>
          <p className="text-gray-300 mb-6">
            Your document has been uploaded and saved to our database.
          </p>
          <div className="bg-gray-700 border border-gray-600 rounded-xl p-4">
            <p className="text-green-400 font-medium">{documentName}</p>
            <p className="text-green-300 text-sm">Successfully uploaded</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
