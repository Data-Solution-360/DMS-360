import { NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth.js";
import { connectDB } from "../../../../lib/database";
import { Document } from "../../../../models/Document";
import { Folder } from "../../../../models/Folder";
import { User } from "../../../../models/User";

export async function GET(request) {
  try {
    await connectDB();

    // Check authentication
    const token = request.cookies.get("token")?.value;
    let user = await verifyToken(token);

    if (!user) {
      // For development mode, create a demo user if no auth
      if (process.env.NODE_ENV === "development") {
        console.log("No auth in development mode, using demo user");
        user = {
          userId: "demo-user-id",
          email: "demo@dms360.com",
          role: "admin",
        };
      } else {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    // Build queries based on user role
    let documentQuery = { isLatestVersion: true, isActive: true };
    let folderQuery = {};

    // If user is not admin, filter by permissions
    if (user.role !== "admin") {
      // For documents, filter by user's access
      // This assumes documents inherit folder permissions
      const accessibleFolderIds = await Folder.find({
        "permissions.userId": user.userId || user._id,
      }).distinct("_id");

      documentQuery.folderId = { $in: accessibleFolderIds };

      // For folders, filter by user's permissions
      folderQuery = {
        "permissions.userId": user.userId || user._id,
      };
    }

    // Get statistics
    const [totalDocuments, totalFolders, totalUsers, storageUsed] =
      await Promise.all([
        Document.countDocuments(documentQuery),
        Folder.countDocuments(folderQuery),
        User.countDocuments({}),
        Document.aggregate([
          { $match: documentQuery },
          {
            $group: {
              _id: null,
              totalSize: { $sum: "$size" },
            },
          },
        ]),
      ]);

    // Extract storage size from aggregation result
    const storageSize = storageUsed.length > 0 ? storageUsed[0].totalSize : 0;

    const stats = {
      totalDocuments,
      totalFolders,
      totalUsers,
      storageUsed: storageSize,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
