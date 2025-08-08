import { NextResponse } from "next/server";
import { DocumentService } from "../../../../../lib/services/index.js";
import { requireAuth } from "../../../../../lib/auth.js";

// GET - Get document versions
async function GET(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;

      // Get the main document
      const document = await DocumentService.getDocumentById(id);
      if (!document) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // Check if user has access to this document
      const user = request.user.user;
      const canAccess =
        user.role === "admin" ||
        user.hasDocumentAccess ||
        document.createdBy === user.id;

      if (!canAccess) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }

      // Get all versions of this document
      const versions = await DocumentService.getDocumentVersions(id);

      // Sort versions by version number (latest first)
      const sortedVersions = versions.sort((a, b) => {
        const versionA = parseInt(a.version) || 1;
        const versionB = parseInt(b.version) || 1;
        return versionB - versionA;
      });

      // Populate version data with related entities
      const populatedVersions = await DocumentService.populateDocumentData(
        sortedVersions
      );

      // Format version data for frontend
      const formattedVersions = populatedVersions.map((version) => ({
        id: version.id,
        version: version.version || 1,
        name: version.name,
        originalName: version.originalName,
        mimeType: version.mimeType,
        size: version.size,
        createdAt: version.createdAt,
        createdBy: version.createdBy,
        description: version.description || version.content,
        tags: version.tags || [],
        firebaseStorageUrl: version.firebaseStorageUrl,
        firebaseStoragePath: version.firebaseStoragePath,
        isLatestVersion: version.isLatestVersion || false,
        versionHistory: version.versionHistory,
        uploadedBy: version.uploadedBy,
      }));

      return NextResponse.json({
        success: true,
        data: formattedVersions,
        pagination: {
          total: formattedVersions.length,
          page: 1,
          limit: formattedVersions.length,
          totalPages: 1,
        },
      });
    } catch (error) {
      console.error("Get document versions error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
