/**
 * Generate the next version number for a document
 * @param {Array} versions - Array of existing versions
 * @returns {number} Next version number
 */
export function generateNextVersion(versions = []) {
  if (!versions.length) return 1;

  const versionNumbers = versions.map((v) => parseInt(v.version) || 1);
  return Math.max(...versionNumbers) + 1;
}

/**
 * Format version display text
 * @param {number|string} version - Version number
 * @param {boolean} isLatest - Whether this is the latest version
 * @returns {string} Formatted version text
 */
export function formatVersionDisplay(version, isLatest = false) {
  const versionText = `v${version}`;
  return isLatest ? `${versionText} (Latest)` : versionText;
}

/**
 * Sort versions by version number (latest first)
 * @param {Array} versions - Array of versions
 * @returns {Array} Sorted versions
 */
export function sortVersions(versions = []) {
  return [...versions].sort((a, b) => {
    const versionA = parseInt(a.version) || 1;
    const versionB = parseInt(b.version) || 1;
    return versionB - versionA; // Latest first
  });
}

/**
 * Get version change type for email notifications
 * @param {Object} action - Action object with type and data
 * @returns {string} Change type
 */
export function getVersionChangeType(action) {
  switch (action.type) {
    case "upload":
      return "version_upload";
    case "restore":
      return "version_restore";
    default:
      return "version_update";
  }
}

/**
 * Generate version description
 * @param {Object} action - Action object
 * @param {Object} user - User who performed the action
 * @returns {string} Version description
 */
export function generateVersionDescription(action, user) {
  const userName = user?.name || "Unknown User";
  const timestamp = new Date().toLocaleDateString();

  switch (action.type) {
    case "upload":
      return `New version uploaded by ${userName} on ${timestamp}`;
    case "restore":
      return `Version restored by ${userName} on ${timestamp}`;
    default:
      return `Version updated by ${userName} on ${timestamp}`;
  }
}

/**
 * Validate file for version upload
 * @param {File} file - File to validate
 * @param {Object} originalDocument - Original document for comparison
 * @returns {Object} Validation result
 */
export function validateVersionFile(file, originalDocument) {
  const errors = [];

  if (!file) {
    errors.push("No file selected");
    return { isValid: false, errors };
  }

  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push("File size exceeds 50MB limit");
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push("File is empty");
  }

  // Validate file type (basic check)
  const allowedTypes = ["application/", "text/", "image/", "audio/", "video/"];

  const hasValidType = allowedTypes.some(
    (type) => file.type && file.type.includes(type)
  );

  if (!hasValidType) {
    errors.push("Unsupported file type");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format date for version display
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date
 */
export const formatVersionDate = (timestamp) => {
  return formatTimestamp(timestamp, "short");
};
