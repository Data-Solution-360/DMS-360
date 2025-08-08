import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { DownloadService } from "../../../../lib/services/index.js";

// POST - Track download activity
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;
      const downloadData = await request.json();

      const downloadRecord = await DownloadService.trackDownload({
        ...downloadData,
        userId: user.id,
      });

      return NextResponse.json({
        success: true,
        data: downloadRecord,
      });
    } catch (error) {
      console.error("Track download error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
