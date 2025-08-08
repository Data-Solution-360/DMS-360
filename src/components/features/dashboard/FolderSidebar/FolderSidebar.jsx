"use client";

import React, { useCallback, useState } from "react";
import CreateFolderModal from "./components/CreateFolderModal";
import DeleteFolderModal from "./components/DeleteFolderModal";
import EditFolderModal from "./components/EditFolderModal";
import FolderTree from "./components/FolderTree";
import { useFolderSidebar } from "./hooks/useFolderSidebar";

const FolderSidebar = ({
  folders = [],
  onFolderSelect,
  selectedFolderId,
  onFolderCreated,
  onFolderUpdated,
  onFolderDeleted,
  expandedFolders = new Set(),
  setExpandedFolders,
  highlightedFolderId = null,
}) => {
  const {
    expandedFolders: internalExpandedFolders,
    isCreatingFolder,
    newFolderName,
    selectedParentId,
    creating,
    toggleFolder: hookToggleFolder,
    expandParentFolders,
    openCreateModal,
    closeCreateModal,
    createFolder,
    setNewFolderName,
    setSelectedParentId,
  } = useFolderSidebar(folders, onFolderCreated);

  const [editingFolder, setEditingFolder] = useState(null);
  const [deletingFolder, setDeletingFolder] = useState(null);

  const handleFolderSelect = useCallback(
    (folder) => {
      onFolderSelect(folder);
      expandParentFolders(folder.id);
    },
    [onFolderSelect, expandParentFolders]
  );

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
  };

  const handleDeleteFolder = (folder) => {
    setDeletingFolder(folder);
  };

  const handleFolderEdited = (folder, newName) => {
    if (onFolderUpdated) {
      onFolderUpdated({ ...folder, name: newName });
    }
    setEditingFolder(null);
  };

  const handleFolderDeleted = (folder) => {
    if (onFolderDeleted) {
      onFolderDeleted(folder);
    }
    setDeletingFolder(null);
  };

  const currentExpandedFolders =
    expandedFolders.size > 0 ? expandedFolders : internalExpandedFolders;

  const toggleFolder = useCallback(
    (folderId) => {
      if (setExpandedFolders) {
        setExpandedFolders((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(folderId)) {
            newSet.delete(folderId);
          } else {
            newSet.add(folderId);
          }
          return newSet;
        });
      } else {
        hookToggleFolder(folderId);
      }
    },
    [setExpandedFolders, hookToggleFolder]
  );

  return (
    <>
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📁 Folders</h3>
          <button 
            onClick={openCreateModal} 
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Create new folder"
          >
            <span className="text-sm">+</span>
          </button>
        </div>

        {/* Folder list */}
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {folders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📁</span>
              </div>
              <p className="text-gray-600 text-sm">No folders yet</p>
              <p className="text-gray-500 text-xs mt-1">
                Create your first folder to get started
              </p>
            </div>
          ) : (
            <FolderTree
              folders={folders}
              expandedFolders={currentExpandedFolders}
              selectedFolderId={selectedFolderId}
              highlightedFolderId={highlightedFolderId}
              onToggle={toggleFolder}
              onSelect={handleFolderSelect}
              onEdit={handleEditFolder}
              onDelete={handleDeleteFolder}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isCreatingFolder}
        folders={folders}
        newFolderName={newFolderName}
        selectedParentId={selectedParentId}
        creating={creating}
        onClose={closeCreateModal}
        onCreate={createFolder}
        onNameChange={setNewFolderName}
        onParentSelect={setSelectedParentId}
      />

      <EditFolderModal
        isOpen={!!editingFolder}
        folder={editingFolder}
        onClose={() => setEditingFolder(null)}
        onEdit={handleFolderEdited}
      />

      <DeleteFolderModal
        isOpen={!!deletingFolder}
        folder={deletingFolder}
        onClose={() => setDeletingFolder(null)}
        onDelete={handleFolderDeleted}
      />
    </>
  );
};

export default FolderSidebar;
