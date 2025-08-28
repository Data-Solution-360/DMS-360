// src/components/features/dashboard/Trashbox/UserTrashbox.jsx
"use client";

import { useApi } from "@/hooks/useApi";
import { Button, Space, Table } from "antd";
import { RotateCcw, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const formatFirestoreDate = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    let date;
    if (timestamp._seconds) date = new Date(timestamp._seconds * 1000);
    else if (timestamp.toDate && typeof timestamp.toDate === "function")
      date = new Date(timestamp.toDate());
    else if (timestamp.seconds) date = new Date(timestamp.seconds * 1000);
    else if (timestamp instanceof Date) date = timestamp;
    else if (typeof timestamp === "string") date = new Date(timestamp);
    else if (typeof timestamp === "number") date = new Date(timestamp);
    else return "N/A";

    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  } catch {
    return "N/A";
  }
};

export default function UserTrashbox() {
  const { apiCall } = useApi();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null); // Add this line

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiCall(`/api/admin/trash/users`, { method: "GET" });
      if (res.success) {
        setItems(res.data || []);
      } else {
        Swal.fire({
          title: "❌ Error",
          text: res.error || "Failed to load deleted users",
          icon: "error",
        });
      }
    } catch (e) {
      Swal.fire({
        title: "❌ Error",
        text: e.message || "Failed to load deleted users",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const restoreItem = async (id) => {
    setActionId(id);
    setActionType("restore"); // Add this line
    try {
      const res = await apiCall(`/api/admin/trash/users/${id}/restore`, {
        method: "POST",
      });
      if (res.success) {
        Swal.fire({
          title: "✅ Restored",
          text: "User has been restored.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchItems();
      } else {
        Swal.fire({
          title: "❌ Restore failed",
          text: res.error || "Failed to restore user",
          icon: "error",
        });
      }
    } catch (e) {
      Swal.fire({
        title: "❌ Error",
        text: e.message || "Failed to restore user",
        icon: "error",
      });
    } finally {
      setActionId(null);
      setActionType(null); // Add this line
    }
  };

  const deletePermanently = async (item) => {
    const confirm = await Swal.fire({
      title: "🗑️ Permanently Delete User?",
      text: "This will completely remove the user from both the trash and Firebase Authentication. This action cannot be undone and the user will lose all access to the system.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete Permanently",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      background: "#ffffff",
      color: "#1f2937",
    });

    if (!confirm.isConfirmed) return;

    setActionId(item.id);
    setActionType("delete");
    try {
      const res = await apiCall(`/api/admin/trash/users/${item.id}`, {
        method: "DELETE",
      });
      if (res.success) {
        Swal.fire({
          title: "✅ User Completely Removed",
          text: "User has been permanently deleted from both the trash and Firebase Authentication. This action cannot be undone.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchItems();
      } else {
        Swal.fire({
          title: "❌ Delete Failed",
          text:
            res.error || "Failed to permanently delete user. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
          background: "#ffffff",
          color: "#1f2937",
        });
      }
    } catch (e) {
      console.error("Error permanently deleting user:", e);
      Swal.fire({
        title: "❌ Error",
        text: "An unexpected error occurred while deleting the user. Please try again or contact support.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => {
        const name = record.data?.name || "";
        const email = record.data?.email || "";
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{name}</div>
              <div className="text-sm text-gray-500">{email}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Role",
      key: "role",
      render: (_, record) => record.data?.role || "N/A",
    },
    {
      title: "Deleted At",
      dataIndex: "deletedAt",
      key: "deletedAt",
      render: (d) => formatFirestoreDate(d),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<RotateCcw size={16} />}
            onClick={() => restoreItem(record.id)}
            disabled={actionId === record.id}
          >
            {actionId === record.id && actionType === "restore"
              ? "Restoring..."
              : "Restore"}
          </Button>
          <Button
            type="link"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => deletePermanently(record)}
            disabled={actionId === record.id}
          >
            {actionId === record.id && actionType === "delete"
              ? "Deleting..."
              : "Delete Permanently"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <Table
        columns={columns}
        dataSource={items}
        loading={loading}
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
                Trash is empty
              </h3>
              <p className="text-gray-600">
                Deleted users will appear here until they are restored or
                permanently deleted.
              </p>
            </div>
          ),
        }}
      />
    </div>
  );
}
