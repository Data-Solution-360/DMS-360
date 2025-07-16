"use client";

export default function FolderGridContent({
  title,
  icon,
  viewMode,
  items,
  renderGridItem,
  renderListItem,
  onDeleteItem,
  user,
  mounted,
  selectedFolder,
  expandToFolderId,
  onFolderSelect,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-gray-700 flex items-center">
          {icon}
          {title}
        </h3>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map(renderGridItem)}
        </div>
      ) : (
        <div className="space-y-1">{items.map(renderListItem)}</div>
      )}
    </div>
  );
}
