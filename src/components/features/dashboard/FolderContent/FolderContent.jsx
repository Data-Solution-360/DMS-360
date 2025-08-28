"use client";

import { Button, Dropdown, Space, Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../../../hooks/useApi";
import { useDownloadTracking } from "../../../../hooks/useDownloadTracking";
import { formatTimestamp } from "../../../../lib/utils.js";
import UploadModal from "../DocumentsUpload/UploadModal";
import AccessControlModal from "./AccessControlModal";
import ContentEmpty from "./ContentEmpty";
import ContentHeader from "./ContentHeader";
import DocumentCard from "./ContentItems/DocumentCard";
import DocumentList from "./ContentItems/DocumentList";
import FolderCard from "./ContentItems/FolderCard";
import FolderList from "./ContentItems/FolderList";
import ContentToolbar from "./ContentToolbar";
import { useFolderActions } from "./hooks/useFolderActions";
import { useFolderData } from "./hooks/useFolderData";

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimeType) => {
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "📊";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "📈";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("video")) return "🎥";
  if (mimeType.includes("audio")) return "🎵";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "📦";
  return "📄";
};

export default function FolderContent({ currentFolder, onFolderNavigation }) {
  const [viewMode, setViewMode] = useState("table");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAccessControlModal, setShowAccessControlModal] = useState(false);
  const { apiCall } = useApi();
  const { handleDownload } = useDownloadTracking();

  const {
    documents,
    folders,
    loading,
    currentPath,
    folderStats,
    fetchContent,
    updateCurrentPath,
  } = useFolderData(currentFolder, apiCall);

  const {
    navigateToFolder,
    navigateBack,
    handleDocumentAction,
    handleFolderDoubleClick,
    handleUploadSuccess,
    deletingDocumentId,
  } = useFolderActions(currentFolder, onFolderNavigation, fetchContent);

  // Fetch content when current folder changes
  useEffect(() => {
    fetchContent();
  }, [currentFolder, apiCall]);

  // Group documents by originalDocumentId and select only the latest version for each group
  const latestDocuments = useMemo(() => {
    if (!documents || documents.length === 0) {
      return [];
    }

    // Filter out documents that are in trash
    const activeDocuments = documents.filter((doc) => !doc.inTrash);

    const groups = {};

    activeDocuments.forEach((doc) => {
      // Use originalDocumentId if available, otherwise use the document id itself
      const key = doc.originalDocumentId || doc.id;

      // If no document exists in this group yet, add this one
      if (!groups[key]) {
        groups[key] = doc;
        return;
      }

      // If this document is marked as latest, use it
      if (doc.isLatestVersion) {
        groups[key] = doc;
        return;
      }

      // If the existing document is not latest but this one is, use this one
      if (!groups[key].isLatestVersion && doc.isLatestVersion) {
        groups[key] = doc;
        return;
      }

      // If neither is marked as latest, compare versions
      const currentVersion = parseInt(doc.version) || 1;
      const existingVersion = parseInt(groups[key].version) || 1;

      if (currentVersion > existingVersion) {
        groups[key] = doc;
      }
    });

    return Object.values(groups);
  }, [documents]);

  const handleUpload = () => {
    if (!currentFolder) {
      alert("Please select a folder first to upload documents.");
      return;
    }
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleMakePrivate = () => {
    if (!currentFolder) {
      alert("Please select a folder first to make it private.");
      return;
    }
    setShowAccessControlModal(true);
  };

  const handleCloseAccessControlModal = () => {
    setShowAccessControlModal(false);
  };

  const handleAccessControlSuccess = (updatedFolder) => {
    // Refresh the content to reflect the changes
    fetchContent();
    // You might also want to update the parent component about the folder change
    if (onFolderNavigation) {
      onFolderNavigation(updatedFolder);
    }
  };

  // Combine and sort all items (documents and folders)
  const getAllItems = () => {
    const allItems = [
      ...latestDocuments.map((doc) => ({ ...doc, type: "document" })),
      ...folders.map((folder) => ({ ...folder, type: "folder" })),
    ];

    // Sort by name (case-insensitive)
    return allItems.sort((a, b) => {
      const nameA = a.name || a.originalName || "";
      const nameB = b.name || b.originalName || "";
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });
  };

  // Filter items based on search query and filter type
  const getFilteredItems = () => {
    let items = getAllItems();

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const name = item.name || item.originalName || "";
        return name.toLowerCase().includes(query);
      });
    }

    // Apply type filter
    if (filterType === "documents") {
      items = items.filter((item) => item.type === "document");
    } else if (filterType === "folders") {
      items = items.filter((item) => item.type === "folder");
    }

    return items;
  };

  // Table columns configuration
  const getTableColumns = () => {
    const baseColumns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {record.type === "folder" ? "📁" : getFileIcon(record.mimeType)}
            </span>
            <span className="font-medium">{text}</span>
            {record.version && (
              <Tag color="purple" size="small">
                v{record.version}
              </Tag>
            )}
          </div>
        ),
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        render: (type) => (
          <Tag color={type === "folder" ? "blue" : "green"}>
            {type === "folder" ? "Folder" : "Document"}
          </Tag>
        ),
        filters: [
          { text: "Folders", value: "folder" },
          { text: "Documents", value: "document" },
        ],
        onFilter: (value, record) => record.type === value,
      },
      {
        title: "Size",
        dataIndex: "size",
        key: "size",
        render: (size, record) => {
          if (record.type === "folder") {
            return record.stats
              ? `${record.stats.documentCount || 0} items`
              : "0 items";
          }
          return formatFileSize(size);
        },
        sorter: (a, b) => (a.size || 0) - (b.size || 0),
      },
      {
        title: "Modified",
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (date) => formatTimestamp(date, "short"),
        sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space>
            {record.type === "document" ? (
              <>
                <Button
                  size="small"
                  onClick={() => handleDocumentAction("view", record)}
                  className="bg-green-50 hover:bg-green-100 text-gray-900 border-green-200"
                  disabled={deletingDocumentId === record.id}
                >
                  View
                </Button>
                <Button
                  size="small"
                  onClick={() => handleDocumentAction("download", record)}
                  className="bg-green-50 hover:bg-green-100 text-gray-900 border-green-200"
                  disabled={deletingDocumentId === record.id}
                >
                  Download
                </Button>
                <Button
                  size="small"
                  onClick={() => handleDocumentAction("delete", record)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                  disabled={deletingDocumentId === record.id}
                >
                  {deletingDocumentId === record.id ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "history",
                        label: "📋 View History",
                        onClick: () => handleDocumentAction("history", record),
                      },
                      {
                        key: "upload",
                        label: "📤 Upload New Version",
                        onClick: () => handleDocumentAction("upload", record),
                      },
                    ],
                  }}
                >
                  <Button
                    size="small"
                    disabled={deletingDocumentId === record.id}
                  >
                    ⋮
                  </Button>
                </Dropdown>
              </>
            ) : (
              <Button
                size="small"
                onClick={() => navigateToFolder(record)}
                className="bg-blue-50 hover:bg-blue-100 text-gray-900 border-blue-200"
              >
                Open
              </Button>
            )}
          </Space>
        ),
      },
    ];

    return baseColumns;
  };

  // Prepare data for table
  const getTableData = () => {
    return filteredItems.map((item) => ({
      key: item.id,
      name: item.name || item.originalName,
      type: item.type,
      size: item.size,
      mimeType: item.mimeType,
      version: item.version,
      updatedAt: item.updatedAt || item.createdAt,
      stats: item.type === "folder" ? folderStats[item.id] : null,
      ...item,
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const totalItems = latestDocuments.length + folders.length;

  return (
    <>
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        {/* Header with Breadcrumb */}
        <ContentHeader
          currentFolder={currentFolder}
          currentPath={currentPath}
          totalItems={totalItems}
          onNavigateBack={navigateBack}
          onNavigateToFolder={navigateToFolder}
          onUpload={handleUpload}
          onMakePrivate={handleMakePrivate}
        />

        {/* Toolbar */}
        <ContentToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Content */}
        {!currentFolder ? (
          <ContentEmpty type="select" onUpload={handleUpload} />
        ) : totalItems === 0 ? (
          <ContentEmpty type="empty" onUpload={handleUpload} />
        ) : viewMode === "table" ? (
          <Table
            columns={getTableColumns()}
            dataSource={getTableData()}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            className="bg-white rounded-lg"
          />
        ) : (
          <div className="space-y-6">
            {/* Folders Section */}
            {filteredItems.filter((item) => item.type === "folder").length >
              0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Folders
                </h3>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
                      : "space-y-3"
                  }
                >
                  {filteredItems
                    .filter((item) => item.type === "folder")
                    .map((item) =>
                      viewMode === "grid" ? (
                        <FolderCard
                          key={item.id}
                          folder={item}
                          stats={folderStats[item.id] || folderStats}
                          onDoubleClick={handleFolderDoubleClick}
                        />
                      ) : (
                        <FolderList
                          key={item.id}
                          folder={item}
                          stats={folderStats[item.id]}
                          onDoubleClick={handleFolderDoubleClick}
                        />
                      )
                    )}
                </div>
              </div>
            )}

            {/* Documents Section */}
            {filteredItems.filter((item) => item.type === "document").length >
              0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Documents
                </h3>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
                      : "space-y-3"
                  }
                >
                  {filteredItems
                    .filter((item) => item.type === "document")
                    .map((item) =>
                      viewMode === "grid" ? (
                        <DocumentCard
                          key={item.id}
                          document={item}
                          onAction={handleDocumentAction}
                          onVersionChange={fetchContent}
                          isDeleting={deletingDocumentId === item.id}
                        />
                      ) : (
                        <DocumentList
                          key={item.id}
                          document={item}
                          onAction={handleDocumentAction}
                          onVersionChange={fetchContent}
                          isDeleting={deletingDocumentId === item.id}
                        />
                      )
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          selectedFolder={currentFolder}
          onClose={handleCloseUploadModal}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Access Control Modal */}
      {showAccessControlModal && (
        <AccessControlModal
          selectedFolder={currentFolder}
          onClose={handleCloseAccessControlModal}
          onAccessControlSuccess={handleAccessControlSuccess}
        />
      )}
    </>
  );
}
