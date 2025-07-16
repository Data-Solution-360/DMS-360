import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { firebaseUploadService } from "../../../../lib/firebaseUpload.js";
import { DocumentService } from "../../../../lib/firestore.js";

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

      const document = await DocumentService.updateDocument(id, updateData);

      return NextResponse.json({
        success: true,
        data: document,
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
  return requireAuth(async (request) => {
    try {
      const { id } = params;

      // Get document first to get storage path
      const document = await DocumentService.getDocumentById(id);
      if (!document) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
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
