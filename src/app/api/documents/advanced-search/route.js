import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { DocumentService } from "../../../../lib/services/index.js";

// GET - Advanced search for documents
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("query") || "";
      const tags = searchParams.get("tags")
        ? searchParams.get("tags").split(",")
        : [];
      const fileType = searchParams.get("fileType") || "";
      const showOldVersions = searchParams.get("showOldVersions") === "true";
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const mimeType = searchParams.get("mimeType") || "";

      // Get user info
      const user = request.user.user;
      const userId = user.id;
      const isAdmin = user.role === "admin" || user.hasDocumentAccess;

      // Perform advanced search
      let documents = await DocumentService.advancedSearch({
        query,
        tags,
        fileType,
        userId: isAdmin ? null : userId,
        isAdmin,
        includePrivate: isAdmin,
      });

      // Apply additional filters
      if (mimeType) {
        documents = documents.filter(
          (doc) =>
            doc.mimeType &&
            doc.mimeType.toLowerCase().includes(mimeType.toLowerCase())
        );
      }

      // Apply date range filter (applied to createdAt field)
      if (startDate || endDate) {
        documents = documents.filter((doc) => {
          const docDate = doc.createdAt?.toDate?.() || new Date(doc.createdAt);

          if (startDate) {
            const start = new Date(startDate);
            if (docDate < start) return false;
          }

          if (endDate) {
            const end = new Date(endDate);
            // Set end date to end of day (23:59:59)
            end.setHours(23, 59, 59, 999);
            if (docDate > end) return false;
          }

          return true;
        });
      }

      // If showOldVersions is true, get all versions instead of just latest
      if (showOldVersions) {
        const allDocuments = await DocumentService.getAllDocuments(userId);
        const documentIds = documents.map(
          (doc) => doc.originalDocumentId || doc.id
        );

        // Get all versions of the documents that match the search criteria
        const allVersions = [];
        for (const docId of documentIds) {
          const versions = await DocumentService.getAllDocumentVersions(docId);
          allVersions.push(...versions);
        }

        // Apply the same filters to all versions
        documents = allVersions.filter((doc) => {
          let matches = true;

          if (query) {
            const queryLower = query.toLowerCase();
            const textMatch =
              doc.originalName?.toLowerCase().includes(queryLower) ||
              doc.name?.toLowerCase().includes(queryLower) ||
              doc.title?.toLowerCase().includes(queryLower) ||
              doc.description?.toLowerCase().includes(queryLower) ||
              doc.content?.toLowerCase().includes(queryLower);
            matches = matches && textMatch;
          }

          if (mimeType) {
            matches =
              matches &&
              doc.mimeType &&
              doc.mimeType.toLowerCase().includes(mimeType.toLowerCase());
          }

          if (tags.length > 0) {
            const tagMatch = doc.tags?.some((tag) =>
              tags.some((searchTag) =>
                (typeof tag === "string"
                  ? tag.toLowerCase()
                  : (tag.displayName || tag.name || "").toLowerCase()
                ).includes(searchTag.toLowerCase())
              )
            );
            matches = matches && tagMatch;
          }

          // Date range filter
          if (startDate || endDate) {
            const docDate =
              doc.createdAt?.toDate?.() || new Date(doc.createdAt);

            if (startDate) {
              const start = new Date(startDate);
              if (docDate < start) return false;
            }

            if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              if (docDate > end) return false;
            }
          }

          return matches;
        });
      }

      // Populate document data (tags, user info, etc.)
      documents = await DocumentService.populateDocumentData(documents);

      return NextResponse.json({
        success: true,
        data: documents,
        total: documents.length,
      });
    } catch (error) {
      console.error("Advanced search error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
