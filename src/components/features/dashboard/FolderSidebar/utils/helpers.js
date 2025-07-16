/**
 * Find a folder by ID in nested structure
 */
export const findFolderById = (folders, targetId) => {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return folder;
    }
    if (folder.children?.length > 0) {
      const found = findFolderById(folder.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Get path to a folder (array of parent IDs)
 */
export const getFolderPath = (folders, targetId, path = []) => {
  for (const folder of folders) {
    const currentPath = [...path, folder.id];
    if (folder.id === targetId) {
      return currentPath;
    }
    if (folder.children?.length > 0) {
      const found = getFolderPath(folder.children, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Check if folder has children
 */
export const hasChildren = (folder) => {
  return folder.children && folder.children.length > 0;
};

/**
 * Generate padding for folder level
 */
export const getLevelPadding = (level) => {
  return `${level * 16 + 12}px`;
};
