"use client";

import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { FiTag, FiX } from "react-icons/fi";

export default function TagSelector({
  selectedTags,
  onTagsChange,
  uploading,
  selectedDepartment, // Now used to prioritize matching tags
}) {
  const [availableTags, setAvailableTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { apiCall } = useApi();

  // Fetch all available tags (not filtered by department)
  useEffect(() => {
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    try {
      setLoading(true);
      setError("");

      // Use the authenticated API call
      const result = await apiCall("/api/tags");

      if (result.success) {
        // Sort tags by department for better organization
        const sortedTags = result.data.sort((a, b) => {
          const deptA = a.department || "";
          const deptB = b.department || "";
          if (deptA === deptB) {
            return (a.displayName || a.name).localeCompare(
              b.displayName || b.name
            );
          }
          return deptA.localeCompare(deptB);
        });
        setAvailableTags(sortedTags);
      } else {
        setError(result.error || "Failed to load tags");
        console.error("Tag fetch error:", result.error);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setError(error.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  // Filter tags based on search query and exclude already selected tags
  const filteredTags = availableTags.filter(
    (tag) =>
      ((tag.displayName || tag.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        (tag.department || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) &&
      !selectedTags.some((selected) => selected.id === tag.id)
  );

  // Sort filtered tags: selected department first, then others
  const sortedFilteredTags = filteredTags.sort((a, b) => {
    const aDept = a.department || "";
    const bDept = b.department || "";

    // If selectedDepartment is set, prioritize matching tags
    if (selectedDepartment) {
      const aMatches = aDept.toLowerCase() === selectedDepartment.toLowerCase();
      const bMatches = bDept.toLowerCase() === selectedDepartment.toLowerCase();

      if (aMatches && !bMatches) return -1; // a comes first
      if (!aMatches && bMatches) return 1; // b comes first
      if (aMatches && bMatches) {
        // Both match, sort by name
        return (a.displayName || a.name).localeCompare(b.displayName || b.name);
      }
    }

    // If no department selected or neither matches, sort by department then name
    if (aDept !== bDept) {
      return aDept.localeCompare(bDept);
    }
    return (a.displayName || a.name).localeCompare(b.displayName || b.name);
  });

  // Group filtered tags by department for better organization
  const groupedTags = sortedFilteredTags.reduce((groups, tag) => {
    const dept = tag.department || "Other";
    if (!groups[dept]) {
      groups[dept] = [];
    }
    groups[dept].push(tag);
    return groups;
  }, {});

  // Sort the groups: selected department first, then others
  const sortedGroups = Object.entries(groupedTags).sort(([aDept], [bDept]) => {
    if (selectedDepartment) {
      const aMatches = aDept.toLowerCase() === selectedDepartment.toLowerCase();
      const bMatches = bDept.toLowerCase() === selectedDepartment.toLowerCase();

      if (aMatches && !bMatches) return -1; // a comes first
      if (!aMatches && bMatches) return 1; // b comes first
    }

    // If no department selected or both match/don't match, sort alphabetically
    return aDept.localeCompare(bDept);
  });

  const handleTagSelect = (tag) => {
    onTagsChange([...selectedTags, tag]);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleTagRemove = (tagToRemove) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagToRemove.id));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(e.target.value.length > 0 || filteredTags.length > 0);
  };

  const handleInputFocus = () => {
    if (filteredTags.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for tag selection
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">Tags</label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-3 py-2 rounded-2xl text-sm font-medium text-white backdrop-blur-sm border border-gray-300"
              style={{ backgroundColor: tag.color || "#3B82F6" }}
            >
              <span className="flex flex-col items-start">
                <span>{tag.displayName || tag.name}</span>
                <span className="text-xs opacity-75">{tag.department}</span>
              </span>
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                disabled={uploading}
                className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag Search Input */}
      <div className="relative">
        <div className="relative">
          <FiTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={uploading || loading}
            className="pl-12 block w-full rounded-md bg-white border border-gray-300 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={
              loading
                ? "Loading tags..."
                : error
                ? "Error loading tags"
                : availableTags.length > 0
                ? selectedDepartment
                  ? `Search tags (${selectedDepartment} tags shown first)...`
                  : "Search tags from all departments..."
                : "No tags available"
            }
          />
        </div>

        {/* Dropdown with Department Groups */}
        {showDropdown && sortedGroups.length > 0 && (
          <div className="absolute z-10 mt-2 w-full bg-white shadow-lg max-h-60 rounded-md py-2 text-base border border-gray-200 overflow-auto focus:outline-none sm:text-sm">
            {sortedGroups.map(([department, tags]) => (
              <div key={department}>
                {/* Department Header */}
                <div
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${
                    department.toLowerCase() ===
                    selectedDepartment?.toLowerCase()
                      ? "text-blue-600 bg-blue-50 border-blue-200"
                      : "text-gray-500 border-gray-100"
                  }`}
                >
                  {department}
                  {department.toLowerCase() ===
                    selectedDepartment?.toLowerCase() && (
                    <span className="ml-2 text-xs text-blue-500">
                      (Selected Department)
                    </span>
                  )}
                </div>

                {/* Tags in Department */}
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => handleTagSelect(tag)}
                    className="cursor-pointer select-none relative py-3 pl-6 pr-9 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3 border border-gray-200"
                        style={{ backgroundColor: tag.color || "#3B82F6" }}
                      ></div>
                      <span className="font-medium text-gray-900">
                        {tag.displayName || tag.name}
                      </span>
                      {tag.description && (
                        <span className="ml-2 text-gray-500 text-sm">
                          - {tag.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <p className="text-xs text-gray-500">
        {loading
          ? "Loading tags..."
          : error
          ? "Error loading tags"
          : availableTags.length > 0
          ? selectedDepartment
            ? `${availableTags.length} tags available. ${selectedDepartment} tags shown first.`
            : `${availableTags.length} tags available from all departments.`
          : "No tags available"}
      </p>
    </div>
  );
}
