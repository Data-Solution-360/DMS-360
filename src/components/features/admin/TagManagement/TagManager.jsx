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

  // Form state
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
      // Get department name from departmentId
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
        departmentId: undefined, // Remove departmentId from request
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
      // Get department name from departmentId
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
        departmentId: undefined, // Remove departmentId from request
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
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            Tag Management
          </h3>
          <p className="text-white/70 text-lg">
            Create and manage tags with department associations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Create Tag
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 block w-full rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="block w-full rounded-2xl bg-white/10 border border-white/20 text-white shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
        >
          <option value="all" className="bg-gray-800 text-white">
            All Departments
          </option>
          {departments.map((dept) => (
            <option
              key={dept.id}
              value={dept.name}
              className="bg-gray-800 text-white"
            >
              {dept.name}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full rounded-2xl bg-white/10 border border-white/20 text-white shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
        >
          {categories.map((category) => (
            <option
              key={category.value}
              value={category.value}
              className="bg-gray-800 text-white"
            >
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tags Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4 text-white/70 text-lg">Loading tags...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="group bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-400/30">
                      <FiTag className="h-6 w-6" style={{ color: tag.color }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white group-hover:text-green-200 transition-colors duration-200">
                        {tag.displayName || tag.name}
                      </h4>
                      <p className="text-sm text-white/60">
                        Department: {tag.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(tag)}
                      className="p-2 text-white/60 hover:text-green-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-2 text-white/60 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {tag.description && (
                  <p className="text-sm text-white/70 mb-4">
                    {tag.description}
                  </p>
                )}
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-400/30">
                    {tag.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tags.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-green-500/10 opacity-50 blur-2xl"></div>
            <FiTag className="mx-auto h-16 w-16 text-white/40 relative z-10" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-white/80">
            No tags found
          </h3>
          <p className="mt-2 text-white/60 text-lg">
            Get started by creating your first tag.
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-gray-800/90 backdrop-blur-xl border border-white/20 w-full max-w-md shadow-2xl rounded-3xl p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white">
                Create New Tag
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Enter tag name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Department *
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                >
                  <option value="" className="bg-gray-800 text-white">
                    Select a department...
                  </option>
                  {departments.map((dept) => (
                    <option
                      key={dept.id}
                      value={dept.id}
                      className="bg-gray-800 text-white"
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                >
                  {categories.slice(1).map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                      className="bg-gray-800 text-white"
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Color
                </label>
                <div className="flex space-x-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 ${
                        formData.color === color
                          ? "border-white scale-110"
                          : "border-white/30 hover:border-white/50"
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
                className="px-6 py-3 text-sm font-medium text-white/80 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTag}
                disabled={!formData.name || !formData.departmentId}
                className="px-6 py-3 text-sm font-medium text-white bg-green-500 border border-transparent rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md shadow-2xl rounded-3xl p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white">Edit Tag</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Enter tag name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Department *
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                >
                  <option value="" className="bg-gray-800 text-white">
                    Select a department...
                  </option>
                  {departments.map((dept) => (
                    <option
                      key={dept.id}
                      value={dept.id}
                      className="bg-gray-800 text-white"
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                >
                  {categories.slice(1).map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                      className="bg-gray-800 text-white"
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Color
                </label>
                <div className="flex space-x-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 ${
                        formData.color === color
                          ? "border-white scale-110"
                          : "border-white/30 hover:border-white/50"
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
                className="px-6 py-3 text-sm font-medium text-white/80 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTag}
                disabled={!formData.name || !formData.departmentId}
                className="px-6 py-3 text-sm font-medium text-white bg-green-500 border border-transparent rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
