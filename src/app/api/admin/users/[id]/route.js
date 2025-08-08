import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth.js";
import { adminAuth, adminDb } from "../../../../../lib/firebase-admin.js";

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

// DELETE - Soft delete user
async function DELETE(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = await params;

      const userRef = adminDb.collection("users").doc(id);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const userData = userDoc.data();

      // If already in trash, return success
      if (userData.inTrash) {
        return NextResponse.json({
          success: true,
          message: "User is already in trash",
        });
      }

      // Create a trashbox entry with a snapshot for listing
      await adminDb.collection("trashbox").add({
        type: "user",
        docId: id, // keep exact key name as requested
        originalCollection: "users",
        data: {
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "",
          mobile: userData.mobile || "",
          createdAt: userData.createdAt || null,
          firebaseUid: userData.firebaseUid || null,
        },
        deletedAt: FieldValue.serverTimestamp(),
        deletedBy: request.user?.uid || "system",
      });

      // Flag user as inactive and in trash
      await userRef.update({
        status: false,
        inTrash: true,
        deletedAt: FieldValue.serverTimestamp(),
        deletedBy: request.user?.uid || "system",
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Disable Firebase Auth user
      if (userData.firebaseUid) {
        try {
          await adminAuth.updateUser(userData.firebaseUid, { disabled: true });
        } catch (authError) {
          console.error("Error disabling Firebase Auth user:", authError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "User moved to trash",
      });
    } catch (error) {
      console.error("Error soft-deleting user:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete user" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE, PUT };
