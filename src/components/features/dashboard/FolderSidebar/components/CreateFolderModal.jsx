import React from "react";
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
  if (!isOpen) return null;

  const selectedFolder = selectedParentId
    ? findFolderById(folders, selectedParentId)
    : null;
  const path = selectedParentId
    ? getFolderPath(folders, selectedParentId)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create New Folder</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <FolderIcons.Close className="h-6 w-6" />
          </button>
        </div>

        {/* Parent Folder Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Parent Folder (Optional)
          </label>
          <div className="bg-white/5 rounded-xl p-3 max-h-32 overflow-y-auto">
            {/* Root Level Option */}
            <div
              className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedParentId === null
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                  : "hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5"
              }`}
              onClick={() => onParentSelect(null)}
            >
              <div className="w-5 h-5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mr-3">
                <FolderIcons.Folder className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-white/80">Root Level</span>
            </div>

            {/* Folder Options */}
            <FolderTree
              folders={folders}
              expandedFolders={new Set()} // All collapsed for selection
              selectedFolderId={selectedParentId}
              onToggle={() => {}} // No expansion in modal
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
              <div className="text-sm text-white/90">
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
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Folder Name *
          </label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter folder name..."
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!newFolderName.trim() || creating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
