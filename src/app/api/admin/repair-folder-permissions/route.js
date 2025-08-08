import { NextResponse } from "next/server";
import { FolderService } from "../../../../lib/services/index.js";
import { requireAuth } from "../../../../lib/auth.js";

export async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;

      // Only admins can repair permissions
      if (user.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Admin access required" },
          { status: 403 }
        );
      }

      const allFolders = await FolderService.getAllFolders();
      let repairedCount = 0;

      for (const folder of allFolders) {
        let needsUpdate = false;
        const updates = {};

        // Ensure creator has permissions
        if (
          folder.createdBy &&
          (!folder.permissions ||
            !folder.permissions.some((p) => p.userId === folder.createdBy))
        ) {
          updates.permissions = [
            ...(folder.permissions || []),
            {
              userId: folder.createdBy,
              permission: "admin",
              grantedAt: new Date(),
              grantedBy: folder.createdBy,
            },
          ];
          needsUpdate = true;
        }

        // Add default access control
        if (folder.isRestricted === undefined) {
          updates.isRestricted = false;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await FolderService.updateFolder(folder.id, updates);
          repairedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Repaired permissions for ${repairedCount} folders`,
        data: { repairedCount },
      });
    } catch (error) {
      console.error("Repair permissions error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  })(request);
}
