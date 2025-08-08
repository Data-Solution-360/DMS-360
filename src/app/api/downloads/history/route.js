import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { DownloadService } from "../../../../lib/services/index.js";

// GET - Get download history
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit")) || 50;

      const history = await DownloadService.getAllDownloadHistory(limit);

      return NextResponse.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error("Get download history error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
