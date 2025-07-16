"use client";

import { useEffect, useRef, useState } from "react";
// Temporary icon replacements
const FiSearch = () => <span>🔍</span>;
const FiX = () => <span>✕</span>;

export default function TagSearch({
  onTagSelect,
  placeholder = "Search tags...",
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTags = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/tags/search?q=${encodeURIComponent(query)}&limit=10`
        );
        const result = await response.json();

        if (result.success) {
          setSuggestions(result.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error searching tags:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(searchTags, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleTagSelect = (tag) => {
    onTagSelect(tag);
    setQuery("");
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {suggestions.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagSelect(tag)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 capitalize">
                      {tag.name}
                    </div>
                    {tag.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {tag.description}
                      </div>
                    )}
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize flex-shrink-0">
                    {tag.category}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            query.trim() && (
              <div className="p-4 text-center text-gray-500">
                No tags found matching "{query}"
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
