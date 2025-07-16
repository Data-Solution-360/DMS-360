import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import {
  DocumentService,
  FolderService,
  TagService,
  UserService,
} from "../../../../lib/firestore.js";

// GET - Get dashboard statistics
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      // Get counts from all services
      const users = await UserService.getAllUsers();
      const documents = await DocumentService.getAllDocuments();
      const folders = await FolderService.getAllFolders();
      const tags = await TagService.getAllTags();

      // Calculate additional stats
      const totalFileSize = documents.reduce(
        (sum, doc) => sum + (doc.size || 0),
        0
      );
      const activeDocuments = documents.filter(
        (doc) => doc.isActive !== false
      ).length;
      const activeUsers = users.filter(
        (user) => user.hasDocumentAccess !== false
      ).length;

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentDocuments = documents.filter((doc) => {
        const createdAt = doc.createdAt?.toDate
          ? doc.createdAt.toDate()
          : new Date(doc.createdAt);
        return createdAt >= sevenDaysAgo;
      });

      const stats = {
        totalUsers: users.length,
        activeUsers: activeUsers,
        totalDocuments: documents.length,
        activeDocuments: activeDocuments,
        totalFolders: folders.length,
        totalTags: tags.length,
        totalFileSize: totalFileSize,
        recentDocuments: recentDocuments.length,
        averageFileSize:
          documents.length > 0
            ? Math.round(totalFileSize / documents.length)
            : 0,
      };

      return NextResponse.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get stats error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
