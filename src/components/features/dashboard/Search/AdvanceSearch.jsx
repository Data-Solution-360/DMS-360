"use client";

import {
  ClearOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Dropdown,
  Empty,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useApi } from "../../../../hooks/useApi";
import { useDownloadTracking } from "../../../../hooks/useDownloadTracking";
import {
  FILE_TYPE_CATEGORIES,
  getFileCategory,
  getFileTypeName,
} from "../../../../lib/constants.js";
import { formatTimestamp } from "../../../../lib/utils.js";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

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

const AdvanceSearch = () => {
  const [documents, setDocuments] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [searchParams, setSearchParams] = useState({
    query: "",
    tags: [],
    fileType: "",
    mimeType: "",
    dateRange: null,
    showOldVersions: false,
  });
  const { apiCall } = useApi();
  const { handleDownload } = useDownloadTracking();

  // Fetch all tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  // Fetch documents when search params change
  useEffect(() => {
    if (
      searchParams.query ||
      searchParams.tags.length > 0 ||
      searchParams.fileType ||
      searchParams.mimeType ||
      searchParams.dateRange ||
      searchParams.showOldVersions
    ) {
      fetchDocuments();
    } else {
      // Load default documents (latest versions only)
      fetchDefaultDocuments();
    }
  }, [searchParams]);

  const fetchTags = async () => {
    try {
      const result = await apiCall("/api/tags", {
        method: "GET",
      });
      if (result.success) {
        setAllTags(result.data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchDefaultDocuments = async () => {
    try {
      setLoading(true);
      const result = await apiCall("/api/documents", {
        method: "GET",
      });
      if (result.success) {
        setDocuments(result.data);
      }
    } catch (error) {
      console.error("Error fetching default documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      // If showOldVersions is true, fetch all documents from the documents collection
      if (searchParams.showOldVersions) {
        const params = new URLSearchParams();
        params.append("showOldVersions", "true");

        // Add filters even when showing old versions
        if (searchParams.query) params.append("query", searchParams.query);
        if (searchParams.tags.length > 0)
          params.append("tags", searchParams.tags.join(","));
        if (searchParams.fileType)
          params.append("fileType", searchParams.fileType);
        if (searchParams.mimeType)
          params.append("mimeType", searchParams.mimeType);
        if (searchParams.dateRange && searchParams.dateRange.length === 2) {
          params.append("startDate", searchParams.dateRange[0].toISOString());
          params.append("endDate", searchParams.dateRange[1].toISOString());
        }

        const result = await apiCall(`/api/documents/all?${params}`, {
          method: "GET",
        });
        if (result.success) {
          console.log("🔍 Debug - API Response:", result);
          setDocuments(result.data);
        }
        return;
      }

      // Otherwise, use advanced search with filters
      const params = new URLSearchParams();

      if (searchParams.query) params.append("query", searchParams.query);
      if (searchParams.tags.length > 0)
        params.append("tags", searchParams.tags.join(","));
      if (searchParams.fileType)
        params.append("fileType", searchParams.fileType);
      if (searchParams.mimeType)
        params.append("mimeType", searchParams.mimeType);
      if (searchParams.dateRange && searchParams.dateRange.length === 2) {
        params.append("startDate", searchParams.dateRange[0].toISOString());
        params.append("endDate", searchParams.dateRange[1].toISOString());
      }

      const result = await apiCall(`/api/documents/advanced-search?${params}`, {
        method: "GET",
      });

      if (result.success) {
        console.log("🔍 Debug - Advanced Search Response:", result);
        setDocuments(result.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchParams((prev) => ({ ...prev, query: value }));
  };

  const handleTagChange = (selectedTags) => {
    setSearchParams((prev) => ({ ...prev, tags: selectedTags }));
  };

  const handleFileTypeChange = (value) => {
    setSearchParams((prev) => ({ ...prev, fileType: value }));
  };

  const handleMimeTypeChange = (value) => {
    setSearchParams((prev) => ({ ...prev, mimeType: value }));
  };

  const handleDateRangeChange = (dates) => {
    setSearchParams((prev) => ({ ...prev, dateRange: dates }));
  };

  const handleShowOldVersionsChange = (checked) => {
    setSearchParams((prev) => ({ ...prev, showOldVersions: checked }));
  };

  const clearFilters = () => {
    setSearchParams({
      query: "",
      tags: [],
      fileType: "",
      mimeType: "",
      dateRange: null,
      showOldVersions: false,
    });
  };

  // Save search functionality
  const handleSaveSearch = () => {
    setSaveModalVisible(true);
  };

  const handleSaveSearchConfirm = async () => {
    if (!searchName.trim()) {
      message.error("Please enter a search name");
      return;
    }

    try {
      setSaveLoading(true);

      const searchData = {
        name: searchName.trim(),
        description: searchDescription.trim(),
        query: searchParams.query,
        filters: {
          tags: searchParams.tags,
          fileType: searchParams.fileType,
          mimeType: searchParams.mimeType,
          dateRange: searchParams.dateRange,
          showOldVersions: searchParams.showOldVersions,
        },
        resultsCount: documents.length,
      };

      const response = await apiCall("/api/search/saved", {
        method: "POST",
        body: JSON.stringify(searchData),
      });

      if (response.success) {
        message.success("Search saved successfully!");
        setSaveModalVisible(false);
        setSearchName("");
        setSearchDescription("");
      } else {
        message.error("Failed to save search");
      }
    } catch (error) {
      console.error("Error saving search:", error);
      message.error("Failed to save search");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSearchCancel = () => {
    setSaveModalVisible(false);
    setSearchName("");
    setSearchDescription("");
  };

  const handleDocumentAction = (action, document) => {
    switch (action) {
      case "view":
        window.open(document.firebaseStorageUrl, "_blank");
        break;
      case "download":
        handleDownload(document);
        break;
      case "history":
        // Handle version history
        console.log("View history for:", document);
        break;
      case "upload":
        // Handle upload new version
        console.log("Upload new version for:", document);
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  // Table columns configuration
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
      filters: FILE_TYPE_CATEGORIES.slice(1).map((option) => ({
        text: option.label,
        value: option.value,
      })),
      onFilter: (value, record) => {
        const category = getFileCategory(record.mimeType);
        return category === value;
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
            <Button size="small">⋮</Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="mb-2">
            Advanced Search
          </Title>
          <Text type="secondary">
            Search and filter documents with advanced criteria
          </Text>
        </div>
        <Space>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveSearch}
            disabled={
              !searchParams.query &&
              !searchParams.tags.length &&
              !searchParams.fileType &&
              !searchParams.mimeType &&
              !searchParams.dateRange
            }
          >
            Save Search
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchDocuments}
            loading={loading}
          >
            Refresh
          </Button>
          <Button icon={<ClearOutlined />} onClick={clearFilters}>
            Clear Filters
          </Button>
        </Space>
      </div>

      {/* Search Filters */}
      <Card>
        <div className="space-y-4">
          {/* Main Search */}
          <div>
            <Text strong>Search Documents</Text>
            <Search
              placeholder="Search by document name, description, or content..."
              value={searchParams.query}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, query: e.target.value }))
              }
              onSearch={handleSearch}
              size="large"
              prefix={<SearchOutlined />}
              allowClear
            />
          </div>

          <Divider />

          {/* Advanced Filters */}
          <Row gutter={16}>
            <Col span={8}>
              <div>
                <Text strong>File Type</Text>
                <Select
                  placeholder="Select file type"
                  value={searchParams.fileType}
                  onChange={handleFileTypeChange}
                  style={{ width: "100%", marginTop: 8 }}
                  allowClear
                >
                  {FILE_TYPE_CATEGORIES.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col span={8}>
              <div>
                <Text strong>Created Date Range</Text>
                <RangePicker
                  placeholder={["Start Date", "End Date"]}
                  value={searchParams.dateRange}
                  onChange={handleDateRangeChange}
                  style={{ width: "100%", marginTop: 8 }}
                  format="YYYY-MM-DD"
                  allowClear
                />
              </div>
            </Col>

            <Col span={8}>
              <div>
                <Text strong>Tags</Text>
                <Select
                  mode="multiple"
                  placeholder="Select tags"
                  value={searchParams.tags}
                  onChange={handleTagChange}
                  style={{ width: "100%", marginTop: 8 }}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {allTags.map((tag) => (
                    <Option key={tag.id} value={tag.displayName || tag.name}>
                      {tag.displayName || tag.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Checkbox
                checked={searchParams.showOldVersions}
                onChange={(e) => handleShowOldVersionsChange(e.target.checked)}
              >
                <Text>Show old versions of documents</Text>
              </Checkbox>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Results */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Text strong>Search Results</Text>
            <Text type="secondary" className="ml-2">
              {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
              found
            </Text>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spin size="large" />
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
          />
        )}
      </Card>

      {/* Save Search Modal */}
      <Modal
        title="Save Search"
        open={saveModalVisible}
        onOk={handleSaveSearchConfirm}
        onCancel={handleSaveSearchCancel}
        confirmLoading={saveLoading}
        okText="Save"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div>
            <Text strong>Search Name *</Text>
            <Input
              placeholder="Enter a name for this search"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Description</Text>
            <Input.TextArea
              placeholder="Optional description"
              value={searchDescription}
              onChange={(e) => setSearchDescription(e.target.value)}
              rows={3}
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Search Criteria</Text>
            <div className="mt-2 p-3 bg-gray-50 rounded">
              {searchParams.query && (
                <div>
                  <Text type="secondary">Query: </Text>
                  {searchParams.query}
                </div>
              )}
              {searchParams.tags.length > 0 && (
                <div>
                  <Text type="secondary">Tags: </Text>
                  {searchParams.tags.join(", ")}
                </div>
              )}
              {searchParams.fileType && (
                <div>
                  <Text type="secondary">File Type: </Text>
                  {searchParams.fileType}
                </div>
              )}
              {searchParams.dateRange &&
                searchParams.dateRange.length === 2 && (
                  <div>
                    <Text type="secondary">Date Range: </Text>
                    {searchParams.dateRange[0].format("YYYY-MM-DD")} to{" "}
                    {searchParams.dateRange[1].format("YYYY-MM-DD")}
                  </div>
                )}
              {searchParams.showOldVersions && (
                <div>
                  <Text type="secondary">Include Old Versions: </Text>Yes
                </div>
              )}
              <div>
                <Text type="secondary">Results: </Text>
                {documents.length} documents
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdvanceSearch;
