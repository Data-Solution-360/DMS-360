"use client";

import React, { useCallback, useState } from "react";
import CreateFolderModal from "./components/CreateFolderModal";
import DeleteFolderModal from "./components/DeleteFolderModal";
import EditFolderModal from "./components/EditFolderModal";
import FolderTree from "./components/FolderTree";
import { useFolderSidebar } from "./hooks/useFolderSidebar";
import { FOLDER_STYLES, FolderIcons } from "./utils/constants";

const FolderSidebar = ({
  folders = [],
  onFolderSelect,
  selectedFolderId,
  onFolderCreated,
  onFolderUpdated,
  onFolderDeleted,
  expandedFolders = new Set(), // New prop
  setExpandedFolders, // New prop
  highlightedFolderId = null, // New prop
}) => {
  const {
    expandedFolders: internalExpandedFolders,
    isCreatingFolder,
    newFolderName,
    selectedParentId,
    creating,
    toggleFolder: hookToggleFolder, // Rename to avoid conflict
    expandParentFolders,
    openCreateModal,
    closeCreateModal,
    createFolder,
    setNewFolderName,
    setSelectedParentId,
  } = useFolderSidebar(folders, onFolderCreated);

  // Edit/Delete modal states
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

  // Use the external expandedFolders if provided, otherwise use internal
  const currentExpandedFolders =
    expandedFolders.size > 0 ? expandedFolders : internalExpandedFolders;

  // Create a toggle function that uses external state if provided
  const toggleFolder = useCallback(
    (folderId) => {
      if (setExpandedFolders) {
        // Use external state
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
        // Use internal hook function
        hookToggleFolder(folderId);
      }
    },
    [setExpandedFolders, hookToggleFolder]
  );

  return (
    <>
      <div className={FOLDER_STYLES.container}>
        {/* Header */}
        <div className={FOLDER_STYLES.header}>
          <h3 className={FOLDER_STYLES.title}>📁 Folders</h3>
          <button onClick={openCreateModal} className={FOLDER_STYLES.addButton}>
            <FolderIcons.FolderPlus className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>

        {/* Folder list */}
        <div className={FOLDER_STYLES.scrollArea}>
          {folders.length === 0 ? (
            <div className={FOLDER_STYLES.emptyState}>
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderIcons.Folder className="h-8 w-8 text-emerald-300" />
              </div>
              <p className="text-white/60 text-sm">No folders yet</p>
              <p className="text-white/40 text-xs mt-1">
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

      {/* Create folder modal */}
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

      {/* Edit folder modal */}
      <EditFolderModal
        isOpen={!!editingFolder}
        folder={editingFolder}
        onClose={() => setEditingFolder(null)}
        onEdit={handleFolderEdited}
      />

      {/* Delete folder modal */}
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
