"use client";

import { useState } from "react";

export default function DateFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  className = "",
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClear = () => {
    onStartDateChange("");
    onEndDateChange("");
    onClear();
  };

  const hasActiveFilter = startDate || endDate;

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
          hasActiveFilter
            ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300 shadow-emerald-500/25"
            : "bg-white/10 backdrop-blur-xl border-white/20 text-white/80 hover:border-emerald-500/30 hover:bg-white/15"
        }`}
      >
        <span className="text-lg">📅</span>
        <span className="text-sm font-medium">
          {hasActiveFilter ? "Date Filter Active" : "Filter by Date"}
        </span>
        {hasActiveFilter && (
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
        )}
        <span
          className={`transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown Panel */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 z-50 animate-slide-in-top">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Date Range Filter
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/60"
                max={endDate || undefined}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/60"
                min={startDate || undefined}
              />
            </div>

            {/* Quick Filters */}
            <div className="pt-2 border-t border-white/10">
              <p className="text-sm font-medium text-white/90 mb-3">
                Quick Filters
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    onStartDateChange(today);
                    onEndDateChange(today);
                  }}
                  className="px-3 py-2 text-xs bg-white/10 hover:bg-emerald-500/20 text-white/80 hover:text-emerald-300 rounded-lg transition-all duration-200 border border-white/10 hover:border-emerald-500/30"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    onStartDateChange(yesterday.toISOString().split("T")[0]);
                    onEndDateChange(today.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-2 text-xs bg-white/10 hover:bg-emerald-500/20 text-white/80 hover:text-emerald-300 rounded-lg transition-all duration-200 border border-white/10 hover:border-emerald-500/30"
                >
                  Last 2 Days
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    onStartDateChange(weekAgo.toISOString().split("T")[0]);
                    onEndDateChange(today.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-2 text-xs bg-white/10 hover:bg-emerald-500/20 text-white/80 hover:text-emerald-300 rounded-lg transition-all duration-200 border border-white/10 hover:border-emerald-500/30"
                >
                  Last Week
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(today.getMonth() - 1);
                    onStartDateChange(monthAgo.toISOString().split("T")[0]);
                    onEndDateChange(today.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-2 text-xs bg-white/10 hover:bg-emerald-500/20 text-white/80 hover:text-emerald-300 rounded-lg transition-all duration-200 border border-white/10 hover:border-emerald-500/30"
                >
                  Last Month
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4 border-t border-white/10">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-colors duration-200 border border-white/10"
              >
                Clear
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Display */}
      {hasActiveFilter && (
        <div className="mt-2 text-xs text-white/60">
          {startDate && endDate ? (
            <span>
              📅 {startDate} to {endDate}
            </span>
          ) : startDate ? (
            <span>📅 From {startDate}</span>
          ) : (
            <span>📅 Until {endDate}</span>
          )}
        </div>
      )}
    </div>
  );
}
