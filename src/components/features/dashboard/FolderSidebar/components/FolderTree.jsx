import React from "react";
import FolderItem from "./FolderItem";

const FolderTree = ({
  folders,
  expandedFolders,
  selectedFolderId,
  onToggle,
  onSelect,
  level = 0,
}) => {
  return (
    <>
      {folders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.id);
        const isSelected = selectedFolderId === folder.id;

        return (
          <FolderItem
            key={folder.id}
            folder={folder}
            level={level}
            isExpanded={isExpanded}
            isSelected={isSelected}
            onToggle={onToggle}
            onSelect={onSelect}
          >
            {folder.children?.length > 0 && (
              <FolderTree
                folders={folder.children}
                expandedFolders={expandedFolders}
                selectedFolderId={selectedFolderId}
                onToggle={onToggle}
                onSelect={onSelect}
                level={level + 1}
              />
            )}
          </FolderItem>
        );
      })}
    </>
  );
};

export default FolderTree;
