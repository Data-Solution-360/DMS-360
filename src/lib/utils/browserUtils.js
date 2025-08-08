// Parse user agent to get browser information
export function parseUserAgent(userAgent) {
  if (!userAgent)
    return { browser: "Unknown", version: "Unknown", os: "Unknown" };

  let browser = "Unknown";
  let version = "Unknown";
  let os = "Unknown";

  // Browser detection - check Edge first (modern Edge includes Chrome in UA)
  if (userAgent.includes("Edg/")) {
    browser = "Edge";
    const match = userAgent.match(/Edg\/(\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes("Edge/")) {
    browser = "Edge";
    const match = userAgent.match(/Edge\/(\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox";
    const match = userAgent.match(/Firefox\/(\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "Safari";
    const match = userAgent.match(/Version\/(\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes("Opera")) {
    browser = "Opera";
    const match = userAgent.match(/Opera\/(\d+)/);
    if (match) version = match[1];
  } else if (userAgent.includes("Chrome")) {
    browser = "Chrome";
    const match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }

  // OS detection
  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
  } else if (userAgent.includes("iOS")) {
    os = "iOS";
  }

  return { browser, version, os };
}

// Get real IP address
export function getRealIPAddress(request) {
  // Check various headers for real IP
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-client-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded") ||
    request.headers.get("forwarded-for") ||
    request.headers.get("forwarded") ||
    "127.0.0.1";

  // If x-forwarded-for contains multiple IPs, take the first one
  return ip.split(",")[0].trim();
}

// Browser Session Tracking System
class BrowserSessionTracker {
  constructor() {
    this.sessionId = null;
    this.sessionStartTime = null;
    this.isActive = false;
    this.heartbeatInterval = null;
    this.visibilityChangeHandler = null;
    this.beforeUnloadHandler = null;
    this.pageHideHandler = null;
    this.focusHandler = null;
    this.blurHandler = null;
  }

  // Initialize session tracking
  startSession(sessionId) {
    if (this.isActive) return;

    this.sessionId = sessionId;
    this.sessionStartTime = new Date();
    this.isActive = true;

    console.log("🟢 Browser session started:", sessionId);

    // Set up event listeners
    this.setupEventListeners();

    // Start heartbeat to track active sessions
    this.startHeartbeat();

    // Store session info in sessionStorage
    sessionStorage.setItem("browserSessionId", sessionId);
    sessionStorage.setItem(
      "browserSessionStart",
      this.sessionStartTime.toISOString()
    );
  }

  // End session
  endSession() {
    if (!this.isActive) return;

    const sessionEndTime = new Date();
    const sessionDuration = sessionEndTime - this.sessionStartTime;

    console.log(
      "🔴 Browser session ended:",
      this.sessionId,
      "Duration:",
      sessionDuration
    );

    // Clean up
    this.cleanup();

    // Send session end data to server
    this.sendSessionEndData(sessionEndTime, sessionDuration);
  }

  // Set up browser event listeners
  setupEventListeners() {
    // Handle page visibility changes (tab switching, minimizing)
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        console.log("📱 Page hidden - session paused");
      } else {
        console.log("📱 Page visible - session resumed");
      }
    };
    document.addEventListener("visibilitychange", this.visibilityChangeHandler);

    // Handle beforeunload (browser close, refresh, navigation)
    this.beforeUnloadHandler = (event) => {
      console.log("🚪 Before unload detected");
      this.endSession();
    };
    window.addEventListener("beforeunload", this.beforeUnloadHandler);

    // Handle pagehide (more reliable than beforeunload)
    this.pageHideHandler = (event) => {
      console.log(" Page hide detected");
      this.endSession();
    };
    window.addEventListener("pagehide", this.pageHideHandler);

    // Handle window focus/blur
    this.focusHandler = () => {
      console.log(" Window focused");
    };
    this.blurHandler = () => {
      console.log(" Window blurred");
    };
    window.addEventListener("focus", this.focusHandler);
    window.addEventListener("blur", this.blurHandler);
  }

  // Start heartbeat to track active sessions
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isActive) {
        this.sendHeartbeat();
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Send heartbeat to server
  async sendHeartbeat() {
    try {
      await fetch("/api/auth/session-heartbeat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.log("Heartbeat failed:", error);
    }
  }

  // Send session end data to server
  async sendSessionEndData(endTime, duration) {
    try {
      await fetch("/api/auth/session-end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          endTime: endTime.toISOString(),
          duration: duration,
        }),
      });
    } catch (error) {
      console.log("Session end data send failed:", error);
    }
  }

  // Clean up event listeners and intervals
  cleanup() {
    this.isActive = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.visibilityChangeHandler) {
      document.removeEventListener(
        "visibilitychange",
        this.visibilityChangeHandler
      );
    }

    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    }

    if (this.pageHideHandler) {
      window.removeEventListener("pagehide", this.pageHideHandler);
    }

    if (this.focusHandler) {
      window.removeEventListener("focus", this.focusHandler);
    }

    if (this.blurHandler) {
      window.removeEventListener("blur", this.blurHandler);
    }

    // Clear session storage
    sessionStorage.removeItem("browserSessionId");
    sessionStorage.removeItem("browserSessionStart");
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      isActive: this.isActive,
    };
  }
}

// Global session tracker instance
export const browserSessionTracker = new BrowserSessionTracker();

// Calculate session duration with proper browser session tracking
export function calculateSessionDuration(
  loginAt,
  logoutAt = null,
  sessionId = null
) {
  if (!loginAt) return "Unknown";

  const loginTime = loginAt._seconds
    ? new Date(loginAt._seconds * 1000)
    : new Date(loginAt);

  // If we have a session ID, try to get the actual session end time
  if (sessionId) {
    const sessionEndTime = sessionStorage.getItem(`session_${sessionId}_end`);
    if (sessionEndTime) {
      const endTime = new Date(sessionEndTime);
      const durationMs = endTime - loginTime;
      return formatDuration(durationMs);
    }
  }

  // Fallback to logout time or current time
  const logoutTime = logoutAt
    ? logoutAt._seconds
      ? new Date(logoutAt._seconds * 1000)
      : new Date(logoutAt)
    : new Date();

  const durationMs = logoutTime - loginTime;
  return formatDuration(durationMs);
}

// Format duration in a readable format
function formatDuration(durationMs) {
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  const durationHours = Math.floor(durationMinutes / 60);
  const durationDays = Math.floor(durationHours / 24);

  if (durationDays > 0) {
    return `${durationDays}d ${durationHours % 24}h ${durationMinutes % 60}m`;
  } else if (durationHours > 0) {
    return `${durationHours}h ${durationMinutes % 60}m`;
  } else if (durationMinutes > 0) {
    return `${durationMinutes}m`;
  } else {
    return "Less than 1m";
  }
}

// Initialize session tracking on page load
export function initializeBrowserSession(sessionId) {
  if (typeof window !== "undefined") {
    browserSessionTracker.startSession(sessionId);
  }
}

// Get browser display name for UI
export function getBrowserDisplayName(browserInfo) {
  const browserMap = {
    Chrome: "Chrome",
    Firefox: "Firefox",
    Safari: "Safari",
    Edge: "Edge",
    Opera: "Opera",
  };
  return browserMap[browserInfo.browser] || browserInfo.browser;
}

// Get browser tag color for UI
export function getBrowserTagColor(browserName) {
  const colorMap = {
    Chrome: "blue",
    Firefox: "orange",
    Safari: "green",
    Edge: "purple",
    Opera: "red",
  };
  return colorMap[browserName] || "default";
}
