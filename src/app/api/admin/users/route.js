import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { adminAuth, adminDb } from "../../../../lib/firebase-admin.js";

// POST - Create new user (admin only)
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const formData = await request.formData();

      const email = formData.get("email");
      const password = formData.get("password");
      const name = formData.get("name");
      const role = formData.get("role");
      const mobile = formData.get("mobile");
      const status = formData.get("status") === "true";
      const image = formData.get("image");

      if (!email || !password || !name || !role) {
        return NextResponse.json(
          {
            success: false,
            error: "Email, password, name, and role are required",
          },
          { status: 400 }
        );
      }

      // Check if user already exists in Firebase Auth
      try {
        await adminAuth.getUserByEmail(email);
        return NextResponse.json(
          { success: false, error: "User with this email already exists" },
          { status: 409 }
        );
      } catch (error) {
        // User doesn't exist, continue with creation
      }

      // Create user in Firebase Auth
      const userRecord = await adminAuth.createUser({
        email: email.toLowerCase(),
        password: password,
        displayName: name,
        disabled: !status, // Disable user if status is false
      });

      // Generate unique 6-digit UID for internal reference
      const customUid = Math.floor(100000 + Math.random() * 900000).toString();

      // Create user document in Firestore
      const userData = {
        uid: customUid,
        firebaseUid: userRecord.uid,
        email: email.toLowerCase(),
        name: name,
        role: role,
        password: password,
        mobile: mobile || "",
        status: status,
        hasDocumentAccess: role === "admin" || role === "manager",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: request.user?.uid || "system",
      };

      // Add image URL if image was uploaded
      if (image) {
        // TODO: Upload image to Firebase Storage and get URL
        // userData.profileImage = imageUrl;
      }

      const userDocRef = await adminDb.collection("users").add(userData);

      // Remove sensitive data from response
      const { password: _, ...userWithoutPassword } = userData;

      return NextResponse.json({
        success: true,
        data: {
          id: userDocRef.id,
          ...userWithoutPassword,
        },
        message: "User created successfully",
      });
    } catch (error) {
      console.error("Error creating user:", error);

      // Handle specific Firebase Auth errors
      if (error.code === "auth/email-already-exists") {
        return NextResponse.json(
          { success: false, error: "User with this email already exists" },
          { status: 409 }
        );
      }

      if (error.code === "auth/weak-password") {
        return NextResponse.json(
          {
            success: false,
            error: "Password is too weak. Use at least 6 characters.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to create user" },
        { status: 500 }
      );
    }
  })(request);
}

// GET - Get all users (admin only)
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search");
      const role = searchParams.get("role");
      const status = searchParams.get("status");

      let query = adminDb.collection("users");

      // Apply filters
      if (search) {
        query = query
          .where("name", ">=", search)
          .where("name", "<=", search + "\uf8ff");
      }
      if (role && role !== "all") {
        query = query.where("role", "==", role);
      }
      if (status !== null && status !== undefined) {
        query = query.where("status", "==", status === "true");
      }

      const snapshot = await query.get();
      const users = [];

      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return NextResponse.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch users" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, POST };
