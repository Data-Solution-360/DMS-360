import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth.js";
import { DocumentService } from "../../../../../lib/firestore.js";

// POST - Restore deleted document
async function POST(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;

      // Get the document
      const document = await DocumentService.getDocumentById(id);
      if (!document) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // Restore the document by setting isActive to true
      const restoredDocument = await DocumentService.updateDocument(id, {
        isActive: true,
      });

      return NextResponse.json({
        success: true,
        data: restoredDocument,
        message: "Document restored successfully",
      });
    } catch (error) {
      console.error("Restore document error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
