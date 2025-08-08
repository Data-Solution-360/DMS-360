import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { getFileCategory } from "../../../../lib/constants.js";
import { DocumentService } from "../../../../lib/services/index.js";

// GET - Get all documents from documents collection
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const showOldVersions = searchParams.get("showOldVersions") === "true";
      const query = searchParams.get("query") || "";
      const tags = searchParams.get("tags")
        ? searchParams.get("tags").split(",")
        : [];
      const fileType = searchParams.get("fileType") || "";
      const mimeType = searchParams.get("mimeType") || "";
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      // Get user info
      const user = request.user.user;
      const userId = user.id;
      const isAdmin = user.role === "admin" || user.hasDocumentAccess;

      console.log("🔍 Debug - User info:", {
        userId,
        isAdmin,
        role: user.role,
        hasDocumentAccess: user.hasDocumentAccess,
      });

      // Get documents based on showOldVersions parameter
      let documents;
      if (showOldVersions) {
        // Get ALL documents including old versions
        documents = await DocumentService.getAllDocumentsWithVersions(userId);
        console.log(
          "🔍 Debug - All documents with versions:",
          documents.length
        );
      } else {
        // Get only latest versions
        documents = await DocumentService.getAllDocuments(userId);
        console.log("🔍 Debug - Latest versions only:", documents.length);
      }

      // Apply filters
      if (
        query ||
        tags.length > 0 ||
        fileType ||
        mimeType ||
        startDate ||
        endDate
      ) {
        const beforeFilter = documents.length;

        documents = documents.filter((doc) => {
          let matches = true;

          // Text search
          if (query) {
            const queryLower = query.toLowerCase();
            const textMatch =
              doc.originalName?.toLowerCase().includes(queryLower) ||
              doc.name?.toLowerCase().includes(queryLower) ||
              doc.title?.toLowerCase().includes(queryLower) ||
              doc.description?.toLowerCase().includes(queryLower) ||
              doc.content?.toLowerCase().includes(queryLower) ||
              doc.tags?.some((tag) =>
                (typeof tag === "string"
                  ? tag.toLowerCase()
                  : (tag.displayName || tag.name || "").toLowerCase()
                ).includes(queryLower)
              );
            matches = matches && textMatch;
          }

          // Tag filter
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

          // File type filter
          if (fileType) {
            const category = getFileCategory(doc.mimeType);
            matches = matches && category === fileType;
          }

          // MIME type filter
          if (mimeType) {
            matches =
              matches &&
              doc.mimeType &&
              doc.mimeType.toLowerCase().includes(mimeType.toLowerCase());
          }

          // Date range filter (applied to createdAt field)
          if (startDate || endDate) {
            const docDate =
              doc.createdAt?.toDate?.() || new Date(doc.createdAt);

            if (startDate) {
              const start = new Date(startDate);
              matches = matches && docDate >= start;
            }

            if (endDate) {
              const end = new Date(endDate);
              // Set end date to end of day (23:59:59)
              end.setHours(23, 59, 59, 999);
              matches = matches && docDate <= end;
            }
          }

          return matches;
        });

        console.log("🔍 Debug - After filters:", {
          before: beforeFilter,
          after: documents.length,
          filtered: beforeFilter - documents.length,
          filters: { query, tags, fileType, mimeType, startDate, endDate },
        });
      }

      // Apply user permissions
      if (!isAdmin) {
        const beforePermissionFilter = documents.length;
        documents = documents.filter(
          (doc) =>
            !doc.isPrivate && !doc.isRestricted && doc.visibility !== "private"
        );
        console.log("🔍 Debug - After permission filter:", {
          before: beforePermissionFilter,
          after: documents.length,
          filtered: beforePermissionFilter - documents.length,
        });
      }

      // Populate document data (tags, user info, etc.)
      const beforePopulate = documents.length;
      documents = await DocumentService.populateDocumentData(documents);
      console.log("🔍 Debug - After populate:", {
        before: beforePopulate,
        after: documents.length,
      });

      return NextResponse.json({
        success: true,
        data: documents,
        total: documents.length,
        debug: {
          showOldVersions,
          isAdmin,
          userId,
          originalCount: documents.length,
          filters: { query, tags, fileType, mimeType, startDate, endDate },
        },
      });
    } catch (error) {
      console.error("Get all documents error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
