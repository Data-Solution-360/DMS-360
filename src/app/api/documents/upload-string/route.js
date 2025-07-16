import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { DocumentService } from "../../../../lib/firestore.js";

// POST - Upload document as string content
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const { name, content, folderId, tags = [] } = await request.json();

      if (!name || !content) {
        return NextResponse.json(
          { success: false, error: "Name and content are required" },
          { status: 400 }
        );
      }

      // Create document record in Firestore
      const documentData = {
        name: name,
        originalName: name,
        mimeType: "text/plain",
        size: content.length,
        folderId: folderId,
        firebaseStorageUrl: "", // No file storage for string content
        firebaseStoragePath: "",
        content: content,
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
        message: "Document created successfully",
      });
    } catch (error) {
      console.error("Upload string error:", error);
      return NextResponse.json(
        { success: false, error: "Upload failed" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
