import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { adminDb } from "../../../../lib/firebase-admin.js";
import { DocumentService } from "../../../../lib/services/index.js";

// GET - Get document by ID
async function GET(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;
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

      return NextResponse.json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error("Get document error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update document
async function PUT(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;
      const updateData = await request.json();

      // Get document first to check ownership/access
      const document = await DocumentService.getDocumentById(id);
      if (!document) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // Check if user can modify this document
      const user = request.user.user;
      const canModify = user.role === "admin" || document.createdBy === user.id;

      if (!canModify) {
        return NextResponse.json(
          {
            success: false,
            error: "You can only modify documents you created",
          },
          { status: 403 }
        );
      }

      const updatedDocument = await DocumentService.updateDocument(
        id,
        updateData
      );

      return NextResponse.json({
        success: true,
        data: updatedDocument,
      });
    } catch (error) {
      console.error("Update document error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE - Soft delete document
async function DELETE(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const documentId = params.id;
      const user = request.user.user;

      // Get the document to be deleted
      const document = await DocumentService.getDocumentById(documentId);
      if (!document) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // Check if user has permission to delete
      const canDelete =
        user.role === "admin" ||
        document.createdBy === user.id ||
        user.hasDocumentAccess;

      if (!canDelete) {
        return NextResponse.json(
          { success: false, error: "Permission denied" },
          { status: 403 }
        );
      }

      // If already in trash, return success
      if (document.inTrash) {
        return NextResponse.json({
          success: true,
          message: "Document is already in trash",
        });
      }

      // Create a trashbox entry with a snapshot for listing
      await adminDb.collection("trashbox").add({
        type: "document",
        docId: documentId, // keep exact key name as requested
        originalCollection: "documents",
        data: {
          originalName: document.originalName || "",
          name: document.name || "",
          size: document.size || 0,
          mimeType: document.mimeType || "",
          folderId: document.folderId || null,
          folderName: document.folderName || "",
          createdAt: document.createdAt || null,
          createdBy: document.createdBy || null,
          filePath: document.filePath || null,
          thumbnailPath: document.thumbnailPath || null,
        },
        deletedAt: FieldValue.serverTimestamp(),
        deletedBy: user.id || "system",
      });

      // Flag document as in trash
      await DocumentService.updateDocument(documentId, {
        inTrash: true,
        deletedAt: FieldValue.serverTimestamp(),
        deletedBy: user.id || "system",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: "Document moved to trash",
      });
    } catch (error) {
      console.error("Error soft-deleting document:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete document" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, PUT, DELETE };
