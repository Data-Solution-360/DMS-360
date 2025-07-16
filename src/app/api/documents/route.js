import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth.js";
import { DocumentService } from "../../../lib/firestore.js";

// GET - Get all documents
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const folderId = searchParams.get("folderId");
      const search = searchParams.get("search");

      // Fix: Access user data from correct path
      const user = request.user.user;
      const userId = user.id;

      console.log("[Documents API] Request params:", {
        folderId,
        search,
        userId,
      });

      let documents;

      if (search) {
        documents = await DocumentService.searchDocuments(search, userId);
      } else if (folderId && folderId !== "undefined" && folderId !== "null") {
        // Fix: Check for undefined/null string values
        documents = await DocumentService.getDocumentsByFolder(
          folderId,
          userId
        );
      } else {
        documents = await DocumentService.getAllDocuments(userId);
      }

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

      console.log("[Documents API] Creating document with user:", {
        userId: userId,
        email: user.email,
        name: user.name,
        documentData: documentData,
      });

      // Add user info to document
      const newDocument = {
        ...documentData,
        createdBy: userId,
        createdByEmail: user.email,
        createdByName: user.name,
      };

      const document = await DocumentService.createDocument(newDocument);

      console.log("[Documents API] Document created successfully:", document);

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
