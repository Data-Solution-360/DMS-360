import { NextResponse } from "next/server";
import { requireDocumentAccess } from "../../../../lib/auth.js";
import { DocumentService } from "../../../../lib/firestore.js";

// GET - Advanced document search
export async function GET(request) {
  return requireDocumentAccess(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q") || "";
      const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
      const fileType = searchParams.get("fileType") || "";
      const scope = searchParams.get("scope") || "accessible"; // 'accessible', 'all' (admin only)

      const user = request.user.user;
      const isAdmin = user.role === "admin";

      if (!query && tags.length === 0 && !fileType) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 0, totalPages: 0 },
        });
      }

      // Perform advanced search
      const searchResults = await DocumentService.advancedSearch({
        query,
        tags,
        fileType,
        userId: isAdmin && scope === "all" ? null : user.id,
        isAdmin,
        includePrivate: isAdmin || scope === "accessible",
      });

      return NextResponse.json({
        success: true,
        data: searchResults,
        pagination: {
          total: searchResults.length,
          page: 1,
          limit: searchResults.length,
          totalPages: 1,
        },
      });
    } catch (error) {
      console.error("Advanced search error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Search failed" },
        { status: 500 }
      );
    }
  })(request);
}
