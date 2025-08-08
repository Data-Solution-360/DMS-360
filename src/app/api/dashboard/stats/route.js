import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import {
  DocumentService,
  FolderService,
  UserService,
} from "../../../../lib/services/index.js";

export async function GET(request) {
  return requireAuth(async (request) => {
    try {
      // Get basic counts in parallel
      const [documents, folders, users, detailedStorage] = await Promise.all([
        DocumentService.getAllDocuments(),
        FolderService.getAllFolders(),
        UserService.getAllUsers(),
        DocumentService.getStorageStatsDetailed(),
      ]);

      // Filter to latest versions for user-facing document count
      const latestDocuments = DocumentService.filterLatestVersions(documents);

      // Calculate additional metrics
      const activeUsers = users.filter((user) => user.hasDocumentAccess).length;
      const totalVersions = documents.length;
      const averageVersionsPerDocument =
        latestDocuments.length > 0 ? totalVersions / latestDocuments.length : 0;

      const stats = {
        // Basic counts (latest versions only for UI)
        totalDocuments: latestDocuments.length,
        totalFolders: folders.length,
        totalUsers: users.length,
        activeUsers,

        // Storage information (all versions)
        storageUsed: detailedStorage.totalStorage,
        totalVersions,
        averageVersionsPerDocument:
          Math.round(averageVersionsPerDocument * 100) / 100,
        averageFileSize: detailedStorage.averageFileSize,

        // Detailed breakdown
        storageByType: detailedStorage.storageByType,
        userStorage: detailedStorage.userStats,
        orphanedFiles: detailedStorage.orphanedFiles,

        // Additional metrics
        storageUtilization: {
          documentsWithVersions: latestDocuments.filter((doc) =>
            documents.some(
              (d) =>
                d.parentDocumentId === doc.id || d.originalDocumentId === doc.id
            )
          ).length,
          averageStoragePerUser:
            users.length > 0 ? detailedStorage.totalStorage / users.length : 0,
        },

        lastUpdated: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch dashboard statistics" },
        { status: 500 }
      );
    }
  })(request);
}
