import formidable from "formidable";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { firebaseUploadService } from "../../../../lib/firebaseUpload.js";
import { DocumentService } from "../../../../lib/firestore.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

// POST - Upload new version of document
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const form = formidable({
        maxFileSize: 50 * 1024 * 1024, // 50MB limit
        allowEmptyFiles: false,
        filter: ({ mimetype }) => {
          return (
            (mimetype && mimetype.includes("application/")) ||
            (mimetype && mimetype.includes("text/")) ||
            (mimetype && mimetype.includes("image/")) ||
            (mimetype && mimetype.includes("audio/")) ||
            (mimetype && mimetype.includes("video/"))
          );
        },
      });

      const [fields, files] = await form.parse(request);

      if (!files.file || files.file.length === 0) {
        return NextResponse.json(
          { success: false, error: "No file uploaded" },
          { status: 400 }
        );
      }

      const file = files.file[0];
      const parentDocumentId = fields.parentDocumentId?.[0];
      const description = fields.description?.[0] || "";

      if (!parentDocumentId) {
        return NextResponse.json(
          { success: false, error: "Parent document ID is required" },
          { status: 400 }
        );
      }

      // Get the parent document
      const parentDocument = await DocumentService.getDocumentById(
        parentDocumentId
      );
      if (!parentDocument) {
        return NextResponse.json(
          { success: false, error: "Parent document not found" },
          { status: 404 }
        );
      }

      // Read file buffer
      const fileBuffer = await file.toBuffer();

      // Upload to Firebase Storage
      const uploadResult = await firebaseUploadService.uploadFile(
        fileBuffer,
        file.originalFilename,
        file.mimetype,
        parentDocument.folderId
          ? `folders/${parentDocument.folderId}/documents`
          : "documents"
      );

      // Create new version document
      const newVersionData = {
        name: file.originalFilename,
        originalName: file.originalFilename,
        mimeType: file.mimetype,
        size: file.size,
        folderId: parentDocument.folderId,
        firebaseStorageUrl: uploadResult.downloadURL,
        firebaseStoragePath: uploadResult.storagePath,
        content: description,
        tags: parentDocument.tags || [],
        createdBy: request.user.userId,
        createdByEmail: request.user.email,
        createdByName: request.user.name,
        version: (parentDocument.version || 1) + 1,
        isLatestVersion: true,
        isActive: true,
        parentDocumentId: parentDocumentId,
      };

      const newVersion = await DocumentService.createDocument(newVersionData);

      // Update parent document to not be the latest version
      await DocumentService.updateDocument(parentDocumentId, {
        isLatestVersion: false,
      });

      return NextResponse.json({
        success: true,
        data: newVersion,
        message: "Document version uploaded successfully",
      });
    } catch (error) {
      console.error("Upload version error:", error);
      return NextResponse.json(
        { success: false, error: "Upload failed" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
