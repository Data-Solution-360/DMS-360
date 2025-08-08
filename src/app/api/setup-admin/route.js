import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth.js";
import { UserService } from "../../../lib/services/index.js";

export async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const currentUser = request.user.user;

      // Update current user to admin role
      await UserService.updateUser(currentUser.id, {
        role: "admin",
        hasDocumentAccess: true,
      });

      return NextResponse.json({
        success: true,
        message: "User role updated to admin successfully",
      });
    } catch (error) {
      console.error("Setup admin error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  })(request);
}
