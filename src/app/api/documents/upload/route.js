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

// POST - Upload document
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const form = formidable({
        maxFileSize: 50 * 1024 * 1024, // 50MB limit
        allowEmptyFiles: false,
        filter: ({ mimetype }) => {
          // Allow common document types
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
      const folderId = fields.folderId?.[0] || null;
      const tags = fields.tags?.[0] ? JSON.parse(fields.tags[0]) : [];
      const description = fields.description?.[0] || "";

      // Read file buffer
      const fileBuffer = await file.toBuffer();

      // Upload to Firebase Storage
      const uploadResult = await firebaseUploadService.uploadFile(
        fileBuffer,
        file.originalFilename,
        file.mimetype,
        folderId ? `folders/${folderId}/documents` : "documents"
      );

      // Create document record in Firestore
      const documentData = {
        name: file.originalFilename,
        originalName: file.originalFilename,
        mimeType: file.mimetype,
        size: file.size,
        folderId: folderId,
        firebaseStorageUrl: uploadResult.downloadURL,
        firebaseStoragePath: uploadResult.storagePath,
        content: description,
        tags: tags,
        createdBy: request.user.userId,
        createdByEmail: request.user.email,
        createdByName: request.user.name,
        version: 1,
        isLatestVersion: true,
        isActive: true,
      };

      const document = await DocumentService.createDocument(documentData);

      return NextResponse.json({
        success: true,
        data: document,
        message: "Document uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { success: false, error: "Upload failed" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
