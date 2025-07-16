import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "../../../../lib/auth.js";

// POST - Refresh Firebase token
async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "ID token is required" },
        { status: 400 }
      );
    }

    // Verify the fresh token
    const decoded = await verifyFirebaseToken(idToken);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Create the response and set the fresh token cookie
    const response = NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
    });

    // Set the fresh token as HTTP-only cookie
    response.cookies.set("firebaseToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Token refresh failed" },
      { status: 500 }
    );
  }
}

export { POST };
