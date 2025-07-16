import React, { useCallback } from "react";
import CreateFolderModal from "./components/CreateFolderModal";
import FolderTree from "./components/FolderTree";
import { useFolderSidebar } from "./hooks/useFolderSidebar";
import { FOLDER_STYLES, FolderIcons } from "./utils/constants";

const FolderSidebar = ({
  folders = [],
  onFolderSelect,
  selectedFolderId,
  onFolderCreated,
}) => {
  const {
    expandedFolders,
    isCreatingFolder,
    newFolderName,
    selectedParentId,
    creating,
    toggleFolder,
    expandParentFolders,
    openCreateModal,
    closeCreateModal,
    createFolder,
    setNewFolderName,
    setSelectedParentId,
  } = useFolderSidebar(folders, onFolderCreated);

  const handleFolderSelect = useCallback(
    (folder) => {
      onFolderSelect(folder);
      expandParentFolders(folder.id);
    },
    [onFolderSelect, expandParentFolders]
  );

  return (
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
            expandedFolders={expandedFolders}
            selectedFolderId={selectedFolderId}
            onToggle={toggleFolder}
            onSelect={handleFolderSelect}
          />
        )}
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
    </div>
  );
};

export default FolderSidebar;
