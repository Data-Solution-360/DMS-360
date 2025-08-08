import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { LoginHistoryService } from "../../../../lib/services/index.js";

// POST - Update session heartbeat
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const { sessionId, timestamp } = await request.json();

      if (!sessionId) {
        return NextResponse.json(
          { success: false, error: "Session ID is required" },
          { status: 400 }
        );
      }

      // Update session heartbeat in login history
      await LoginHistoryService.updateSessionHeartbeat(sessionId, timestamp);

      return NextResponse.json({
        success: true,
        message: "Session heartbeat updated",
      });
    } catch (error) {
      console.error("Session heartbeat error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
