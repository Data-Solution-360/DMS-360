"use client";

import { Button, Card, Empty, Space, Spin, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useApi } from "../../../../hooks/useApi";
import { useDownloadTracking } from "../../../../hooks/useDownloadTracking";
import { getFileTypeName } from "../../../../lib/constants.js";
import { formatTimestamp } from "../../../../lib/utils.js";

const { Text, Title } = Typography;

// Utility functions (copied from AdvanceSearch)
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
  if (
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("csv")
  )
    return "📊";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "📈";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("video")) return "🎥";
  if (mimeType.includes("audio")) return "🎵";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("archive") ||
    mimeType.includes("rar")
  )
    return "📦";
  return "📄";
};

export default function SearchResultsModal({
  visible,
  onCancel,
  searchData,
  title = "Search Results",
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { apiCall } = useApi();
  const { handleDownload } = useDownloadTracking();

  useEffect(() => {
    if (visible && searchData) {
      executeSearch();
    }
  }, [visible, searchData]);

  const executeSearch = async () => {
    try {
      setLoading(true);

      // Build search parameters from saved search data
      const params = new URLSearchParams();

      if (searchData.query) params.append("query", searchData.query);
      if (searchData.filters?.tags && searchData.filters.tags.length > 0) {
        params.append("tags", searchData.filters.tags.join(","));
      }
      if (searchData.filters?.fileType) {
        params.append("fileType", searchData.filters.fileType);
      }
      if (searchData.filters?.mimeType) {
        params.append("mimeType", searchData.filters.mimeType);
      }
      if (
        searchData.filters?.dateRange &&
        searchData.filters.dateRange.length === 2
      ) {
        params.append(
          "startDate",
          searchData.filters.dateRange[0].toISOString()
        );
        params.append("endDate", searchData.filters.dateRange[1].toISOString());
      }
      if (searchData.filters?.showOldVersions) {
        params.append("showOldVersions", "true");
      }

      // Use the appropriate endpoint based on whether we're showing old versions
      const endpoint = searchData.filters?.showOldVersions
        ? `/api/documents/all?${params}`
        : `/api/documents/advanced-search?${params}`;

      const result = await apiCall(endpoint, {
        method: "GET",
      });

      if (result.success) {
        setDocuments(result.data);
      } else {
        console.error("Search failed:", result.error);
      }
    } catch (error) {
      console.error("Error executing search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentAction = (action, document) => {
    switch (action) {
      case "view":
        window.open(document.firebaseStorageUrl, "_blank");
        break;
      case "download":
        handleDownload(document);
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  // Table columns configuration (copied from AdvanceSearch)
  const columns = [
    {
      title: "Document",
      key: "document",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center text-white">
              {getFileIcon(record.mimeType)}
            </div>
            {record.version && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">v{record.version}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">
              {record.originalName}
            </div>
            <div className="text-sm text-gray-500">
              {formatFileSize(record.size)}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.originalName.localeCompare(b.originalName),
    },
    {
      title: "Type",
      dataIndex: "mimeType",
      key: "mimeType",
      render: (mimeType) => {
        const typeName = getFileTypeName(mimeType);
        return <Tag color="blue">{typeName}</Tag>;
      },
    },
    {
      title: "Tags",
      key: "tags",
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.tags && record.tags.length > 0 ? (
            record.tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} color="green" size="small">
                {typeof tag === "string" ? tag : tag.displayName || tag.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary">No tags</Text>
          )}
          {record.tags && record.tags.length > 3 && (
            <Tag color="default" size="small">
              +{record.tags.length - 3}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatTimestamp(date, "short"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
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
          <Button
            size="small"
            onClick={() => handleDocumentAction("view", record)}
            className="bg-green-50 hover:bg-green-100 text-gray-900 border-green-200"
          >
            View
          </Button>
          <Button
            size="small"
            onClick={() => handleDocumentAction("download", record)}
            className="bg-blue-50 hover:bg-blue-100 text-gray-900 border-blue-200"
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      isOpen={visible}
      onRequestClose={onCancel}
      contentLabel={title}
      overlayClassName="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-2xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-hidden outline-none border border-gray-200"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span className="text-2xl">✕</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 bg-white max-h-[calc(90vh-120px)] overflow-auto">
        <div className="space-y-4">
          {/* Search Criteria Summary */}
          {searchData && (
            <Card size="small">
              <div className="flex items-center justify-between">
                <div>
                  <Text strong>Search Criteria:</Text>
                  <div className="mt-2 space-y-1">
                    {searchData.query && (
                      <div>
                        <Text type="secondary">Query: </Text>
                        {searchData.query}
                      </div>
                    )}
                    {searchData.filters?.tags &&
                      searchData.filters.tags.length > 0 && (
                        <div>
                          <Text type="secondary">Tags: </Text>
                          {searchData.filters.tags.join(", ")}
                        </div>
                      )}
                    {searchData.filters?.fileType && (
                      <div>
                        <Text type="secondary">File Type: </Text>
                        {searchData.filters.fileType}
                      </div>
                    )}
                    {searchData.filters?.showOldVersions && (
                      <div>
                        <Text type="secondary">Include Old Versions: </Text>Yes
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Text type="secondary">Results: </Text>
                  <Text strong>{documents.length} documents</Text>
                </div>
              </div>
            </Card>
          )}

          {/* Results Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spin size="large" />
              <div className="ml-4">
                <Text>Executing search...</Text>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <Empty
              description="No documents found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={documents}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} documents`,
              }}
              className="bg-white rounded-lg"
              scroll={{ x: true }}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
