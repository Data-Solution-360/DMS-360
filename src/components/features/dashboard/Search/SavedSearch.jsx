"use client";

import {
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useApi } from "../../../../hooks/useApi";
import { formatTimestamp } from "../../../../lib/utils.js";
import SearchResultsModal from "./SearchResultsModal.jsx";

const { Title, Text } = Typography;

export default function SavedSearch({ onExecuteSearch }) {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);
  const [selectedSearchData, setSelectedSearchData] = useState(null);
  const { apiCall } = useApi();

  // Fetch saved searches
  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching saved searches...");

      const response = await apiCall("/api/search/saved", "GET");
      console.log("🔍 API Response:", response);

      if (response.success) {
        console.log("🔍 Setting saved searches:", response.data);
        setSavedSearches(response.data);
      } else {
        console.error(" API returned error:", response.error);
        message.error("Failed to load saved searches");
      }
    } catch (error) {
      console.error("Error fetching saved searches:", error);
      message.error("Failed to load saved searches");
    } finally {
      setLoading(false);
    }
  };

  // Delete multiple saved searches
  const handleDeleteMultiple = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select searches to delete");
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await apiCall("/api/search/saved/delete-multiple", {
        method: "DELETE",
        body: JSON.stringify({ searchIds: selectedRowKeys }),
      });

      if (response.success) {
        message.success(
          `${selectedRowKeys.length} search(es) deleted successfully`
        );
        setSelectedRowKeys([]);
        fetchSavedSearches();
      } else {
        message.error("Failed to delete searches");
      }
    } catch (error) {
      console.error("Error deleting saved searches:", error);
      message.error("Failed to delete searches");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Execute saved search
  const handleExecute = (searchData) => {
    setSelectedSearchData(searchData);
    setSearchResultsVisible(true);
  };

  const handleSearchResultsClose = () => {
    setSearchResultsVisible(false);
    setSelectedSearchData(null);
  };

  useEffect(() => {
    console.log("🔍 SavedSearch component mounted, fetching data...");
    fetchSavedSearches();
  }, []);

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns = [
    {
      title: "Search Name",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <div>
          <Text strong>{name}</Text>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <div>
          <Text type="secondary">{description || "No description"}</Text>
        </div>
      ),
    },
    {
      title: "Query",
      dataIndex: "query",
      key: "query",
      render: (query) => (
        <div>
          <Text code>{query || "All documents"}</Text>
        </div>
      ),
    },
    {
      title: "Filters",
      dataIndex: "filters",
      key: "filters",
      render: (filters) => {
        if (!filters || Object.keys(filters).length === 0) {
          return <Text type="secondary">No filters</Text>;
        }

        const filterTags = [];
        if (filters.fileType) filterTags.push(`Type: ${filters.fileType}`);
        if (filters.tags && filters.tags.length > 0) {
          filterTags.push(`Tags: ${filters.tags.join(", ")}`);
        }
        if (filters.dateRange) {
          filterTags.push(`Date: ${filters.dateRange}`);
        }
        if (filters.showOldVersions) filterTags.push("Old Versions");

        return (
          <Space wrap>
            {filterTags.map((tag, index) => (
              <Tag key={index} color="blue">
                {tag}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Results",
      dataIndex: "resultsCount",
      key: "resultsCount",
      render: (count) => <Tag color="green">{count || 0} documents</Tag>,
    },
    {
      title: "Saved On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp) => (
        <Text type="secondary">{formatTimestamp(timestamp)}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            size="small"
            onClick={() => handleExecute(record)}
          >
            Execute
          </Button>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleExecute(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  console.log("🔍 Current savedSearches state:", savedSearches);
  console.log("🔍 Loading state:", loading);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text>Loading saved searches...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <div className="flex items-center justify-between">
            <div>
              <Title level={3}>
                <StarOutlined style={{ marginRight: "8px" }} />
                Saved Searches
              </Title>
              <Text type="secondary">
                Manage and execute your saved search queries
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchSavedSearches}
                size="small"
              >
                Refresh
              </Button>
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`Delete ${selectedRowKeys.length} selected search(es)?`}
                  description="This action cannot be undone."
                  onConfirm={handleDeleteMultiple}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleteLoading}
                  >
                    Delete Selected ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        </div>

        {savedSearches.length === 0 ? (
          <Empty
            description="No saved searches found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text type="secondary">
              Save searches from the advanced search page to see them here
            </Text>
          </Empty>
        ) : (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={savedSearches}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        )}
      </Card>

      {/* Search Results Modal */}
      <SearchResultsModal
        visible={searchResultsVisible}
        onCancel={handleSearchResultsClose}
        searchData={selectedSearchData}
        title={
          selectedSearchData
            ? `Search Results: ${selectedSearchData.name}`
            : "Search Results"
        }
      />
    </div>
  );
}
