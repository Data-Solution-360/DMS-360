import { NextResponse } from "next/server";
import { DocumentService } from "../../../lib/services/index.js";
import { requireAuth } from "../../../lib/auth.js";

// GET - Get all documents
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const folderId = searchParams.get("folderId");
      const search = searchParams.get("search");
      const originalDocumentId = searchParams.get("originalDocumentId");

      // Fix: Access user data from correct path
      const user = request.user.user;
      const userId = user.id;

      let documents;

      // Users with document access can see all documents
      // Regular users can only see their own documents
      const showAllDocuments = user.hasDocumentAccess || user.role === "admin";
      const filterByUser = showAllDocuments ? null : userId;

      if (search) {
        documents = await DocumentService.searchDocuments(search, filterByUser);
      } else if (folderId && folderId !== "undefined" && folderId !== "null") {
        // Fix: Check for undefined/null string values
        documents = await DocumentService.getDocumentsByFolder(
          folderId,
          filterByUser
        );
      } else if (
        originalDocumentId &&
        originalDocumentId !== "undefined" &&
        originalDocumentId !== "null"
      ) {
        // Fetch ALL versions for this originalDocumentId
        // This should return all documents where:
        // 1. originalDocumentId matches the param, OR
        // 2. id matches the param (for the very first/original version)
        documents = await DocumentService.getAllDocumentVersions(
          originalDocumentId
        );
      } else {
        documents = await DocumentService.getAllDocuments(filterByUser);
      }

      // Get documents and populate related data
      documents = await DocumentService.populateDocumentData(documents);

      // Calculate pagination info for compatibility
      const pagination = {
        total: documents.length,
        page: 1,
        limit: documents.length,
        totalPages: 1,
      };

      return NextResponse.json({
        success: true,
        data: documents,
        pagination: pagination,
      });
    } catch (error) {
      console.error("Get documents error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Create new document
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const documentData = await request.json();

      // Fix: Access user data from correct path
      const user = request.user.user;
      const userId = user.id;

      // Add user info to document
      const newDocument = {
        ...documentData,
        createdBy: userId,
        createdByEmail: user.email,
        createdByName: user.name,
      };

      const document = await DocumentService.createDocument(newDocument);

      return NextResponse.json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error("Create document error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        user: request.user,
      });

      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, POST };
