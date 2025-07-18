"use client";

import { useEffect, useState } from "react";
import { FiEdit, FiPlus, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",
    isActive: true,
  });

  useEffect(() => {
    fetchDepartments();
  }, [searchTerm]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/departments");
      const result = await response.json();

      if (result.success) {
        let filteredDepartments = result.data;

        if (searchTerm) {
          filteredDepartments = result.data.filter(
            (dept) =>
              dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              dept.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              dept.manager?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setDepartments(filteredDepartments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      manager: "",
      isActive: true,
    });
  };

  const handleCreateDepartment = async () => {
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateModal(false);
        resetForm();
        fetchDepartments();
      } else {
        alert(result.error || "Failed to create department");
      }
    } catch (error) {
      console.error("Error creating department:", error);
      alert("Failed to create department");
    }
  };

  const handleEditDepartment = async () => {
    try {
      const response = await fetch("/api/departments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: editingDepartment.id, ...formData }),
      });

      const result = await response.json();

      if (result.success) {
        setShowEditModal(false);
        setEditingDepartment(null);
        resetForm();
        fetchDepartments();
      } else {
        alert(result.error || "Failed to update department");
      }
    } catch (error) {
      console.error("Error updating department:", error);
      alert("Failed to update department");
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      const response = await fetch(`/api/departments?id=${departmentId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        fetchDepartments();
      } else {
        alert(result.error || "Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department");
    }
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
      manager: department.manager || "",
      isActive: department.isActive !== false,
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            Department Management
          </h3>
          <p className="text-white/70 text-lg">
            Create and manage departments for tag organization
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Create Department
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 block w-full rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-4 text-white/70 text-lg">Loading departments...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <div
              key={department.id}
              className="group bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-400/30">
                      <FiUsers className="h-6 w-6 text-purple-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white group-hover:text-purple-200 transition-colors duration-200">
                        {department.name}
                      </h4>
                      {department.manager && (
                        <p className="text-sm text-white/60">
                          Manager: {department.manager}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(department)}
                      className="p-2 text-white/60 hover:text-purple-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="p-2 text-white/60 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {department.description && (
                  <p className="text-sm text-white/70 mb-4">
                    {department.description}
                  </p>
                )}
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      department.isActive
                        ? "bg-green-500/20 text-green-300 border-green-400/30"
                        : "bg-gray-500/20 text-gray-300 border-gray-400/30"
                    }`}
                  >
                    {department.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {departments.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-purple-500/10 opacity-50 blur-2xl"></div>
            <FiUsers className="mx-auto h-16 w-16 text-white/40 relative z-10" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-white/80">
            No departments found
          </h3>
          <p className="mt-2 text-white/60 text-lg">
            Get started by creating your first department.
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-gray-900/85 backdrop-blur-xl border border-white/20 w-full max-w-md shadow-2xl rounded-3xl p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white">
                Create New Department
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Enter department name"
                />
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
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Manager
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) =>
                    setFormData({ ...formData, manager: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Department manager name"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-white/20 rounded bg-white/10"
                />
                <label
                  htmlFor="isActive"
                  className="ml-3 text-sm text-white/80"
                >
                  Active
                </label>
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
                onClick={handleCreateDepartment}
                disabled={!formData.name}
                className="px-6 py-3 text-sm font-medium text-white bg-purple-500 border border-transparent rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Create Department
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
              <h3 className="text-2xl font-semibold text-white">
                Edit Department
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Enter department name"
                />
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
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Manager
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) =>
                    setFormData({ ...formData, manager: e.target.value })
                  }
                  className="block w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4"
                  placeholder="Department manager name"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-white/20 rounded bg-white/10"
                />
                <label
                  htmlFor="editIsActive"
                  className="ml-3 text-sm text-white/80"
                >
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDepartment(null);
                  resetForm();
                }}
                className="px-6 py-3 text-sm font-medium text-white/80 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditDepartment}
                disabled={!formData.name}
                className="px-6 py-3 text-sm font-medium text-white bg-purple-500 border border-transparent rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Update Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
