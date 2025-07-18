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
      const user = request.user.user;

      // Handle undefined/null string values properly
      let parentId = null;
      if (
        parentIdParam &&
        parentIdParam !== "undefined" &&
        parentIdParam !== "null"
      ) {
        parentId = parentIdParam;
      }

      let folders;

      if (tree) {
        // Get all accessible folders and build tree
        const allAccessibleFolders = await FolderService.getFoldersByUserAccess(
          user.id
        );
        folders = buildTreeFromFolders(allAccessibleFolders, parentId);
      } else if (parentId !== null) {
        // Get accessible folders by parent
        const allAccessibleFolders = await FolderService.getFoldersByUserAccess(
          user.id
        );
        folders = allAccessibleFolders.filter(
          (folder) => folder.parentId === parentId
        );
      } else {
        // Get all accessible folders
        folders = await FolderService.getFoldersByUserAccess(user.id);
      }

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

// Helper function to build tree from accessible folders
function buildTreeFromFolders(folders, parentId = null) {
  return folders
    .filter((folder) => folder.parentId === parentId)
    .map((folder) => ({
      ...folder,
      children: buildTreeFromFolders(folders, folder.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// POST - Create new folder
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const folderData = await request.json();

      const user = request.user.user;
      const userId = user.id;

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
