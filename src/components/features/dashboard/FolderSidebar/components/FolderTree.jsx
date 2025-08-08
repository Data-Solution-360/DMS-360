import React from "react";
import FolderItem from "./FolderItem";

const FolderTree = ({
  folders,
  expandedFolders,
  selectedFolderId,
  highlightedFolderId = null,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  level = 0,
}) => {
  return (
    <div className="space-y-1 bg-white text-black">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          isExpanded={expandedFolders.has(folder.id)}
          isSelected={selectedFolderId === folder.id}
          isHighlighted={highlightedFolderId === folder.id}
          onToggle={onToggle}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level}
        >
          {folder.children && folder.children.length > 0 && (
            <FolderTree
              folders={folder.children}
              expandedFolders={expandedFolders}
              selectedFolderId={selectedFolderId}
              highlightedFolderId={highlightedFolderId}
              onToggle={onToggle}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          )}
        </FolderItem>
      ))}
    </div>
  );
};

export default FolderTree;
