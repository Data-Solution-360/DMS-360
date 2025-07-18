"use client";

import React, { useEffect, useState } from "react";

export default function DepartmentSelector({
  selectedDepartment,
  onDepartmentChange,
  uploading,
}) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tags/departments");
      const result = await response.json();

      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/80">
        Department *
      </label>
      <div className="relative">
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          disabled={uploading || loading}
          className="pl-12 block w-full rounded-2xl bg-white/10 border border-white/20 text-white shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        >
          <option value="" className="bg-gray-800 text-white">
            Select a department...
          </option>
          {departments.map((dept) => (
            <option key={dept} value={dept} className="bg-gray-800 text-white">
              {dept}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-white/60">
        Select a department to see relevant tags
      </p>
    </div>
  );
}
