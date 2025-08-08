// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  VIEWER: "viewer",
};

// Permission levels
export const PERMISSIONS = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  ADMIN: "admin",
};

// File upload settings
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/avi",
    "video/mov",
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ],
  MAX_FILES_PER_UPLOAD: 10,
};

// MIME type to user-friendly name mapping
export const MIME_TYPE_MAPPING = {
  // PDF
  "application/pdf": "PDF",

  // Word Documents
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word",

  // Excel Spreadsheets
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "text/csv": "CSV",

  // PowerPoint Presentations
  "application/vnd.ms-powerpoint": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PowerPoint",

  // Text Files
  "text/plain": "Text",

  // Images
  "image/jpeg": "Image",
  "image/jpg": "Image",
  "image/png": "Image",
  "image/gif": "Image",
  "image/bmp": "Image",
  "image/webp": "Image",

  // Videos
  "video/mp4": "Video",
  "video/avi": "Video",
  "video/mov": "Video",
  "video/wmv": "Video",
  "video/flv": "Video",
  "video/webm": "Video",

  // Audio
  "audio/mpeg": "Audio",
  "audio/mp3": "Audio",
  "audio/wav": "Audio",
  "audio/ogg": "Audio",

  // Archives
  "application/zip": "ZIP",
  "application/x-rar-compressed": "RAR",
  "application/x-7z-compressed": "7Z",
  "application/x-tar": "TAR",
  "application/gzip": "GZIP",
};

// File type categories for search
export const FILE_TYPE_CATEGORIES = [
  { label: "All Types", value: "" },
  { label: "PDF Documents", value: "pdf" },
  { label: "Word Documents", value: "word" },
  { label: "Excel Spreadsheets", value: "excel" },
  { label: "PowerPoint Presentations", value: "powerpoint" },
  { label: "Text Files", value: "text" },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
  { label: "Audio Files", value: "audio" },
  { label: "Archives", value: "archive" },
];

// Helper function to get user-friendly file type name
export function getFileTypeName(mimeType) {
  if (!mimeType) return "Unknown";

  // Direct mapping
  if (MIME_TYPE_MAPPING[mimeType]) {
    return MIME_TYPE_MAPPING[mimeType];
  }

  // Fallback: extract from MIME type
  const type = mimeType.split("/")[1];
  if (type) {
    return type.toUpperCase();
  }

  return "Unknown";
}

// Helper function to get file category from MIME type
export function getFileCategory(mimeType) {
  if (!mimeType) return "";

  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document")) return "word";
  if (
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("csv")
  )
    return "excel";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "powerpoint";
  if (mimeType.includes("text") || mimeType.includes("csv")) return "text";
  if (mimeType.includes("image")) return "image";
  if (mimeType.includes("video")) return "video";
  if (mimeType.includes("audio")) return "audio";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z") ||
    mimeType.includes("tar") ||
    mimeType.includes("gzip")
  )
    return "archive";

  return "";
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  DOCUMENTS: {
    BASE: "/api/documents",
    SEARCH: "/api/documents/search",
    UPLOAD: "/api/documents/upload",
    UPLOAD_STRING: "/api/documents/upload-string",
    VERSIONS: "/api/documents/versions",
    RESTORE: "/api/documents/restore",
  },
  FOLDERS: {
    BASE: "/api/folders",
    PERMISSIONS: "/api/folders/permissions",
  },
  TAGS: {
    BASE: "/api/tags",
    SEARCH: "/api/tags/search",
  },
  USERS: {
    BASE: "/api/users",
    SEARCH: "/api/users/search",
  },
  DASHBOARD: {
    STATS: "/api/dashboard/stats",
  },
};

// UI constants
export const UI = {
  MODAL_TYPES: {
    UPLOAD: "upload",
    CREATE_FOLDER: "create_folder",
    ACCESS_CONTROL: "access_control",
    VERSION_HISTORY: "version_history",
    VERSION_UPLOAD: "version_upload",
  },
  NOTIFICATION_TYPES: {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_PREFERENCES: "user_preferences",
  RECENT_FOLDERS: "recent_folders",
  SEARCH_HISTORY: "search_history",
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. You don't have permission for this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UPLOAD_ERROR: "Failed to upload file. Please try again.",
  DELETE_ERROR: "Failed to delete item. Please try again.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: "File uploaded successfully.",
  DELETE_SUCCESS: "Item deleted successfully.",
  UPDATE_SUCCESS: "Item updated successfully.",
  CREATE_SUCCESS: "Item created successfully.",
  LOGIN_SUCCESS: "Login successful.",
  LOGOUT_SUCCESS: "Logout successful.",
  REGISTER_SUCCESS: "Registration successful.",
};
