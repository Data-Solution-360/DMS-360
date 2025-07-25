import React, { useState } from "react";
import { FOLDER_ITEM_STYLES, FolderIcons } from "../utils/constants";
import { getLevelPadding, hasChildren } from "../utils/helpers";

const FolderItem = ({
  folder,
  level = 0,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  children,
}) => {
  const [showActions, setShowActions] = useState(false);
  const folderHasChildren = hasChildren(folder);

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowActions(false);
    onEdit?.(folder);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowActions(false);
    onDelete?.(folder);
  };

  return (
    <div className={FOLDER_ITEM_STYLES.container}>
      <div
        className={`${FOLDER_ITEM_STYLES.button} ${
          isSelected ? FOLDER_ITEM_STYLES.selected : FOLDER_ITEM_STYLES.hover
        }`}
        style={{ paddingLeft: getLevelPadding(level) }}
        onClick={() => onSelect(folder)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Animated background gradient */}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isSelected ? "opacity-100" : ""
          }`}
        />

        {/* Glowing border effect */}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${
            isSelected ? "opacity-20" : ""
          }`}
        />

        <div className="relative z-10 flex items-center w-full">
          {/* Expand/Collapse button */}
          {folderHasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(folder.id);
              }}
              className={FOLDER_ITEM_STYLES.expandButton}
            >
              {isExpanded ? (
                <FolderIcons.ChevronDown className="h-3 w-3 text-emerald-300 group-hover:text-emerald-200 transition-colors" />
              ) : (
                <FolderIcons.ChevronRight className="h-3 w-3 text-emerald-300 group-hover:text-emerald-200 transition-colors" />
              )}
            </button>
          )}

          {/* Folder icon */}
          <div
            className={`${FOLDER_ITEM_STYLES.icon} ${
              isSelected ? "shadow-emerald-500/50" : ""
            }`}
          >
            <FolderIcons.Folder className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" />
            {folder.isRestricted && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🔓</span>
              </div>
            )}
          </div>

          {/* Folder name */}
          <span
            className={`${FOLDER_ITEM_STYLES.name} ${
              isSelected
                ? FOLDER_ITEM_STYLES.nameSelected
                : FOLDER_ITEM_STYLES.nameDefault
            }`}
          >
            {folder.name}
          </span>

          {/* Document count */}
          {folder.documentCount > 0 && (
            <span
              className={`${FOLDER_ITEM_STYLES.counter} ${
                isSelected
                  ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50"
                  : "bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white/80"
              }`}
            >
              {folder.documentCount}
            </span>
          )}

          {/* Child count indicator */}
          {folderHasChildren && (
            <span
              className={`${FOLDER_ITEM_STYLES.counter} ml-2 ${
                isSelected
                  ? "bg-blue-500/30 text-blue-200 border border-blue-500/50"
                  : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300"
              }`}
            >
              {folder.children.length}
            </span>
          )}

          {/* Actions menu */}
          {showActions && onEdit && onDelete && (
            <div className="ml-auto flex items-center space-x-1">
              <button
                onClick={handleEdit}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Edit folder"
              >
                <FolderIcons.Edit className="h-3 w-3 text-blue-400" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Delete folder"
              >
                <FolderIcons.Trash className="h-3 w-3 text-red-400" />
              </button>
            </div>
          )}
        </div>

        {/* Floating particles */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500" />
      </div>

      {/* Render children */}
      {folderHasChildren && isExpanded && (
        <div className={FOLDER_ITEM_STYLES.children}>{children}</div>
      )}
    </div>
  );
};

export default FolderItem;
