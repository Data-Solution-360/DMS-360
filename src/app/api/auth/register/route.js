import { NextResponse } from "next/server";
import { UserService } from "../../../../lib/services/index.js";
import { requireAuth } from "../../../../lib/auth.js";

// POST - User registration for Firebase Auth
// Note: This is typically called after Firebase Auth user creation
async function POST(request) {
  try {
    const {
      email,
      name,
      role = "employee",
      firebaseUid,
    } = await request.json();

    if (!email || !name || !firebaseUid) {
      return NextResponse.json(
        { success: false, error: "Email, name, and Firebase UID are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 }
      );
    }

    // Generate unique 6-digit UID for internal reference
    const customUid = await UserService.generateUniqueUid();

    // Create user record in Firestore
    const userData = {
      uid: customUid, // Our custom 6-digit UID
      firebaseUid, // Firebase Authentication UID
      email: email.toLowerCase(),
      name,
      role,
      hasDocumentAccess: false,
      createdAt: new Date().toISOString(),
    };

    const user = await UserService.createUser(userData);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasDocumentAccess: user.hasDocumentAccess,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export { POST };
