import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth.js";
import { DocumentService } from "../../../../../lib/firestore.js";

// GET - Get document versions
async function GET(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;

      // Get the document
      const document = await DocumentService.getDocumentById(id);
      if (!document) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // For now, return the current document as the only version
      // In a full implementation, you would query for all versions
      const versions = [
        {
          id: document.id,
          version: document.version || 1,
          name: document.name,
          createdAt: document.createdAt,
          createdBy: document.createdBy,
          createdByName: document.createdByName,
          isLatestVersion: document.isLatestVersion || true,
        },
      ];

      return NextResponse.json({
        success: true,
        data: versions,
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
