import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../../lib/auth.js";
import { adminDb } from "../../../../../../lib/firebase-admin.js";

async function POST(request, { params }) {
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
      const documentSnap = await documentRef.get();
      if (!documentSnap.exists) {
        return NextResponse.json(
          { success: false, error: "Original document not found" },
          { status: 404 }
        );
      }

      // Reactivate the document
      await documentRef.update({
        inTrash: false,
        updatedAt: FieldValue.serverTimestamp(),
        // Optionally remove deletion metadata
        deletedAt: FieldValue.delete(),
        deletedBy: FieldValue.delete(),
      });

      // Remove from trashbox
      await trashRef.delete();

      return NextResponse.json({
        success: true,
        message: "Document restored successfully",
      });
    } catch (error) {
      console.error("Error restoring document:", error);
      return NextResponse.json(
        { success: false, error: "Failed to restore document" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
