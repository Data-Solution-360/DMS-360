import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth.js";
import { FolderService } from "../../../lib/firestore.js";

// GET - Get all folders
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const parentIdParam = searchParams.get("parentId");
      const tree = searchParams.get("tree") === "true";

      // Handle undefined/null string values properly
      let parentId = null;
      if (
        parentIdParam &&
        parentIdParam !== "undefined" &&
        parentIdParam !== "null"
      ) {
        parentId = parentIdParam;
      }

      console.log("[Folders API] Request params:", {
        parentIdParam,
        parentId,
        tree,
      });

      let folders;

      if (tree) {
        folders = await FolderService.getFolderTree(parentId);
      } else if (parentId !== null) {
        folders = await FolderService.getFoldersByParent(parentId);
      } else {
        folders = await FolderService.getAllFolders();
      }

      console.log("[Folders API] Returning folders:", folders.length);

      return NextResponse.json({
        success: true,
        data: folders,
      });
    } catch (error) {
      console.error("Get folders error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Create new folder
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const folderData = await request.json();

      const user = request.user.user;
      const userId = user.id;

      console.log("[Folders API] Creating folder with user:", {
        userId: userId,
        folderData: folderData,
      });

      // Simplified folder data structure
      const newFolder = {
        ...folderData,
        createdBy: userId, // Only store user ID
        permissions: [
          {
            userId: userId,
            grantedAt: new Date(), // Only store userId and grantedAt
          },
        ],
      };

      const folder = await FolderService.createFolder(newFolder);

      console.log("[Folders API] Folder created successfully:", folder);

      return NextResponse.json({
        success: true,
        data: folder,
      });
    } catch (error) {
      console.error("Create folder error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, POST };
