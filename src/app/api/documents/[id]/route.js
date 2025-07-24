import { NextResponse } from "next/server";
import { requireDocumentAccess } from "../../../../lib/auth.js";
import { DocumentService } from "../../../../lib/firestore.js";
import { CloudStorageService } from "../../../../lib/storage.js";

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

// DELETE - Delete document and its file from storage
async function DELETE(request, { params }) {
  return requireDocumentAccess(async (request) => {
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

      // Get all versions of this document
      const allVersions = await DocumentService.getAllDocumentVersions(
        document.originalDocumentId || documentId
      );

      const deletionResults = {
        deletedDocuments: 0,
        deletedFiles: 0,
        failedFiles: [],
        errors: [],
      };

      // Delete all versions and their files
      for (const version of allVersions) {
        try {
          // Delete from Firestore first
          await DocumentService.deleteDocument(version.id);
          deletionResults.deletedDocuments++;

          // Delete file from storage
          if (version.filePath) {
            try {
              await CloudStorageService.deleteFile(version.filePath);
              deletionResults.deletedFiles++;
            } catch (storageError) {
              console.error(
                `Failed to delete file ${version.filePath}:`,
                storageError
              );
              deletionResults.failedFiles.push({
                path: version.filePath,
                error: storageError.message,
              });
            }
          }

          // Delete thumbnail if exists
          if (version.thumbnailPath) {
            try {
              await CloudStorageService.deleteFile(version.thumbnailPath);
              deletionResults.deletedFiles++;
            } catch (storageError) {
              console.error(
                `Failed to delete thumbnail ${version.thumbnailPath}:`,
                storageError
              );
              deletionResults.failedFiles.push({
                path: version.thumbnailPath,
                error: storageError.message,
              });
            }
          }
        } catch (error) {
          console.error(`Error deleting version ${version.id}:`, error);
          deletionResults.errors.push({
            versionId: version.id,
            error: error.message,
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: deletionResults,
        message: `Deleted ${deletionResults.deletedDocuments} documents and ${deletionResults.deletedFiles} files`,
      });
    } catch (error) {
      console.error("Delete document error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to delete document" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE, GET, PUT };
