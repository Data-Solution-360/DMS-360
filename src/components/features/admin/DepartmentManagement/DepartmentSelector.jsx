"use client";

import { useEffect, useState } from "react";
import { useApi } from "../../../../hooks/useApi";

export default function DepartmentSelector({
  selectedDepartment,
  onDepartmentChange,
  uploading,
}) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { apiCall } = useApi();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      // Use the authenticated API call
      const result = await apiCall("/api/departments");

      if (result.success) {
        // Extract department names from the department objects
        const departmentNames = result.data.map((dept) => dept.name);
        setDepartments(departmentNames);
      } else {
        setError(result.error || "Failed to load departments");
        console.error("Department fetch error:", result.error);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError(error.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        Department *
      </label>
      <div className="relative">
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          disabled={uploading || loading}
          className="block w-full rounded-md bg-white border border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        >
          <option value="" className="bg-white text-gray-900">
            {loading ? "Loading departments..." : "Select a department..."}
          </option>
          {departments.map((dept) => (
            <option key={dept} value={dept} className="bg-white text-gray-900">
              {dept}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        Select a department to see relevant tags
      </p>
    </div>
  );
}
