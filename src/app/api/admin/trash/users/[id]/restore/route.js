import { requireAuth } from "@/lib/auth.js";
import { adminAuth, adminDb } from "@/lib/firebase-admin.js";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

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
      if (trashData.type !== "user" || !trashData.docId) {
        return NextResponse.json(
          { success: false, error: "Invalid trash item" },
          { status: 400 }
        );
      }

      const userRef = adminDb.collection("users").doc(trashData.docId);
      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        // If user doc missing, we can recreate minimal doc or return error.
        return NextResponse.json(
          { success: false, error: "Original user document not found" },
          { status: 404 }
        );
      }

      const existing = userSnap.data();

      // Reactivate the user
      await userRef.update({
        status: true,
        inTrash: false,
        updatedAt: FieldValue.serverTimestamp(),
        // Optionally remove deletion metadata
        deletedAt: FieldValue.delete(),
        deletedBy: FieldValue.delete(),
      });

      const firebaseUid =
        existing.firebaseUid || trashData.data?.firebaseUid || null;

      if (firebaseUid) {
        try {
          await adminAuth.updateUser(firebaseUid, { disabled: false });
        } catch (authError) {
          console.error("Error enabling Firebase Auth user:", authError);
        }
      }

      // Remove from trashbox
      await trashRef.delete();

      return NextResponse.json({
        success: true,
        message: "User restored successfully",
      });
    } catch (error) {
      console.error("Error restoring user:", error);
      return NextResponse.json(
        { success: false, error: "Failed to restore user" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
