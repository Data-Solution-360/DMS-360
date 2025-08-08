import { NextResponse } from "next/server";
import { FolderService } from "../../../../lib/services/index.js";
import { requireAuth } from "../../../../lib/auth.js";

// GET - Get simple folder list
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;
      const folders = await FolderService.getFoldersByUserAccess(user.id);

      // Return simplified folder data
      const simpleFolders = folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        level: folder.level || 0,
      }));

      return NextResponse.json({
        success: true,
        data: simpleFolders,
      });
    } catch (error) {
      console.error("Get simple folders error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
