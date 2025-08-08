import { requireAuth } from "@/lib/auth.js";
import { adminAuth, adminDb } from "@/lib/firebase-admin.js";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

// PUT - Update user
async function PUT(request, { params }) {
  return requireAuth(async (request) => {
    try {
      // Fix: await params before destructuring
      const { id } = await params;
      const { name, mobile, role, status } = await request.json();

      if (!name || !role) {
        return NextResponse.json(
          {
            success: false,
            error: "Name and role are required",
          },
          { status: 400 }
        );
      }

      // Get user document
      const userDoc = await adminDb.collection("users").doc(id).get();
      if (!userDoc.exists) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const userData = userDoc.data();

      // Fix: Handle undefined status value
      const updateData = {
        name,
        mobile: mobile || "",
        role,
        hasDocumentAccess: role === "admin" || role === "manager",
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: request.user?.uid || "system",
      };

      // Only add status if it's defined
      if (status !== undefined) {
        updateData.status = status;
      }

      // Update user in Firestore
      await adminDb.collection("users").doc(id).update(updateData);

      // Update user in Firebase Auth if status changed
      if (userData.firebaseUid && status !== undefined) {
        await adminAuth.updateUser(userData.firebaseUid, {
          displayName: name,
          disabled: !status,
        });
      }

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update user" },
        { status: 500 }
      );
    }
  })(request);
}

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
      if (trashData.type !== "user" || !trashData.docId) {
        return NextResponse.json(
          { success: false, error: "Invalid trash item" },
          { status: 400 }
        );
      }

      const userRef = adminDb.collection("users").doc(trashData.docId);
      const userDoc = await userRef.get();

      // Attempt to delete Firebase Auth user if we have an ID
      const firebaseUid =
        (userDoc.exists && userDoc.data().firebaseUid) ||
        trashData.data?.firebaseUid ||
        null;

      if (firebaseUid) {
        try {
          await adminAuth.deleteUser(firebaseUid);
        } catch (authError) {
          console.error("Error deleting Firebase Auth user:", authError);
          // continue with Firestore deletion
        }
      }

      if (userDoc.exists) {
        await userRef.delete();
      }

      await trashRef.delete();

      return NextResponse.json({
        success: true,
        message: "User permanently deleted",
      });
    } catch (error) {
      console.error("Error permanently deleting user:", error);
      return NextResponse.json(
        { success: false, error: "Failed to permanently delete user" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE, PUT };
