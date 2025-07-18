"use client";

import React, { useEffect, useState } from "react";
import { FiTag, FiX } from "react-icons/fi";

export default function TagSelector({
  selectedTags,
  onTagsChange,
  uploading,
  selectedDepartment, // Still used for context but not as a filter
}) {
  const [availableTags, setAvailableTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all available tags (not filtered by department)
  useEffect(() => {
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tags");
      const result = await response.json();

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
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
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

  // Group filtered tags by department for better organization
  const groupedTags = filteredTags.reduce((groups, tag) => {
    const dept = tag.department || "Other";
    if (!groups[dept]) {
      groups[dept] = [];
    }
    groups[dept].push(tag);
    return groups;
  }, {});

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
      <label className="block text-sm font-medium text-white/80">Tags</label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-3 py-2 rounded-2xl text-sm font-medium text-white backdrop-blur-sm border border-white/20"
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
          <FiTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={uploading || loading}
            className="pl-12 block w-full rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 shadow-sm focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-offset-0 backdrop-blur-sm py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={
              loading
                ? "Loading tags..."
                : availableTags.length > 0
                ? "Search tags from all departments..."
                : "No tags available"
            }
          />
        </div>

        {/* Dropdown with Department Groups */}
        {showDropdown && Object.keys(groupedTags).length > 0 && (
          <div className="absolute z-10 mt-2 w-full bg-gray-800/95 backdrop-blur-xl shadow-2xl max-h-60 rounded-2xl py-2 text-base border border-white/20 overflow-auto focus:outline-none sm:text-sm">
            {Object.entries(groupedTags).map(([department, tags]) => (
              <div key={department}>
                {/* Department Header */}
                <div className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider border-b border-white/10">
                  {department}
                </div>

                {/* Tags in Department */}
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => handleTagSelect(tag)}
                    className="cursor-pointer select-none relative py-3 pl-6 pr-9 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3 border border-white/20"
                        style={{ backgroundColor: tag.color || "#3B82F6" }}
                      ></div>
                      <span className="font-medium text-white">
                        {tag.displayName || tag.name}
                      </span>
                      {tag.description && (
                        <span className="ml-2 text-white/60 text-sm">
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

      <p className="text-xs text-white/60">
        {availableTags.length > 0
          ? `${availableTags.length} tags available from all departments. ${
              selectedDepartment
                ? `Primary department: ${selectedDepartment}`
                : ""
            }`
          : "No tags available"}
      </p>
    </div>
  );
}
