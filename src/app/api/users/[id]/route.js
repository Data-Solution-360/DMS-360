import { requireAuth } from "@/lib/auth.js";
import { adminAuth, adminDb } from "@/lib/firebase-admin.js";
import { UserService } from "@/lib/services/index.js";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

// GET - Get user by ID
async function GET(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          { success: false, error: "User ID is required" },
          { status: 400 }
        );
      }

      const user = await UserService.getUserById(id);

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update user (unchanged)...

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

export { DELETE, GET };
