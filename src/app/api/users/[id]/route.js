import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { UserService } from "../../../../lib/firestore.js";

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

export { GET };
