import { NextResponse } from "next/server";
import { UserService } from "../../../../lib/services/index.js";
import { requireAuth } from "../../../../lib/auth.js";

// GET - Search users
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");

      if (!query || query.trim().length < 2) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      const users = await UserService.searchUsers(query.trim());

      // Remove password from response
      const usersWithoutPassword = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return NextResponse.json({
        success: true,
        data: usersWithoutPassword,
      });
    } catch (error) {
      console.error("Search users error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
