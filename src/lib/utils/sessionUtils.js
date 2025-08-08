export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get current session ID from sessionStorage
export function getCurrentSessionId() {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("browserSessionId");
  }
  return null;
}

// Store session end time
export function storeSessionEndTime(sessionId, endTime) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`session_${sessionId}_end`, endTime.toISOString());
  }
}

// Get session end time
export function getSessionEndTime(sessionId) {
  if (typeof window !== "undefined") {
    const endTime = sessionStorage.getItem(`session_${sessionId}_end`);
    return endTime ? new Date(endTime) : null;
  }
  return null;
}
