import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { LoginHistoryService } from "../../../../lib/services/index.js";

// GET - Get login statistics
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const statistics = await LoginHistoryService.getLoginStatistics();

      return NextResponse.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error("Get login statistics error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
