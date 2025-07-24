import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { CloudStorageService } from "../../../../lib/storage.js";

export async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;

      // Only admins can run cleanup
      if (user.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Admin access required" },
          { status: 403 }
        );
      }

      const { olderThanDays = 7 } = await request.json();

      const cleanupResults = await CloudStorageService.cleanupOrphanedFiles(
        olderThanDays
      );

      return NextResponse.json({
        success: true,
        data: cleanupResults,
      });
    } catch (error) {
      console.error("Storage cleanup error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Cleanup failed" },
        { status: 500 }
      );
    }
  })(request);
}

export async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;

      if (user.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Admin access required" },
          { status: 403 }
        );
      }

      const orphanedFiles = await CloudStorageService.listOrphanedFiles();

      return NextResponse.json({
        success: true,
        data: orphanedFiles,
      });
    } catch (error) {
      console.error("List orphaned files error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to list orphaned files",
        },
        { status: 500 }
      );
    }
  })(request);
}
