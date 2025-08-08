"use client";

import React, { useState } from "react";
import { FolderIcons } from "../utils/constants";
import { findFolderById, getFolderPath } from "../utils/helpers";
import FolderTree from "./FolderTree";

const CreateFolderModal = ({
  isOpen,
  folders,
  newFolderName,
  selectedParentId,
  creating,
  onClose,
  onCreate,
  onNameChange,
  onParentSelect,
}) => {
  // Add state for expanded folders in the modal
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  if (!isOpen) return null;

  const selectedFolder = selectedParentId
    ? findFolderById(folders, selectedParentId)
    : null;
  const path = selectedParentId
    ? getFolderPath(folders, selectedParentId)
    : null;

  // Handle folder toggle in modal
  const handleToggle = (folderId) => {
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-black/20 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-black/10 flex-shrink-0">
          <h3 className="text-xl font-bold text-black">Create New Folder</h3>
          <button
            onClick={onClose}
            className="text-black/60 hover:text-black transition-colors"
          >
            <FolderIcons.Close className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 modal-scrollbar">
          {/* Parent Folder Selection */}
          <div>
            <label className="block text-sm font-medium text-black/80 mb-3">
              Parent Folder (Optional)
            </label>
            <div className="bg-black/5 rounded-xl p-3 max-h-60 overflow-y-auto border border-black/10 modal-tree-scrollbar">
              {/* Root Level Option */}
              <div
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 mb-2 ${
                  selectedParentId === null
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                    : "hover:bg-gradient-to-r hover:from-black/10 hover:to-black/5"
                }`}
                onClick={() => onParentSelect(null)}
              >
                <div className="w-5 h-5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <FolderIcons.Folder className="h-3 w-3 text-black" />
                </div>
                <span className="text-sm text-black/80">Root Level</span>
              </div>

              {/* Folder Options */}
              <FolderTree
                folders={folders}
                expandedFolders={expandedFolders}
                selectedFolderId={selectedParentId}
                onToggle={handleToggle}
                onSelect={(folder) => onParentSelect(folder.id)}
                level={0}
              />
            </div>

            {/* Selected parent path display */}
            {selectedParentId && path && (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="text-xs text-emerald-300 font-medium mb-1">
                  Selected Parent:
                </div>
                <div className="text-sm text-black/90 break-words">
                  {path.map((id, index) => {
                    const folder = findFolderById(folders, id);
                    return (
                      <span key={id}>
                        {folder?.name || "Unknown"}
                        {index < path.length - 1 && (
                          <span className="text-emerald-400 mx-1">/</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Folder Name Input */}
          <div>
            <label className="block text-sm font-medium text-black/80 mb-3">
              Folder Name *
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3 bg-black/10 border border-black/20 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
              autoFocus
            />
          </div>
        </div>

        {/* Action Buttons - Fixed */}
        <div className="flex space-x-4 p-6 border-t border-black/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 text-black rounded-xl hover:bg-gray-700 transition-colors"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!newFolderName.trim() || creating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
