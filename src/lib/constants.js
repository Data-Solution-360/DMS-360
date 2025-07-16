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
    UPLOAD: "/api/documents/upload",
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
