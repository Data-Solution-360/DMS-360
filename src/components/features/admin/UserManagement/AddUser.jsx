"use client";

import { Eye, EyeOff, RefreshCw, Upload, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useApi } from "../../../../hooks/useApi";

export default function AddUser() {
  const [formData, setFormData] = useState({
    role: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { apiCall } = useApi();

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("role", formData.role);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("password", formData.password);
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      const result = await apiCall("/api/admin/users", {
        method: "POST",
        body: formDataToSend,
      });

      if (result.success) {
        // Show success message with SweetAlert
        await Swal.fire({
          title: "🎉 User Created Successfully!",
          text: `User "${formData.name}" has been created with role "${formData.role}".`,
          icon: "success",
          confirmButtonText: "Create Another User",
          confirmButtonColor: "#0ea5e9",
          showCancelButton: true,
          cancelButtonText: "View Users",
          cancelButtonColor: "#6b7280",
          background: "#ffffff",
          color: "#1f2937",
          backdrop: `
            rgba(0,0,123,0.4)
            url("/images/nyan-cat.gif")
            left top
            no-repeat
          `,
        }).then((result) => {
          if (result.isConfirmed) {
            // User clicked "Create Another User" - reset form
            resetForm();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // User clicked "View Users" - redirect to user list
            window.location.href = "/dashboard/users/user-list";
          }
        });
      } else {
        // Show error message with SweetAlert
        Swal.fire({
          title: "❌ User Creation Failed",
          text: result.error || "Failed to create user. Please try again.",
          icon: "error",
          confirmButtonText: "Try Again",
          confirmButtonColor: "#ef4444",
          background: "#ffffff",
          color: "#1f2937",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      // Show error message with SweetAlert
      Swal.fire({
        title: "❌ Error",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      role: "",
      name: "",
      email: "",
      mobile: "",
      password: "",
    });
    setSelectedImage(null);
  };

  // Don't render until mounted to prevent hydration error
  if (!mounted) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UserPlus className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add User</h1>
          <p className="text-gray-600">
            Create new user accounts with appropriate permissions.
          </p>
        </div>
      </div>

      {/* Add User Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role :
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">- Select Role -</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name :
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email :
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile :
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password :
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Generate Password"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image :
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">
                  Drop files here or click to choose
                </p>
                {selectedImage && (
                  <p className="text-sm text-blue-600 mt-2">
                    {selectedImage.name}
                  </p>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
