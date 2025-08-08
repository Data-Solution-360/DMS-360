"use client";

import { Button, Form, Input, Modal, Select, Space, Switch, Table } from "antd";
import { Copy, Edit, Eye, EyeOff, Search, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useApi } from "../../../../hooks/useApi";

const { Option } = Select;

// Utility function to format Firestore timestamps
const formatFirestoreDate = (timestamp) => {
  console.log(timestamp);
  if (!timestamp) return "N/A";

  try {
    let date;

    // Handle Firestore Timestamp with _seconds and _nanoseconds
    if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    }
    // Handle Firestore Timestamp with toDate method
    else if (timestamp.toDate && typeof timestamp.toDate === "function") {
      date = new Date(timestamp.toDate());
    }
    // Handle Firestore Timestamp object with seconds
    else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    }
    // Handle JavaScript Date object
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle ISO string
    else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    }
    // Handle Unix timestamp (number)
    else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    } else {
      return "N/A";
    }

    // Format as "22 July, 2025"
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

export default function UserManagement() {
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm] = Form.useForm();
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const { apiCall } = useApi();
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Fix hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  const roles = [
    { value: "admin", label: "Administrator" },
    { value: "manager", label: "Manager" },
    { value: "employee", label: "Employee" },
    { value: "viewer", label: "Viewer" },
  ];

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const result = await apiCall(`/api/admin/users?${params}`, {
        method: "GET",
      });

      if (result.success) {
        // Filter out users that are in trash (inTrash: true)
        const activeUsers = result.data.filter((user) => !user.inTrash);
        setUserList(activeUsers);
      } else {
        console.error("Failed to fetch users:", result.error);
        Swal.fire({
          title: "❌ Error",
          text: "Failed to fetch users. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
          background: "#ffffff",
          color: "#1f2937",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        title: "❌ Error",
        text: "An unexpected error occurred while fetching users.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch users when component mounts or search changes
  useEffect(() => {
    if (mounted) {
      fetchUsers();
    }
  }, [searchQuery, mounted]);

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);
    try {
      const result = await apiCall(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (result.success) {
        Swal.fire({
          title: "✅ User Deleted!",
          text: "User has been successfully deleted from the system.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#10b981",
          background: "#ffffff",
          color: "#1f2937",
        });
        fetchUsers(); // Refresh the list
      } else {
        Swal.fire({
          title: "❌ Delete Failed",
          text: result.error || "Failed to delete user. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
          background: "#ffffff",
          color: "#1f2937",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        title: "❌ Error",
        text: "An unexpected error occurred while deleting the user.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    setUpdatingUserId(editingUser.id);
    try {
      const result = await apiCall(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });

      if (result.success) {
        Swal.fire({
          title: "✅ User Updated!",
          text: `User "${values.name}" has been successfully updated.`,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#0ea5e9",
          background: "#ffffff",
          color: "#1f2937",
        });
        setEditModalVisible(false);
        setEditingUser(null);
        editForm.resetFields();
        fetchUsers(); // Refresh the list
      } else {
        Swal.fire({
          title: "❌ Update Failed",
          text: result.error || "Failed to update user. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
          background: "#ffffff",
          color: "#1f2937",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        title: "❌ Error",
        text: "An unexpected error occurred while updating the user.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyPassword = async (password) => {
    try {
      await navigator.clipboard.writeText(password);
      Swal.fire({
        title: "📋 Password Copied!",
        text: "Password has been copied to your clipboard.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#ffffff",
        color: "#1f2937",
      });
    } catch (error) {
      console.error("Failed to copy password:", error);
      Swal.fire({
        title: "❌ Copy Failed",
        text: "Failed to copy password to clipboard.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    }
  };

  const confirmDeleteUser = (user) => {
    Swal.fire({
      title: "🗑️ Delete User",
      text: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      color: "#1f2937",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteUser(user.id);
      }
    });
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {record.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {record.name}
            </div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            role === "admin"
              ? "bg-red-100 text-red-800"
              : role === "manager"
              ? "bg-yellow-100 text-yellow-800"
              : role === "employee"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {role}
        </span>
      ),
    },
    {
      title: "Password",
      key: "password",
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <input
                type={visiblePasswords[record.id] ? "text" : "password"}
                value={record.password || "••••••••"}
                readOnly
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-gray-50 text-gray-700"
              />
            </div>
          </div>
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={
                visiblePasswords[record.id] ? (
                  <EyeOff size={14} />
                ) : (
                  <Eye size={14} />
                )
              }
              onClick={() => togglePasswordVisibility(record.id)}
              className="p-1"
            />
            <Button
              type="text"
              size="small"
              icon={<Copy size={14} />}
              onClick={() => copyPassword(record.password)}
              className="p-1"
              title="Copy password"
            />
          </Space>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => formatFirestoreDate(createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<Edit size={16} />}
            onClick={() => handleEditUser(record)}
            className="text-blue-600 hover:text-blue-900 p-0"
            disabled={
              deletingUserId === record.id || updatingUserId === record.id
            }
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={
              deletingUserId === record.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <Trash2 size={16} />
              )
            }
            onClick={() => confirmDeleteUser(record)}
            className="p-0"
            disabled={
              deletingUserId === record.id || updatingUserId === record.id
            }
            loading={deletingUserId === record.id}
          >
            {deletingUserId === record.id ? "Deleting..." : "Delete"}
          </Button>
        </Space>
      ),
    },
  ];

  // Don't render until mounted to prevent hydration error
  if (!mounted) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage and monitor all registered users in the system.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>

        {/* Ant Design Table */}
        <Table
          columns={columns}
          dataSource={userList}
          loading={loadingUsers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          locale={{
            emptyText: (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "No users match your search criteria."
                    : "Users will appear here once they are created."}
                </p>
              </div>
            ),
          }}
        />
      </div>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          initialValues={{
            status: true,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
              ]}
            >
              <Input placeholder="Enter email" disabled />
            </Form.Item>

            <Form.Item label="Mobile" name="mobile">
              <Input placeholder="Enter mobile number" />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select placeholder="Select role">
                {roles.map((role) => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                setEditingUser(null);
                editForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updatingUserId === editingUser?.id}
              disabled={updatingUserId === editingUser?.id}
            >
              {updatingUserId === editingUser?.id
                ? "Updating..."
                : "Update User"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
