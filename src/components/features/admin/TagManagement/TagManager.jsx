"use client";

import { useEffect, useState } from "react";
import { FiEdit, FiPlus, FiSearch, FiTag, FiTrash2 } from "react-icons/fi";

export default function TagManager() {
  const [tags, setTags] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    category: "general",
    departmentId: "",
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
    { value: "project", label: "Project" },
    { value: "custom", label: "Custom" },
  ];

  const colorOptions = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#F97316", // Orange
    "#06B6D4", // Cyan
    "#EC4899", // Pink
  ];

  useEffect(() => {
    fetchTags();
    fetchDepartments();
  }, [searchTerm, selectedDepartment, selectedCategory]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (selectedDepartment !== "all")
        params.append("department", selectedDepartment);

      const response = await fetch(`/api/tags?${params}`);
      const result = await response.json();

      if (result.success) {
        setTags(result.data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const result = await response.json();

      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "#3B82F6",
      category: "general",
      departmentId: "",
    });
  };

  const handleCreateTag = async () => {
    try {
      const selectedDept = departments.find(
        (dept) => dept.id === formData.departmentId
      );

      if (!selectedDept) {
        alert("Please select a valid department");
        return;
      }

      const requestData = {
        ...formData,
        department: selectedDept.name,
        departmentId: undefined,
      };

      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateModal(false);
        resetForm();
        fetchTags();
      } else {
        alert(result.error || "Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      alert("Failed to create tag");
    }
  };

  const handleEditTag = async () => {
    try {
      const selectedDept = departments.find(
        (dept) => dept.id === formData.departmentId
      );

      if (!selectedDept) {
        alert("Please select a valid department");
        return;
      }

      const requestData = {
        id: editingTag.id,
        ...formData,
        department: selectedDept.name,
        departmentId: undefined,
      };

      const response = await fetch("/api/tags", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        setShowEditModal(false);
        setEditingTag(null);
        resetForm();
        fetchTags();
      } else {
        alert(result.error || "Failed to update tag");
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      alert("Failed to update tag");
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tags?id=${tagId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        fetchTags();
      } else {
        alert(result.error || "Failed to delete tag");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      alert("Failed to delete tag");
    }
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.displayName || tag.name,
      description: tag.description || "",
      color: tag.color || "#3B82F6",
      category: tag.category || "general",
      departmentId: tag.departmentId || "",
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Tag Management
          </h3>
          <p className="text-gray-600">
            Create and manage tags with department associations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Create Tag
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tags...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiTag className="h-5 w-5" style={{ color: tag.color }} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {tag.displayName || tag.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Department: {tag.department}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(tag)}
                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {tag.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {tag.description}
                </p>
              )}
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {tag.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tags.length === 0 && !loading && (
        <div className="text-center py-12">
          <FiTag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No tags found
          </h3>
          <p className="mt-2 text-gray-600">
            Get started by creating your first tag.
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-md shadow-xl rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Create New Tag
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter tag name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Select a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  {categories.slice(1).map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex space-x-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-md border-2 transition-all ${
                        formData.color === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTag}
                disabled={!formData.name || !formData.departmentId}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-md shadow-xl rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Tag</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter tag name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Select a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  {categories.slice(1).map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex space-x-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-md border-2 transition-all ${
                        formData.color === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTag(null);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTag}
                disabled={!formData.name || !formData.departmentId}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
