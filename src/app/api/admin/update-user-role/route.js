import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { UserService } from "../../../../lib/services/index.js";

export async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const { userId, newRole } = await request.json();
      const currentUser = request.user.user;
      
      // Only allow admins to update roles, or allow self-update for testing
      if (currentUser.role !== "admin" && currentUser.id !== userId) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
      
      await UserService.updateUser(userId, { role: newRole });
      
      return NextResponse.json({
        success: true,
        message: `User role updated to ${newRole}`
      });
      
    } catch (error) {
      console.error("Update user role error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  })(request);
}
