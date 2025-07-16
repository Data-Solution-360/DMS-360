import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth.js";
import { FolderService } from "../../../../../lib/firestore.js";

// GET - Get folder permissions
async function GET(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;
      const folder = await FolderService.getFolderById(id);

      if (!folder) {
        return NextResponse.json(
          { success: false, error: "Folder not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: folder.permissions || [],
      });
    } catch (error) {
      console.error("Get folder permissions error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update folder permissions
async function PUT(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;
      const permissions = await request.json();

      const updatedFolder = await FolderService.updateFolderPermissions(
        id,
        permissions
      );

      return NextResponse.json({
        success: true,
        data: updatedFolder,
      });
    } catch (error) {
      console.error("Update folder permissions error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, PUT };
