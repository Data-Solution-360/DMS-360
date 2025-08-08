import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { LoginHistoryService } from "../../../../lib/services/index.js";

// POST - Create test login history (for testing purposes)
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const { userId, userEmail } = await request.json();

      if (!userId || !userEmail) {
        return NextResponse.json(
          { success: false, error: "userId and userEmail are required" },
          { status: 400 }
        );
      }

      const loginHistoryData = {
        userId: userId,
        userEmail: userEmail,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "127.0.0.1",
        userAgent: request.headers.get("user-agent") || "Test Agent",
        sessionId: `test_session_${Date.now()}`,
        success: true,
      };

      const result = await LoginHistoryService.createLoginHistory(
        loginHistoryData
      );

      return NextResponse.json({
        success: true,
        data: result,
        message: "Test login history created successfully",
      });
    } catch (error) {
      console.error("Create test login history error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
