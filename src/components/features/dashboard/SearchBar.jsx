"use client";

import { useState } from "react";

// Temporary icon replacements
const FiSearch = () => <span>🔍</span>;
const FiX = () => <span>✕</span>;

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Search input container */}
      <div
        className={`relative flex items-center bg-white/10 backdrop-blur-xl border-2 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
          isFocused
            ? "border-emerald-500/50 shadow-emerald-500/25"
            : "border-white/20 hover:border-emerald-500/30"
        }`}
      >
        {/* Search icon */}
        <div className="pl-4 pr-3">
          <FiSearch
            className={`h-5 w-5 transition-colors duration-300 ${
              isFocused ? "text-emerald-400" : "text-white/60"
            }`}
          />
        </div>

        {/* Input field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 py-3 px-3 bg-transparent text-white placeholder-white/60 focus:outline-none text-sm font-medium"
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            className="pr-4 pl-2 p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 transform hover:scale-110"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Glowing effect on focus */}
      {isFocused && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 opacity-0 animate-pulse blur-xl"></div>
      )}

      {/* Floating particles */}
      <div className="absolute top-2 right-2 w-1 h-1 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
    </div>
  );
}
