import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth.js";
import { FolderService } from "../../../../../lib/firestore.js";

// POST - Update folder access control
async function POST(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;
      const { userIds, isRestricted } = await request.json();
      const user = request.user.user;

      // Validate input
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json(
          { success: false, error: "User IDs are required" },
          { status: 400 }
        );
      }

      if (typeof isRestricted !== "boolean") {
        return NextResponse.json(
          { success: false, error: "isRestricted must be a boolean" },
          { status: 400 }
        );
      }

      // Get the current folder
      const folder = await FolderService.getFolderById(id);
      if (!folder) {
        return NextResponse.json(
          { success: false, error: "Folder not found" },
          { status: 404 }
        );
      }

      // Check if user has permission to modify this folder
      const hasPermission = folder.permissions?.some(
        (permission) => permission.userId === user.id
      );

      if (!hasPermission) {
        return NextResponse.json(
          {
            success: false,
            error: "You don't have permission to modify this folder",
          },
          { status: 403 }
        );
      }

      // Update the folder with access control settings
      const updatedFolder = await FolderService.updateFolderAccessControl(id, {
        isRestricted,
        allowedUserIds: userIds,
        updatedBy: user.id,
        updatedAt: new Date(),
      });

      // If making restricted, update all child folders recursively
      if (isRestricted) {
        await FolderService.updateChildFoldersAccessControl(id, {
          isRestricted: true,
          allowedUserIds: userIds,
          updatedBy: user.id,
          updatedAt: new Date(),
        });
      }

      return NextResponse.json({
        success: true,
        data: updatedFolder,
        message: "Folder access control updated successfully",
      });
    } catch (error) {
      console.error("Update folder access control error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// GET - Get folder access control status
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
        data: {
          isRestricted: folder.isRestricted || false,
          allowedUserIds: folder.allowedUserIds || [],
          permissions: folder.permissions || [],
        },
      });
    } catch (error) {
      console.error("Get folder access control error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, POST };
