/**
 * Comprehensive date utility to handle all date formats used in the app
 * Handles: Firestore timestamps, ISO strings, Date objects, epoch timestamps
 */

/**
 * Convert any date format to a JavaScript Date object
 * @param {*} dateValue - Date in any format
 * @returns {Date|null} JavaScript Date object or null if invalid
 */
export function toDate(dateValue) {
  if (!dateValue) return null;

  try {
    // Handle Firestore Timestamp objects (has toDate method)
    if (dateValue && typeof dateValue.toDate === "function") {
      return dateValue.toDate();
    }

    // Handle Firestore timestamp objects with seconds/nanoseconds
    if (dateValue && typeof dateValue === "object" && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000);
    }

    // Handle ISO string dates
    if (typeof dateValue === "string") {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    }

    // Handle regular Date objects
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    // Handle epoch timestamps (numbers)
    if (typeof dateValue === "number") {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  } catch (error) {
    console.error("Error converting date:", error, dateValue);
    return null;
  }
}

/**
 * Format date for display (short format)
 * @param {*} dateValue - Date in any format
 * @returns {string} Formatted date string
 */
export function formatDate(dateValue) {
  const date = toDate(dateValue);
  if (!date) return "Unknown";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date with time for display (detailed format)
 * @param {*} dateValue - Date in any format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(dateValue) {
  const date = toDate(dateValue);
  if (!date) return "Unknown";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date for version display (includes time)
 * @param {*} dateValue - Date in any format
 * @returns {string} Formatted date string for versions
 */
export function formatVersionDate(dateValue) {
  return formatDateTime(dateValue);
}

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {*} dateValue - Date in any format
 * @returns {string} Relative time string
 */
export function getRelativeTime(dateValue) {
  const date = toDate(dateValue);
  if (!date) return "Unknown";

  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  if (diffInWeeks < 4)
    return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`;
  if (diffInMonths < 12)
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
}

/**
 * Check if a date is today
 * @param {*} dateValue - Date in any format
 * @returns {boolean} True if the date is today
 */
export function isToday(dateValue) {
  const date = toDate(dateValue);
  if (!date) return false;

  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if a date is within the last N days
 * @param {*} dateValue - Date in any format
 * @param {number} days - Number of days to check
 * @returns {boolean} True if the date is within the last N days
 */
export function isWithinDays(dateValue, days) {
  const date = toDate(dateValue);
  if (!date) return false;

  const now = new Date();
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= daysAgo;
}

/**
 * Sort array by date field (newest first by default)
 * @param {Array} array - Array to sort
 * @param {string} dateField - Field name containing the date
 * @param {boolean} ascending - Sort ascending (oldest first) if true
 * @returns {Array} Sorted array
 */
export function sortByDate(array, dateField, ascending = false) {
  return [...array].sort((a, b) => {
    const dateA = toDate(a[dateField]);
    const dateB = toDate(b[dateField]);

    if (!dateA && !dateB) return 0;
    if (!dateA) return ascending ? -1 : 1;
    if (!dateB) return ascending ? 1 : -1;

    return ascending ? dateA - dateB : dateB - dateA;
  });
}
