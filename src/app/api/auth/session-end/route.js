import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { LoginHistoryService } from "../../../../lib/services/index.js";

// POST - Record session end
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const { sessionId, endTime, duration } = await request.json();

      if (!sessionId) {
        return NextResponse.json(
          { success: false, error: "Session ID is required" },
          { status: 400 }
        );
      }

      // Update session end time in login history
      await LoginHistoryService.updateSessionEnd(sessionId, endTime, duration);

      return NextResponse.json({
        success: true,
        message: "Session end recorded",
      });
    } catch (error) {
      console.error("Session end error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
