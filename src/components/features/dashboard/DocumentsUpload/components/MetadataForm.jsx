"use client";

import React from "react";
import { FiShield, FiUser } from "react-icons/fi";

export default function MetadataForm({
  metadata,
  onMetadataChange,
  uploading,
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onMetadataChange({
      ...metadata,
      [name]: value,
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-4">
        Document Information
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={metadata.description}
            onChange={handleInputChange}
            disabled={uploading}
            placeholder="Enter document description..."
            rows="3"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            name="documentType"
            value={metadata.documentType}
            onChange={handleInputChange}
            disabled={uploading}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select document type</option>
            <option value="contract">Contract</option>
            <option value="invoice">Invoice</option>
            <option value="report">Report</option>
            <option value="presentation">Presentation</option>
            <option value="spreadsheet">Spreadsheet</option>
            <option value="policy">Policy</option>
            <option value="manual">Manual</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={metadata.priority}
            onChange={handleInputChange}
            disabled={uploading}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Confidentiality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiShield className="inline mr-1" />
            Confidentiality
          </label>
          <select
            name="confidentiality"
            value={metadata.confidentiality}
            onChange={handleInputChange}
            disabled={uploading}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="confidential">Confidential</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiUser className="inline mr-1" />
            Author
          </label>
          <input
            type="text"
            name="author"
            value={metadata.author}
            onChange={handleInputChange}
            disabled={uploading}
            placeholder="Enter author name..."
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Fill in the document metadata to help with organization and
        searchability
      </p>
    </div>
  );
}
