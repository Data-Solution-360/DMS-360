"use client";

import axios from "axios";
import { useState } from "react";
import VersionHistoryModal from "./VersionHistoryModal";
import VersionUploadModal from "./VersionUploadModal";
// Temporary icon replacements
const FiDownload = () => <span>⬇️</span>;
const FiEye = () => <span>👁️</span>;
const FiFile = () => <span>📄</span>;
const FiFolder = () => <span>📁</span>;
const FiSearch = () => <span>🔍</span>;
const FiTag = () => <span>🏷️</span>;
const FiTrash2 = () => <span>🗑️</span>;
const FiMapPin = () => <span>📍</span>;
const FiPlus = () => <span>➕</span>;
const FiClock = () => <span>🕒</span>;

export default function DocumentList({
  documents = [],
  searchQuery,
  onViewDocument,
  isRefreshing = false,
  onRefresh,
  userId,
}) {
  const [showContentPreview, setShowContentPreview] = useState({});
  const [versionUploadModal, setVersionUploadModal] = useState({
    isOpen: false,
    document: null,
  });
  const [versionHistoryModal, setVersionHistoryModal] = useState({
    isOpen: false,
    document: null,
  });

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📊";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "📈";
    return "📄";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (document) => {
    window.open(document.googleDriveUrl, "_blank");
  };

  const handleViewDocument = (document) => {
    // If the document has a folder, expand to that folder location
    if (document.folderId && onViewDocument) {
      // Handle both populated and unpopulated folderId
      const folderId =
        typeof document.folderId === "object"
          ? document.folderId._id
          : document.folderId;

      console.log("Navigating to folder:", folderId);
      onViewDocument(folderId);
    } else {
      console.log("No folder to navigate to or onViewDocument not provided");
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await axios.delete(`/api/documents/${documentId}`);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const toggleContentPreview = (documentId) => {
    setShowContentPreview((prev) => ({
      ...prev,
      [documentId]: !prev[documentId],
    }));
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(
      regex,
      '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
    );
  };

  const highlightTags = (tags, searchTerm) => {
    if (!searchTerm || !tags || tags.length === 0) return tags;

    return tags.map((tag) => {
      if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
        return `<mark class="bg-yellow-200 px-1 rounded">${tag}</mark>`;
      }
      return tag;
    });
  };

  const handleDocumentClick = (document) => {
    // Show document details in a modal or expand the document
    const details = `
📄 Document Details:
Name: ${document.originalName}
Size: ${formatFileSize(document.size)}
Type: ${document.mimeType}
Created: ${new Date(document.createdAt).toLocaleString()}
Uploaded by: ${document.uploadedBy?.name || "Unknown"}
Email: ${document.uploadedBy?.email || "N/A"}
Tags: ${document.tags.join(", ") || "None"}
Folder: ${document.folderId?.name || "Root"}
    `;

    alert(details);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FiFile className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? "No documents found" : "No documents found"}
        </h3>
        <p className="text-gray-500">
          {searchQuery
            ? `No documents match "${searchQuery}". Try different keywords.`
            : "Upload your first document to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 text-sm font-medium">
              Refreshing documents...
            </span>
          </div>
        </div>
      )}

      {/* Search Results Header */}
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <FiSearch className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <span className="text-blue-800 font-medium">
                Search Results for "{searchQuery}"
              </span>
              <div className="text-blue-600 text-sm mt-1">
                Searching in: Document titles and tags
              </div>
            </div>
            <span className="text-blue-600 text-sm font-medium">
              {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
              found
            </span>
          </div>
        </div>
      )}

      {documents.map((document) => (
        <div
          key={document._id}
          className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => handleDocumentClick(document)}
        >
          {/* Document Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{getFileIcon(document.mimeType)}</div>

              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-medium text-gray-900 truncate"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(
                      document.originalName,
                      searchQuery
                    ),
                  }}
                />
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>{formatFileSize(document.size)}</span>
                  <span>•</span>
                  <span>
                    {new Date(document.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {document.uploadedBy && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <span>👤</span>
                        <span>{document.uploadedBy.name}</span>
                      </div>
                    </>
                  )}
                  {document.folderId && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <FiFolder className="h-3 w-3" />
                        <span>{document.folderId.name}</span>
                      </div>
                    </>
                  )}
                  {document.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <FiTag className="h-3 w-3" />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightTags(
                              document.tags,
                              searchQuery
                            ).join(", "),
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Version History Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVersionHistoryModal({
                    isOpen: true,
                    document: document,
                  });
                }}
                className="p-2 text-gray-400 hover:text-purple-600 rounded-md hover:bg-purple-50 transition-colors"
                title="Version History"
              >
                <FiClock className="h-4 w-4" />
              </button>

              {/* Upload New Version Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVersionUploadModal({
                    isOpen: true,
                    document: document,
                  });
                }}
                className="p-2 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                title="Upload New Version"
              >
                <FiPlus className="h-4 w-4" />
              </button>

              {/* Content Preview Button for String Documents */}
              {document.mimeType === "text/plain" && document.content && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleContentPreview(document._id);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  title="Preview Content"
                >
                  <FiEye className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDocument(document);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                title="Navigate to document's folder location"
              >
                <FiMapPin className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(document);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                title="Download"
              >
                <FiDownload className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(document._id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                title="Delete"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content Preview for String Documents */}
          {document.mimeType === "text/plain" &&
            document.content &&
            showContentPreview[document._id] && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Content Preview:
                  </h4>
                  <pre
                    className="text-sm text-gray-800 whitespace-pre-wrap font-mono"
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerm(
                        document.content,
                        searchQuery
                      ),
                    }}
                  />
                </div>
              </div>
            )}
        </div>
      ))}

      <div>
        {/* Version Upload Modal */}
        {versionUploadModal.isOpen && (
          <VersionUploadModal
            isOpen={versionUploadModal.isOpen}
            onClose={() =>
              setVersionUploadModal({ isOpen: false, document: null })
            }
            document={versionUploadModal.document}
            onSuccess={() => {
              console.log("Version upload successful, triggering refresh");
              onRefresh();
            }}
            userId={userId}
          />
        )}
      </div>

      {/* Version History Modal */}
      {versionHistoryModal.isOpen && (
        <VersionHistoryModal
          isOpen={versionHistoryModal.isOpen}
          onClose={() =>
            setVersionHistoryModal({ isOpen: false, document: null })
          }
          document={versionHistoryModal.document}
          onRestore={onRefresh}
        />
      )}
    </div>
  );
}
