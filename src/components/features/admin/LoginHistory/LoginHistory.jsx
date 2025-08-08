"use client";

import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  FiClock,
  FiMonitor,
  FiRefreshCw,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { useApi } from "../../../../hooks/useApi";
import { calculateSessionDuration } from "../../../../lib/utils/browserUtils.js";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function LoginHistory() {
  const [history, setHistory] = useState([]);
  const [allHistory, setAllHistory] = useState([]); // Store all data
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    userId: "",
    success: "all",
    dateRange: null,
  });
  const { apiCall } = useApi();

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchLoginHistory();
    fetchStatistics();
  }, [filters]); // Remove debouncedSearchQuery from dependency

  // Apply search filter to data
  useEffect(() => {
    if (!allHistory.length) return;

    let filteredData = [...allHistory];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const searchTerm = debouncedSearchQuery.toLowerCase().trim();
      filteredData = filteredData.filter((item) => {
        const userName = (item.user?.name || "").toLowerCase();
        const userEmail = (
          item.user?.email ||
          item.userEmail ||
          ""
        ).toLowerCase();
        return userName.includes(searchTerm) || userEmail.includes(searchTerm);
      });
    }

    setHistory(filteredData);
  }, [debouncedSearchQuery, allHistory]);

  const fetchLoginHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.userId) params.append("userId", filters.userId);
      if (filters.success !== "all") params.append("success", filters.success);
      if (filters.dateRange) {
        params.append("startDate", filters.dateRange[0].toISOString());
        params.append("endDate", filters.dateRange[1].toISOString());
      }

      const result = await apiCall(`/api/auth/login-history?${params}`, {
        method: "GET",
      });

      if (result.success) {
        setAllHistory(result.data); // Store all data
        setHistory(result.data); // Set initial filtered data
      }
    } catch (error) {
      console.error("Error fetching login history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await apiCall("/api/auth/login-statistics", {
        method: "GET",
      });

      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const formatDate = (dateData) => {
    if (dateData && typeof dateData === "object" && dateData._seconds) {
      const date = new Date(dateData._seconds * 1000);
      return dayjs(date).format("DD MMMM, YYYY");
    }
    if (dateData) {
      const date = new Date(dateData);
      if (!isNaN(date.getTime())) {
        return dayjs(date).format("DD MMMM, YYYY");
      }
    }
    return "N/A";
  };

  const formatTime = (dateData) => {
    if (dateData && typeof dateData === "object" && dateData._seconds) {
      const date = new Date(dateData._seconds * 1000);
      return dayjs(date).format("h:mm A");
    }
    if (dateData) {
      const date = new Date(dateData);
      if (!isNaN(date.getTime())) {
        return dayjs(date).format("h:mm A");
      }
    }
    return "N/A";
  };

  const getBrowserTagColor = (browser) => {
    const browserName = browser?.toLowerCase();

    // Check for Brave first (it often shows as Chrome but can be detected)
    if (browserName === "brave" || browserName?.includes("brave")) {
      return "orange";
    }

    switch (browserName) {
      case "chrome":
        return "blue";
      case "firefox":
        return "orange";
      case "safari":
        return "green";
      case "edge":
        return "purple";
      case "opera":
        return "red";
      default:
        return "default";
    }
  };

  const getBrowserDisplayName = (browserInfo) => {
    const browser = browserInfo?.browser?.toLowerCase();
    const userAgent = browserInfo?.userAgent || "";

    // Check if it's Brave browser
    if (
      browser === "chrome" &&
      (userAgent.includes("Brave") || userAgent.includes("brave"))
    ) {
      return "Brave";
    }

    // Return original browser name if not Brave
    return browserInfo?.browser || "Unknown";
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <FiUser />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.user?.name || record.userEmail}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.user?.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Login Time",
      dataIndex: "loginAt",
      key: "loginAt",
      render: (date) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontWeight: 500 }}>{formatDate(date)}</Text>
          <Text type="secondary">{formatTime(date)}</Text>
        </Space>
      ),
    },
    {
      title: "Session Duration",
      key: "sessionDuration",
      render: (_, record) => {
        // Use the new session duration calculation with session ID
        const duration = calculateSessionDuration(
          record.loginAt, 
          record.logoutAt, 
          record.sessionId
        );
        
        // Show session status
        const statusColor = record.sessionStatus === 'active' ? 'green' : 
                           record.sessionStatus === 'ended' ? 'blue' : 'orange';
        const statusText = record.sessionStatus === 'active' ? 'Active' :
                          record.sessionStatus === 'ended' ? 'Ended' : 'Expired';
        
        return (
          <Space direction="vertical" size="small">
            <Tag color="green">{duration}</Tag>
            <Tag color={statusColor}>{statusText}</Tag>
          </Space>
        );
      },
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (ip) => {
        const displayIP =
          ip === "::1" || ip === "127.0.0.1" ? "Local Development" : ip;
        return (
          <Space>
            <FiMonitor />
            <Text code>{displayIP || "Unknown"}</Text>
          </Space>
        );
      },
    },
    {
      title: "Browser",
      key: "browser",
      render: (_, record) => {
        const browserInfo = record.browserInfo || {};
        const displayName = getBrowserDisplayName(browserInfo);
        const color = getBrowserTagColor(displayName);

        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <Tag color={color}>
              {displayName} {browserInfo.version}
            </Tag>
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {browserInfo.os}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "success",
      key: "success",
      render: (success) => (
        <Tag color={success ? "green" : "red"}>
          {success ? "Success" : "Failed"}
        </Tag>
      ),
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setFilters({
      userId: "",
      success: "all",
      dateRange: null,
    });
    setSearchQuery("");
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Logins"
              value={statistics.today || 0}
              prefix={<FiClock />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="This Week"
              value={statistics.thisWeek || 0}
              prefix={<FiClock />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="This Month"
              value={statistics.thisMonth || 0}
              prefix={<FiClock />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Logins"
              value={statistics.total || 0}
              prefix={<FiClock />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {/* Search Bar */}
          <div>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Search by Name or Email
            </Text>
            <Search
              placeholder="Search by user name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              prefix={<FiSearch />}
              allowClear
              style={{ maxWidth: "400px" }}
            />
          </div>

          {/* Other Filters */}
          <Space wrap>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange("dateRange", dates)}
              placeholder={["Start Date", "End Date"]}
            />
            <Button icon={<FiRefreshCw />} onClick={fetchLoginHistory}>
              Refresh
            </Button>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </Space>
        </Space>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={history}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} logins`,
        }}
        locale={{
          emptyText: (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <FiClock
                style={{
                  fontSize: "48px",
                  color: "#d9d9d9",
                  marginBottom: "16px",
                }}
              />
              <div
                style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}
              >
                No login history found
              </div>
              <div style={{ fontSize: "14px", color: "#999" }}>
                {searchQuery || filters.dateRange || filters.success !== "all"
                  ? "Try adjusting your search criteria."
                  : "Login activity will appear here."}
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
}
