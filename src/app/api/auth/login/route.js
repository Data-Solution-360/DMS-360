import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "../../../../lib/auth.js";

// POST - Verify Firebase Auth token
async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "ID token is required" },
        { status: 400 }
      );
    }

    // Verify the Firebase Auth token
    const decodedToken = await verifyFirebaseToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: decodedToken.user?.id || decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.user?.name,
        role: decodedToken.user?.role || "employee",
        hasDocumentAccess: decodedToken.user?.hasDocumentAccess || false,
        firebaseUid: decodedToken.uid,
      },
    });

    // Set Firebase token in HTTP-only cookie
    response.cookies.set("firebaseToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export { POST };
