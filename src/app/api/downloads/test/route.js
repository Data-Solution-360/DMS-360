import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { DownloadService } from "../../../../lib/services/index.js";

// GET - Test download tracking
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;
      
      // Create a test download record
      const testDownload = await DownloadService.trackDownload({
        userId: user.id,
        documentId: "test-doc-123",
        documentName: "Test Document.pdf",
        documentSize: 1024,
        mimeType: "application/pdf",
        ipAddress: "127.0.0.1",
        userAgent: "Test User Agent",
        browserInfo: {
          browser: "Chrome",
          version: "100.0",
          os: "Windows"
        },
        success: true,
      });

      return NextResponse.json({
        success: true,
        message: "Test download tracked successfully",
        data: testDownload,
      });
    } catch (error) {
      console.error("Test download tracking error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
