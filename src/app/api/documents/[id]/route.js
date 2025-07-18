import { NextResponse } from "next/server";
import { requireDocumentAccess } from "../../../../lib/auth.js";
import { firebaseUploadService } from "../../../../lib/firebaseUpload.js";
import { DocumentService } from "../../../../lib/firestore.js";

// GET - Get document by ID
async function GET(request, { params }) {
  return requireDocumentAccess(async (request) => {
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
  return requireDocumentAccess(async (request) => {
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

// DELETE - Delete document
async function DELETE(request, { params }) {
  return requireDocumentAccess(async (request) => {
    try {
      const { id } = params;

      // Get document first to get storage path and check ownership
      const document = await DocumentService.getDocumentById(id);
      if (!document) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // Check if user can delete this document
      const user = request.user.user;
      const canDelete = user.role === "admin" || document.createdBy === user.id;

      if (!canDelete) {
        return NextResponse.json(
          {
            success: false,
            error: "You can only delete documents you created",
          },
          { status: 403 }
        );
      }

      // Delete from Firebase Storage if path exists
      if (document.firebaseStoragePath) {
        try {
          await firebaseUploadService.deleteFile(document.firebaseStoragePath);
        } catch (storageError) {
          console.warn("Failed to delete from storage:", storageError);
        }
      }

      // Delete from Firestore
      await DocumentService.deleteDocument(id);

      return NextResponse.json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Delete document error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE, GET, PUT };
