import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../../lib/auth.js";
import { adminDb } from "../../../../../../lib/firebase-admin.js";

async function DELETE(request, { params }) {
  return requireAuth(async () => {
    try {
      const { id } = await params;

      const trashRef = adminDb.collection("trashbox").doc(id);
      const trashDoc = await trashRef.get();
      if (!trashDoc.exists) {
        return NextResponse.json(
          { success: false, error: "Trash item not found" },
          { status: 404 }
        );
      }

      const trashData = trashDoc.data();
      if (trashData.type !== "document" || !trashData.docId) {
        return NextResponse.json(
          { success: false, error: "Invalid trash item" },
          { status: 400 }
        );
      }

      const documentRef = adminDb.collection("documents").doc(trashData.docId);
      const documentDoc = await documentRef.get();

      if (documentDoc.exists) {
        await documentRef.delete();
      }

      await trashRef.delete();

      return NextResponse.json({
        success: true,
        message: "Document permanently deleted",
      });
    } catch (error) {
      console.error("Error permanently deleting document:", error);
      return NextResponse.json(
        { success: false, error: "Failed to permanently delete document" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE };
