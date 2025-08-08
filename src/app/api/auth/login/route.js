import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "../../../../lib/auth.js";
import {
  LoginHistoryService,
  UserService,
} from "../../../../lib/services/index.js";
import {
  getRealIPAddress,
  parseUserAgent,
} from "../../../../lib/utils/browserUtils.js";
import { generateSessionId } from "../../../../lib/utils/sessionUtils.js";

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

    // Get user ID and email - handle undefined values
    const userId = decodedToken.user?.id || decodedToken.uid;
    const userEmail =
      decodedToken.email || decodedToken.user?.email || "unknown@example.com";

    console.log("🔐 Login attempt for user:", userEmail, "with ID:", userId);

    // Generate session ID for browser tracking
    const sessionId = generateSessionId();

    // Create response with user data and session ID
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userEmail,
        name: decodedToken.name || decodedToken.user?.name,
        role: decodedToken.user?.role || "employee",
        hasDocumentAccess: decodedToken.user?.hasDocumentAccess || false,
        firebaseUid: decodedToken.uid,
      },
      sessionId: sessionId, // Include session ID in response
    });

    // Set Firebase token in HTTP-only cookie
    response.cookies.set("firebaseToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Record login history with enhanced tracking
    try {
      const userAgent = request.headers.get("user-agent") || "unknown";
      const browserInfo = parseUserAgent(userAgent);
      const realIP = getRealIPAddress(request);

      const loginHistoryData = {
        userId: userId,
        userEmail: userEmail,
        ipAddress: realIP,
        userAgent: userAgent,
        browserInfo: browserInfo,
        sessionId: sessionId, // Use the generated session ID
        success: true,
      };

      console.log("📝 Recording login history:", loginHistoryData);

      await LoginHistoryService.createLoginHistory(loginHistoryData);
      console.log("✅ Login history recorded successfully");

      // Update user's lastLoginAt
      await UserService.updateUser(userId, {
        lastLoginAt: Timestamp.now(),
      });
      console.log("✅ User lastLoginAt updated");
    } catch (historyError) {
      console.error("❌ Error recording login history:", historyError);
      // Don't fail the login if history recording fails
    }

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export { POST };
