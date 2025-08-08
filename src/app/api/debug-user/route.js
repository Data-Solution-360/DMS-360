import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth.js";

export async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;
      
      console.log("�� Debug user data:", {
        id: user.id,
        email: user.email,
        role: user.role,
        hasDocumentAccess: user.hasDocumentAccess,
        emailVerified: user.emailVerified,
        firebaseUid: user.firebaseUid,
        allFields: Object.keys(user)
      });
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          hasDocumentAccess: user.hasDocumentAccess,
          emailVerified: user.emailVerified,
          firebaseUid: user.firebaseUid,
          allFields: Object.keys(user)
        }
      });
      
    } catch (error) {
      console.error("❌ Debug user error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          stack: error.stack
        },
        { status: 500 }
      );
    }
  })(request);
}
