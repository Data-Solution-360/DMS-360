import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth.js";
import { FolderService } from "../../../lib/firestore.js";

// GET - Debug folders route
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const folders = await FolderService.getAllFolders();

      // Return debug information
      const debugInfo = {
        totalFolders: folders.length,
        folders: folders.map((folder) => ({
          id: folder.id,
          name: folder.name,
          parentId: folder.parentId,
          level: folder.level || 0,
          permissions: folder.permissions?.length || 0,
          createdAt: folder.createdAt,
        })),
      };

      return NextResponse.json({
        success: true,
        data: debugInfo,
      });
    } catch (error) {
      console.error("Debug folders error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
